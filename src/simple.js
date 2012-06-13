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
if (typeof window.XMLHttpRequest === "undefined") {
	window.XMLHttpRequest = function(){
		return new ActiveXObject("Microsoft.XMLHTTP");
	};
	window.XMLHttpRequest.prototype.isActiveX = true;
} else {
	window.XMLHttpRequest.prototype.isActiveX = false;
}

/*
 * SimpleJS
 * */
var Simple = window.$ = {};
(function(__Simple){
	"use strict";
	
	/*
	 * Internal AJAX operations.
	 * */
	var AJAXInternal = {
		/*
		 * class Request
		 * Basic wrapper of an XMLHttpRequest object.
		 * Is only ever used in the Simple.AJAX function.
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
			this.onRecvRequest = args["onRecvRequest"];
			this.onSuccess = args["onSuccess"];
			this.queryString = __Simple.EncodeQueryString(this.data);
			this.timeBegin = 0;
			this.timeDifference = 0;
			this.timeEnd = 0;
			this.url = __Simple.Exists(args["url"], "/");
			this.urlToOpen = (this.method === "POST") ? this.url : (this.url + "?" + this.queryString);
		}
		
		/* 
		 * Send() returns Nothing
		 * Input: AJAXInternal.Request, Object
			* A "safe" version of XMLHttpRequest.send().
			* Is compatible with both ActiveX-based AJAX and otherwise.
			* */
		Send: function(ajaxRequest, args){
			if (typeof args === CacheInternal.undefined || args === null) {
				if (ajaxRequest.isActiveX) {
					ajaxRequest.send();
				} else {
					ajaxRequest.send(null);
				}
			} else if ("method" in args && "queryString" in args && args.method === "post") {
				ajaxRequest.send(args.queryString);
			} else {
				Send(ajaxRequest, null);
			}
		};
	};
	
	/*
	 * Used to map class names (e.g "[object String]") to their object names (e.g. "string").
	 * Is used by the Simple.Type() function.
	 * */
	var ClassTypesInteral = {
		/* Populated by function at bottom using Simple.Each(). */
	};
	
	/*
	 * Cache of commonly used values.
	 * The following are commonly used values that are cached so that new string
	 * objects don't need to be constantly created.
	 * */
	var CacheInternal = {
		array: "array",
		cookieGetRegex: "=([^;]+);?", /* Passed as an argument to RegExp's constructor. */
		contentType: "Content-type",
		emptyString: "",
		forwardSlash: "/",
		func: "function",
		length: "length",
		nullstr: "null", /* Must use "nullstr" as name. Using "null" does not work in IE6-8. */
		number: "number",
		object: "object",
		on: "on",
		semicolon: ";",
		string: "string",
		timeout: "timeout",
		uint32max: 4294967296,
		undefined: "undefined"
	};
	
	/* 
	 * Used for treating certain objects has shortcuts.
	 * Generally only used when the object is going to be iterated.
	 * */
	var GetInternalShortcut = function(object){
		switch (object){
			case __Simple.Cookie: return __Simple.Cookie.GetAll();
			case __Simple.GET: return __GET;
			default: return object;
		}
	};
	
	/*
	 * Internal DOM operations.
	 * */
	var DOMInternal = {
		busy: false,
		callbacks: [], /* Array of Function */
		ready: false,
		
		/*
		 * ManageEventListener() returns Nothing
		 * Input: Boolean, Mixed, String, Function, Boolean
		     * This function adds or removes an event listener, depending on the
			 * value of the first parameter.
			 * Is called by DOMInternal.ProcessEventListener().
		 * */
		ManageEventListener: function(isAddingEvent, element, event, callback, useCapture){
			if (typeof element !== CacheInternal.undefined && element !== null) {
				if (typeof element.addEventListener !== CacheInternal.undefined) {
					if (typeof useCapture === CacheInternal.undefined) {
						useCapture = false;
					}
					if (isAddingEvent) element.addEventListener(event, callback, useCapture);
					else element.removeEventListener(event, callback, useCapture);
				} else {
					if (isAddingEvent) element.attachEvent(CacheInternal.on+event, callback);
					else element.detachEvent(CacheInternal.on+event, callback);
				}
			}
		},

		/*
		 * ProcessEventListener() returns Nothing
		 * Input: Boolean, Mixed, String, Function, Boolean
		     * Processes any bases elements/events.
		 * */
		ProcessEventListener: function(isAddingEvent, element, event, callback, useCapture){
			if (__Simple.IsString(element)) {
				element = __Simple.DOMElement(element);
			}
			if (__Simple.IsDOMElementArray(element) || __Simple.IsArray(element)) {
				__Simple.Each(element, function(elementItr){
					DOMInternal.ProcessEventListener(isAddingEvent, elementItr.value, event, callback, useCapture);
				});
			} else {
				if (__Simple.IsArray(event)) {
					__Simple.Each(event, function(eventItr){
						DOMInternal.ManageEventListener(isAddingEvent, element, eventItr.value, callback, useCapture);
					});
				} else {
					DOMInternal.ManageEventListener(isAddingEvent, element, event, callback, useCapture);
				}
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
		floatingPoint: /[0-9]+([.][0-9]+)?/g,
		notNumber: /[^0-9.\-+]+/g, /* Used to match anything NOT a number. That is 0-9 and decimal points. */
		number: /([0-9]{1,3}([,][0-9]{3})?)+([.][0-9]+)?/g, /* Used to match any number. Includes commas because some string-numbers use them. */
		queryString: /[?&]?([^&=]+)=?([^&]+)?/g,
		sprintfVariable: /%[b|d|f|h|H|o|s|u|x|X]/g
	};
	
	/*
	 * Internal Sprintf operations.
	 * Should probably cache these string values.
	 * */
	var SprintfInternal = {
		Process: function(type, value){
			switch (type){
				case "%b": return __Simple.ToInt(value).toString(2);
				case "%d": return __Simple.ToInt(value).toString();
				case "%f": return parseFloat(value).toString();
				case "%h": return __Simple.ToInt(value).toString(16);
				case "%H": return __Simple.ToInt(value).toString(16).toUpperCase();
				case "%o": return __Simple.ToInt(value).toString(8);
				case "%u": return __Simple.ToUnsignedInt(value).toString();
				case "%x": return "0x" + __Simple.ToInt(value).toString(16);
				case "%X": return "0x" + __Simple.ToInt(value).toString(16).toUpperCase();
				default: return value;
			}
		}
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
	 * Input: String|DOMElement, String, Function
	 * */
	__Simple.AddEvent = function(element, event, callback, useCapture){
		DOMInternal.ProcessEventListener(true, element, event, callback, useCapture);
	};
	
	/*
	 * ArraysEqual() returns Boolean
	 * Input: Array, Array
	 * */
	__Simple.ArraysEqual = function(first, second){
		var result = false;
		if (__Simple.IsArray([first,second],true) && first.length === second.length) {
			__Simple.Each(first, function(itr){
				return result = __Simple.Equals(itr.value, second[itr.i]);
			});
		}
		return result;
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
					__Simple.Call(ajaxRequest.onRecvRequest);
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
		
		/* Send twice because the request object will also contain the GET/POST
		 * variables being sent through HTTP (that's what the second parameter is for). */
		AJAXInternal.Send(ajaxRequest, ajaxRequest);
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
			return __Simple.HasProperty(__Simple.Cookie.GetAll(), name);
		},
		
		/*
		 * Get() returns String
		 * Input: String
		 * */
		Get: function(name){
			if (__Simple.IsString(name)) {
				var result = new RegExp(name+CacheInternal.cookieGetRegex, "g").exec(document.cookie);
				if (result !== null) {
					return result[1];
				}
			}
		},
		
		/*
		 * GetAll() returns Object
		 * Input: Nothing
		 * */
		GetAll: function(){
			var currentCookie = document.cookie;
			var buffer = RegexInternal.cookie.exec(currentCookie);
			var result = {};
			
			while (buffer !== null) {
				result[buffer[1]] = buffer[2];
				buffer = RegexInternal.cookie.exec(currentCookie);
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
			
			path = __Simple.Exists(path, CacheInternal.forwardSlash);
			document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path="+path;
		}
	};
	
	/*
	 * DOMElement() returns Mixed
	 *	Input: String, Mixed
	 * */
	__Simple.DOMElement = function(elementString, context){
		/* Ensure context is defined. */
		if (typeof context === CacheInternal.undefined) {
			context = document;
		} else if (__Simple.IsString(context)) {
			context = __Simple.DOMElement(context);
		}
		
		var result;
		
		/* Second condition is necessary for IE6-8. */
		if (__Simple.IsDOMElement(context) || context === document) {
			switch (elementString.charAt(0)) {
				case "#": result = context.getElementById(elementString.substring(1)); break;
				case ".": result = context.getElementsByClassName(elementString.substring(1)); break;
				case ":": result = context.getElementsByName(elementString.substring(1)); break;
				default:  result = context.getElementsByTagName(elementString); break;
			}
			
			/* The getElements functions return arrays. Replace any empty ones with NULL values. */
			if (result !== null && __Simple.HasProperty(result, CacheInternal.length) && result.length === 0) {
				result = null;
			}
		}
		
		return result;
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
		     * id=42&name=John%20Doe&type=user
	     * Into an object containing the defined variables.
		 *
		 * Any variables not given a value, like so:
		     * foo&bar&baz
	     * Will be NULL valued in the object.
	 * */
	__Simple.DecodeQueryString = function(queryString){
		var buffer = RegexInternal.queryString.exec(queryString);
		var result = {};
		
		while (buffer !== null) {
			result[decodeURIComponent(buffer[1])] = (
				typeof (buffer[2] !== CacheInternal.undefined) ? decodeURIComponent(buffer[2]) : null
			);
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
			haystack = GetInternalShortcut(haystack);
			
			/* Iterator will hold a reference to haystack. */
			var iterator = new Iterator(haystack);
			
			/* DOMObjectArrays aren't considered arrays for some reason.
  			   So also check for a length property. Need to look into this and improve it. */
			if (__Simple.IsArray(haystack) || __Simple.HasProperty(haystack, CacheInternal.length)) {
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
		     * name=John%20Doe&id=42
	 * */
	__Simple.EncodeQueryString = function(object){
		var result = "";
		
		for (var index in object) {
			result += (encodeURIComponent(index) + "=" + encodeURIComponent(object[index]) + "&");
		}
		
		if (result.length > 0) { /* Trim off the extra ampersand. */
			result = result.substring(0, result.length-1);
		}
		
		return result;
	};
	
	/*
	 * Equals() returns Boolean
	 * Input: Mixed, Mixed
	 */
	__Simple.Equals = function(first, second){
		first = GetInternalShortcut(first);
		second = GetInternalShortcut(second);
		
		var result = false;
		
		if (__Simple.IsArray([first,second],true)) {
			result = __Simple.ArraysEqual(first, second);
		} else if (__Simple.IsObject([first,second],true)) {
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
		 * Input: Array|String
		     * Returns true if the passed GET variable has been defined.
			 * Does not require a value to have been assigned.
		 * */
		Exists: function(name){
			return __Simple.HasProperty(__GET, name);
		},
		
		/*
		 * Get() returns Array|String|undefined
		 * Input: Object|String
		     * Returns the value of the passed GET variable.
			 * If the GET variable has no value assigned this will return NULL.
			 * If the GET variable does not exist this will return undefined.
		 * */
		Get: function(name){
			if (__Simple.IsArray(name)) {
				var result = {};
				__Simple.Each(name, function(itr){
					result[itr.value] = __Simple.GET.Get(itr.value);
				});
				return result;
			} else {
				return __Simple.GET.Exists(name) ? __GET[name] : undefined;
			}
		},
		
		/*
		 * GetAll() returns Object
		 * Input: Nothing
		 * */
		 GetAll: function(){
			var result = {};
			__Simple.Each(__GET, function(itr){
				result[itr.i] = itr.value;
			});
			return result;
		}
	};
	
	/*
	 * GenerateArray() returns Array
	 * Input: Integer, Mixed, Boolean
	 * */
	__Simple.GenerateArray = function(num, value, isCallback){
		var result = [];
		for (var i = 0; i < num; i++) {
			result.push(isCallback ? value(result, i) : value);
		}
		return result;
	};
	
	/*
	 * HasProperty() returns Boolean
	 * Input: Mixed, String
	 * */
	__Simple.HasProperty = function(object, property){
		object = GetInternalShortcut(object);
		
		if (__Simple.IsArray(property)) {
			var result = false;
			__Simple.Each(property, function(itr){
				return result = __Simple.HasProperty(object, itr.value);
			});
			return result;
		} else {
			return typeof object[property] !== CacheInternal.undefined;
		}
	};
	
	/*
	 * HasValue() returns Boolean
	 * Input: Mixed, Mixed
	 * */
	__Simple.HasValue = function(object, value){
		object = GetInternalShortcut(object);
		
		var result = false;
		__Simple.Each(object, function(itr){
			return !(result = __Simple.Equals(value, itr.value));
		});
		return result;
	};
	
	/*
	 * IsEmptyArray() returns Boolean
	 * Input: Array, Boolean
	 * */
	__Simple.IsArray = function(source, doIterateSource){
		if (typeof doIterateSource !== CacheInternal.undefined && doIterateSource) {
			var result = false;
			__Simple.Each(source, function(itr){
				return result = __Simple.IsArray(itr.value);
			});
			return result;
		} else {
			return (__Simple.Type(source) === CacheInternal.array);
		}
	};
	
	/*
	 * IsObject() returns Boolean
	 * Input: Array|Object, Boolean
	 * */
	__Simple.IsObject = function(source, doIterateSource){
		if (typeof doIterateSource !== CacheInternal.undefined && doIterateSource) {
			var result = false;
			__Simple.Each(source, function(itr){
				return result = __Simple.IsObject(itr.value);
			});
			return result;
		} else {
			return (__Simple.Type(source) === CacheInternal.object);
		}
	};
	
	/*
	 * IsEmptyArray() returns Boolean
	 * Input: Array
	 * */
	__Simple.IsEmptyArray = function(object){
		return __Simple.IsArray(object) && object.length === 0;
	};
	
	/*
	 * IsEmptyObject() returns Boolean
	 * Input: Mixed
	     * Borrowed from jQuery.
	 * */
	__Simple.IsEmptyObject = function(object){
		for (var index in GetInternalShortcut(object)) {
			return false;
		}
		return true;
	};
	
	/*
	 * IsDOMElementArray() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsDOMElementArray = function(arr){
		return typeof arr !== CacheInternal.undefined && arr !== null && __Simple.IsDOMElement(arr[0]) && __Simple.HasProperty(arr, "item");
	};
	
	/*
	 * IsDOMElement() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsDOMElement = function(object){
		return typeof object !== CacheInternal.undefined && object !== null && __Simple.HasProperty(object, "ELEMENT_NODE");
	};
	
	/*
	 * IsNumeric() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsNumeric = function(object){
		return !isNaN(parseFloat(object)) && isFinite(object);
	};
	
	/*
	 * IsString() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsString = function(object){
		return __Simple.Type(object) === CacheInternal.string;
	};
	
	/*
	 * RemoveEvent() returns Nothing
	 * Input: String|DOMElement, String, Function
	 * */
	__Simple.RemoveEvent = function(element, event, callback, useCapture){
		DOMInternal.ProcessEventListener(false, element, event, callback, useCapture);
	};
	
	/*
	 * ToInt() returns Integer
	 * Input: Mixed, Integer
	 * */
	__Simple.ToInt = function(source, base){
		if (__Simple.Type(source) !== CacheInternal.number) {
			var result = source.match(RegexInternal.number);
			if (result !== null && result.length === 1) {
				return parseInt(source.replace(RegexInternal.notNumber, CacheInternal.emptyString), __Simple.Exists(base, 10));
			} else {
				return NaN;
			}
		} else {
			return parseInt(source, __Simple.Exists(base, 10));
		}
	};
	
	/*
	 * ToUnsignedInt() returns Integer
	 * Input: Mixed
	 * */
	__Simple.ToUnsignedInt = function(source, base){
		if (source = __Simple.ToInt(source, base)) {
			return (source > 0) ? source : (CacheInternal.uint32max - Math.abs(source));
		} else {
			return source;
		}
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
		object = GetInternalShortcut(object);
		var result = [[],[]];
		
		__Simple.Each(object, function(itr){
			result[0].push(itr.i);
			result[1].push(itr.value);
		});
		
		return result;
	};
	
	/*
	 * Sprintf() returns String
	 * Input: String[, Array|String ...]
	 * */
	__Simple.Sprintf = function(source){
		if (arguments.length > 1) {
			/* The values may be in the arguments array,
			 * or may be an array passed as the first argument.
			 * */
			var indexOffset = 1;
			var values = arguments;
			
			if (__Simple.Type(arguments[1]) === CacheInternal.array) {
				indexOffset = 0;
				values = arguments[1];
			}
			
			var variables = source.match(RegexInternal.sprintfVariable);
			var end = (variables) ? variables.length : 0;

			/* Replace each sprintf variable with the appropriate values. */
			for (var i = 0; i < end; i++) {
				source = source.replace(
					variables[i], 
					SprintfInternal.Process(variables[i], values[i+indexOffset].toString())
				);
			}
		}
		
		return source;
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