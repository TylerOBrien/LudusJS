/*
 * SimpleJS
 * https://github.com/TylerOBrien/SimpleJS
 *
 * Copyright (c) 2012 Tyler O'Brien
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */
 
/*
 * AJAX fallback for IE6.
 * Might not work for IE5 and earlier.
 * */
if (typeof XMLHttpRequest === "undefined") {
	var XMLHttpRequest = function(){
		return new ActiveXObject("Microsoft.XMLHTTP");
	};
	XMLHttpRequest.prototype.isActiveX = true;
} else {
	XMLHttpRequest.prototype.isActiveX = false;
}

/* 
 * send_s() returns Nothing
 * Input: Object
    * A "safe" version of XMLHttpRequest.send().
    * Is compatible with both ActiveX-based AJAX and otherwise.
    * */
XMLHttpRequest.prototype.send_s = function(args){
	if (typeof args === "undefined" || args === null) {
		if (this.isActiveX) {
			this.send();
		} else {
			this.send(null);
		}
	} else if ("method" in args && "queryString" in args && args.method === "post") {
		this.send(args.queryString);
	} else {
		this.send_s();
	}
};

/*
 * SimpleJS
 * */
var Simple = {"ietest":true};
(function(__Simple){
	"use strict";
	
	/*
	 * Internal AJAX operations.
	 * */
	var AJAXInternal = {
		/*
		 * class Request
		 *
		 * */
		Request: function(args){
			this.async = __Simple.Exists(args["async"], true);
			this.charset = __Simple.Exists(args["charset"], "utf-8");
			this.contentType = __Simple.Exists(args["contentType"], "application/x-www-form-urlencoded");
			this.data = __Simple.Exists(args["data"], {});
			this.http = new XMLHttpRequest();
			this.method = __Simple.Exists(args["method"], "GET");
			this.onError = args["onError"];
			this.onConnect = args["onConnect"];
			this.onNotFound = args["onNotFound"];
			this.onProcess = args["onProcess"];
			this.onRequest = args["onRequest"];
			this.onSuccess = args["onSuccess"];
			this.queryString = __Simple.EncodeQueryString(this.data);
			this.timeBegin = 0;
			this.timeDifference = 0;
			this.timeEnd = 0;
			this.url = __Simple.Exists(args["url"], "/");
			this.urlToOpen = (this.method === "POST") ? this.url : (this.url + "?" + this.queryString);
		}
	};
	
	/*
	 * Used to map class names (e.g "[object String]") to their object names (e.g. "string").
	 * Is used by the Simple.Type() function.
	 * */
	var ClassTypesInteral = {
		/* Populated by function at bottom using Simple.Each(). */
	};
	
	/*
	 * Cache of commonly used strings.
	 * The following are commonly used strings that are cached so that new string
	 * objects don't need to be constantly created.
	 * */
	var CacheInternal = {
		array: "array",
		contentType: "Content-type",
		forwardSlash: "/",
		func: "function",
		length: "length",
		nullstr: "null", /* Must use "nullstr" as name. Using "null" does not work in IE6-8. */
		number: "number",
		object: "object",
		semicolon: ";",
		string: "string",
		timeout: "timeout",
		undefined: "undefined"
	};
	
	/*
	 * Internal DOM operations performed here.
	 * */
	var DOMInternal = {
		busy: false,
		callbacks: [], /* Array of Function */
		ready: false,
		
		/*
		 * AddEventListener() returns Nothing
		 * Input: DOMObject, String, Function
		 * */
		AddEventListener: function(element, event, callback, useCapture){
			/* Look for "funcion" vs "undefined".
			 * Comparing "length" is cheaper than comparing the string's value.
			 * */
			if ((typeof element.addEventListener).length === 8) {
				if (typeof useCapture === CacheInternal.undefined) {
					useCapture = false;
				}
				element.addEventListener(event, callback, useCapture);
			} else {
				element.attachEvent("on"+event, callback);
			}
		},
		
		/*
		 * OnDOMContentLoaded() returns Nothing
		 * Input: Nothing
		     * Called by one of two possible event listeners.
			 * As function name suggests, is called when the DOM has finished loading.
		 * */
		OnDOMContentLoaded: function(){
			if (typeof document.addEventListener !== CacheInternal.undefined) {
				document.removeEventListener("DOMContentLoaded", DOMInternal.OnDOMContentLoaded, false);
				DOMInternal.OnReady();
			} else if (typeof document.attachEvent !== CacheInternal.undefined && document.readyState === "complete" && document.body !== null) {
				document.detachEvent("onreadystatechange", DOMInternal.OnDOMContentLoaded);
				DOMInternal.OnReady();
			}
		},
		
		/*
		 * OnReady() returns Nothing
		 * Input: Nothing
		     * Called when the DOM is ready.
			 * Is usually called by DOMInternal.OnDOMContentLoaded.
		 * */
		OnReady: function(){
			if (this.busy === false && this.ready === false) {
				this.busy = true;
				Simple.Each(this.callbacks, function(itr){
					itr.value();
				});
				this.ready = true;
				this.busy = false;
			}
		}
	};
	
	/*
	 * Internal regular expressions.
	 * */
	var RegexInternal = {
		cookie: /[ ]?([^=]+)=([^;]+)[; ]?/g,
		queryString: /[?&]?([^&=]+)=?([^&]+)?/g
	};
	
	/*
	 * class Iterator
	 * Used for storing iteration informating by the Simple.Each function.
	 * Is only used internally, so there's no point in making it public-facing.
	 * */
	var Iterator = function(container){
		this.container = container;
		this.i = null;
		this.value = null;
	};
	
	/*
	 * AddEvent() returns Nothing
	 * Input: String|DOMObject, String, Function
	 * */
	__Simple.AddEvent = function(element, event, callback, useCapture){
		if (__Simple.Type(element) === CacheInternal.string) {
			element = __Simple.DOMElement(element);
		}
		if (typeof element[CacheInternal.length] !== CacheInternal.undefined) {
			__Simple.Each(element, function(elementItr){
				if (__Simple.Type(event) === CacheInternal.array) {
					__Simple.Each(event, function(eventItr){
						DOMInternal.AddEventListener(elementItr.value, eventItr.value, callback, useCapture);
					});
				} else {
					DOMInternal.AddEventListener(elementItr.value, event, callback, useCapture);
				}
			});
		} else {
			if (__Simple.Type(event) === CacheInternal.array) {
				__Simple.Each(event, function(eventItr){
					DOMInternal.AddEventListener(element, eventItr.value, callback);
				});
			} else {
				DOMInternal.AddEventListener(element, event, callback);
			}
		}
	};
	
	/*
	 * AJAX() returns nothing
	 * Input: Object
	 * */
	__Simple.AJAX = function(args){
		var ajaxRequest = new AJAXInternal.Request(args);
		
		ajaxRequest.http.open(ajaxRequest.method, ajaxRequest.urlToOpen, ajaxRequest.async);
		ajaxRequest.http.setRequestHeader(CacheInternal.contentType, ajaxRequest.contentType+"; charset="+ajaxRequest.charset);
		ajaxRequest.http.onreadystatechange = function(){
			switch (ajaxRequest.http.readyState) {
				case 1: /* CONNECT */
					ajaxRequest.timeBegin = new Date().getTime();
					__Simple.Call(ajaxRequest.onConnect);
				break;
				case 2: /* REQUEST RECEIVED */
					__Simple.Call(ajaxRequest.onRequest);
				break;
				case 3: /* PROCESSING */
					__Simple.Call(ajaxRequest.onProcess);
				break;
				case 4: /* COMPLETE */
					if (typeof ajaxRequest.timeout !== CacheInternal.undefined) {
						clearTimeout(ajaxRequest.timeout);
					}
					
					ajaxRequest.timeEnd = new Date().getTime();
					ajaxRequest.timeDifference = (ajaxRequest.timeEnd - ajaxRequest.timeBegin);
					
					switch (ajaxRequest.http.status) {
						case 200: __Simple.Call(ajaxRequest.onSuccess, ajaxRequest.http.responseText, ajaxRequest.timeDifference);
						break;
						case 404: __Simple.Call(ajaxRequest.onNotFound, ajaxRequest.http.responseText, ajaxRequest.timeDifference);
						default:  __Simple.Call(ajaxRequest.onError, [ajaxRequest.http.responseText,ajaxRequest.http.status], ajaxRequest.timeDifference);
						break;
					}
				break;
			}
		};
		
		/*
		 * Add a new timeout if one is given.
		 * The time is assumed to be milliseconds.
		 * */
		if (typeof args[CacheInternal.timeout] === CacheInternal.number) {
			ajaxRequest.timeout = setTimeout(function(){
				ajaxRequest.http.abort();
				__Simple.Call(ajaxRequest.onTimeout);
			}, args[CacheInternal.timeout]);
		}
		
		ajaxRequest.http.send_s(ajaxRequest);
	};
	
	/*
	 * Call() returns Mixed
	 * Input: Mixed, Mixed, Mixed
	 * */
	__Simple.Call = function(callback, first, second){
		if (__Simple.Type(callback) === CacheInternal.func) {
			if (typeof second !== CacheInternal.undefined) return callback(first, second);
			else if (typeof first !== CacheInternal.undefined) return callback(first);
			else return callback();
		}
	};
	
	/*
	 * Functions for getting and setting cookies.
	 * */
	__Simple.Cookie = {
		/*
		 * Exists() returns Boolean
		 * Input: String
		 * */
		Exists: function(name){
			return __Simple.Cookie.Get(name) !== undefined;
		},
		
		/*
		 * Get() returns String
		 * Input: String
		 * */
		Get: function(name){
			if (__Simple.Type(name) === CacheInternal.string) {
				var result = new RegExp(name+"=([^;]+);?", "g").exec(document.cookie);
				if (result !== null) {
					return result[1];
				}
			}
			
			return undefined;
		},
		
		/*
		 * GetAll() returns Object
		 * Input: Nothing
		 * */
		GetAll: function(){
			var buffer = RegexInternal.cookie.exec(document.cookie);
			var result = {};
			
			while (buffer !== null) {
				result[buffer[1]] = buffer[2];
				buffer = RegexInternal.cookie.exec(document.cookie);
			}
			
			return result;
		},
		
		/*
		 * Set() returns Nothing
		 * Input: String, String, Object
		 * */
		Set: function(name, value, milliseconds, path){
			var date = new Date;
			var expiration = new Date(milliseconds);
			
			date.setTime(date.getTime() + expiration.getTime());
			
			if (typeof path === CacheInternal.undefined) {
				path = CacheInternal.forwardSlash;
			}
			
			document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path="+path;
		}
	};
	
	/*
	 * DOMElement() returns Mixed
	 *	Input: String, Mixed
	 * */
	__Simple.DOMElement = function(elementString, context){
		if (typeof context === CacheInternal.undefined) {
			context = document;
		}
		
		switch (elementString[0]) {
			case "#": return context.getElementById(elementString.substring(1));
			case ".": return context.getElementsByClassName(elementString.substring(1));
			case ":": return context.getElementsByName(elementString.substring(1));
			default:  return context.getElementsByTagName(elementString);
		}
	};
	
	/*
	 * DOMReady() returns nothing
	 * Input: Function
	     * Calls the passed function when the DOM is ready.
	 * */
	__Simple.DOMReady = function(callback){
		if (__Simple.Type(callback) === CacheInternal.func) {
			if (DOMInternal.ready === false && DOMInternal.busy === false) {
				DOMInternal.callbacks.push(callback);
			} else {
				callback();
			}
		}
	};
	
	/*
	 * DecodeQueryString() returns Object
	 * Input: String
	     * Converts a passed query string in this format:
		     * id=42&name=John+Doe&type=user
	     * Into an object containing the defined variables.
		 * All instances of "+" will be converted to spaces.
		 *
		 * Any variables not given a value, like so:
		     * foo&bar&baz
	     * Will be NULL valued in the object.
	 * */
	__Simple.DecodeQueryString = function(queryString){
		queryString = queryString.replace("+", " ");
		
		var buffer = RegexInternal.queryString.exec(queryString);
		var result = {};
		
		while (buffer !== null) {
			result[decodeURIComponent(buffer[1])] = (typeof buffer[2] !== CacheInternal.undefined ? decodeURIComponent(buffer[2]) : null);
			buffer = RegexInternal.queryString.exec(queryString);
		}
		
		return result;
	};
	
	/*
	 * Simple.Each() returns nothing
	 * Input: Mixed, Function
	 * */
	__Simple.Each = function(haystack, callback){
		if (typeof haystack !== CacheInternal.undefined) {
			/* Possible haystack shortcuts. */
			if (haystack === __Simple.Cookie) haystack = __Simple.Cookie.GetAll();
			else if (haystack === __Simple.GET) haystack = __GET;
			
			/* Iterator will hold a reference to haystack. */
			var iterator = new Iterator(haystack);
			
			/* Presumably only an Array will have a "length" property. */
			if (typeof haystack[CacheInternal.length] !== CacheInternal.undefined) {
				iterator.i = 0;
				var end = haystack.length;
				for (; iterator.i < end; iterator.i++) {
					iterator.value = haystack[iterator.i];
					if (callback.call(iterator.value, iterator) === false) {
						break;
					}
				}
			} else {
				for (iterator.i in haystack) {
					iterator.value = haystack[iterator.i];
					if (callback.call(iterator.value, iterator) === false) {
						break;
					}
				}
			}
		}
	};
	
	/*
	 * EncodeQueryString() returns String
	 * Input: Object
	     * Encodes a passed Object into a query string.
		 * For example, this:
		     * {name:"John Doe", id:42}
	     * Would become:
		     * name=John+Doe&id=42
	 * */
	__Simple.EncodeQueryString = function(object){
		var result = "";
		for (var index in object) {
			result += (index + "=" + object[index] + "&");
		}
		
		if (result.length > 0) { /* Trim off the extra ampersand. */
			result = result.substring(0, result.length-1);
		}
		return result.replace(" ", "+");
	};
	
	/*
	 * Equals() returns Boolean
	 * Input: Mixed, Mixed
	 */
	__Simple.Equals = function(first, second){
		/* Possible haystack shortcuts */
		if (first === __Simple.Cookie) first = __Simple.Cookie.GetAll();
		else if (first === __Simple.GET) first = __GET;
		if (second === __Simple.Cookie) second = __Simple.Cookie.GetAll();
		else if (second === __Simple.GET) second = __GET;
		
		var firstType = __Simple.Type(first);
		var secondType = __Simple.Type(second);
		var result = true;
		
		if (firstType === CacheInternal.array && secondType === CacheInternal.array) {
			if (first.length !== second.length) {
				result = false;
			} else {
				__Simple.Each(first, function(itr){
					if (itr.value !== second[itr.i]) {
						return result = false;
					}
				});
			}
		} else if (firstType === CacheInternal.object && secondType === CacheInternal.object) {
			var firstArr = __Simple.ObjectToArray(first);
			var secondArr = __Simple.ObjectToArray(second);
			result = __Simple.Equals(firstArr[0], secondArr[0]) && __Simple.Equals(firstArr[1], secondArr[1]);
		} else {
			result = (first === second);
		}
		
		return result;
	};
	
	/*
	 * Exists() returns Mixed
	 * Input: Mixed, Mixed, Boolean
	     * Used for determining if "object" is defined.
		 * If defined "object" will be returned, otherwise "override" is returned.
		 * If "doReturnBoolean" is true then false/true is returned in place of object/override.
	 * */
	__Simple.Exists = function(object, override, doReturnBoolean){
		var useBool = (typeof doReturnBoolean !== CacheInternal.undefined && doReturnBoolean);
		
		if (typeof object !== CacheInternal.undefined) {
			if (useBool) return true;
			else return object;
		} else {
			if (useBool) return false;
			else return override;
		}
	};
	
	/*
	 * GET
	 * Contains functions for accessing GET variables.
	 * */
	__Simple.GET = {
		/*
		 * Exists() returns Boolean
		 * Input: String
		     * Returns true if the passed GET variable has been defined.
			 * Does not require a value to have been assigned.
		 * */
		Exists: function(name){
			return typeof __GET[name] !== CacheInternal.undefined;
		},
		
		/*
		 * Exists() returns String|undefined
		 * Input: String
		     * Returns the value of the passed GET variable.
			 * If the GET variable has no value assigned this will return NULL.
			 * If the GET variable does not exist this will return undefined.
		 * */
		Find: function(name){
			return __Simple.GET.Exists(name) ? __GET[name] : undefined;
		}
	};
	
	/*
	 * GenerateArray() returns Array
	 * Input: Integer, Mixed, Boolean
	 * */
	__Simple.GenerateArray = function(num, value, isCallback){
		var result = [];
		for (var i = 0; i < num; i++) {
			result.push(isCallback ? value(i) : value);
		}
		return result;
	};
	
	/*
	 * IsEmptyObject() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsEmptyObject = function(object){
		for (var index in object) {
			return false;
		}
		return true;
	};
	
	/*
	 * IsDOMObject() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsDOMObject = function(object){
		return typeof object.ELEMENT_NODE !== CacheInternal.undefined; // Should probably improve this.
	};
	
	/*
	 * IsNumeric() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsNumeric = function(object){
		return !isNaN(parseFloat(object)) && isFinite(object);
	};
	
	/*
	 * Simple.Type() returns String
	 * Input: Mixed
	     * Returns the type of the passed object.
	     * Borrowed from jQuery.
	 * */
	__Simple.Type = function(object){
		return object === null ? CacheInternal.nullstr : (ClassTypesInteral[Object.prototype.toString.call(object)] || CacheInternal.object);
	};
	
	/*
	 * ObjectToArray() returns Array
	 * Input: Object
	 * */
	__Simple.ObjectToArray = function(object){
		var result = [[],[]];
		
		/* Possible haystack shortcuts */
		if (object === __Simple.Cookie) object = __Simple.Cookie.GetAll();
		else if (object === __Simple.GET) object = __GET;
		
		__Simple.Each(object, function(itr){
			result[0].push(itr.i);
			result[1].push(itr.value);
		});
		
		return result;
	};
	
	/*
	 * Populate the class types.
	 * Borrowed from jQuery.
	 * */
	__Simple.Each("Array Boolean Date Function Number Object RegExp String".split(" "), function(itr){
		ClassTypesInteral["[object " + itr.value + "]"] = itr.value.toLowerCase();
	});
	
	/* Decode the browser's query string, if it exists. */
	var __GET = __Simple.DecodeQueryString(document.location.search);
	
	/*
	 * Different/older browsers may have different methods for DOM loading.
	 * Based on jQuery.
	 * */
	if (typeof document.addEventListener !== CacheInternal.undefined) {
		document.addEventListener("DOMContentLoaded", DOMInternal.OnDOMContentLoaded, false);
		window.addEventListener("load", DOMInternal.OnReady, false);
	} else if (typeof document.attachEvent !== CacheInternal.undefined) {
		document.attachEvent("onreadystatechange", DOMInternal.OnDOMContentLoaded);
		window.attachEvent("onload", DOMInternal.OnReady, false);
	} else {
		window.onload = DOMInternal.OnReady;
	}
}(Simple));