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
	} else if ("method" in args && "queryString" in args && args.method === "POST") {
		this.send(args.queryString);
	} else {
		this.send_s();
	}
};

/*
 * SimpleJS
 * */
 
var Simple = {};
(function(__Simple){
	"use strict";
	
	/*
	 * Internal AJAX operations performed here.
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
			this.http = new XMLHttpRequest();
			this.method = __Simple.Exists(args["method"], "GET");
			this.onError = args["onError"];
			this.onConnect = args["onConnect"];
			this.onNotFound = args["onNotFound"];
			this.onProcess = args["onProcess"];
			this.onRequest = args["onRequest"];
			this.onSuccess = args["onSuccess"];
			this.queryString = "";
			this.timeBegin = 0;
			this.timeDifference = 0;
			this.timeEnd = 0;
			this.url = __Simple.Exists(args["url"], "/");
			this.urlToOpen = (this.method === "POST") ? this.url : (this.url + "?" + this.queryString);
		}
	};
	
	var ClassTypesInteral = {
		/* Populated by function at bottom using Simple.Each */
	};
	
	var CookieInternal = {
		data: {},
		
		/*
		 * Update() returns Nothing
		 * Input: Nothing
		     * Updates the cookie data.
	     * */
		Update: function(){
			this.data = {};
			var buffer = null;
			
			__Simple.Each(document.cookie.split(";"), function(){
				if (buffer = RegexInteral.cookie(this)) {
					CookieInternal.data[escape(buffer[1])] = escape(buffer[2]);
				}
			});
		}
	};
	
	/*
	 * Internal DOM operations performed here.
	 * */
	var DOMInternal = {
		busy: false,
		callbacks: [], /* Array of Function */
		ready: false,
		
		/*
		 * OnDOMContentLoaded() returns Nothing
		 * Input: Nothing
		     * Called by one of two possible event listeners.
			 * As function name suggests, is called when the DOM has finished loading.
		 * */
		OnDOMContentLoaded: function(){
			if (typeof document.addEventListener !== "undefined") {
				document.removeEventListener("DOMContentLoaded", DOMInternal.OnDOMContentLoaded, false);
				DOMInternal.OnReady();
			} else if (typeof document.attachEvent !== "undefined" && document.readyState === "complete" && document.body !== null) {
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
				Simple.Each(this.callbacks, function(){
					this.value();
				});
				this.ready = true;
				this.busy = false;
			}
		}
	};
	
	/*
	 * Internal Regular Expressions.
	 * */
	var RegexInternal = {
		cookie: /([^=]+)=(.*)/,
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
	 * AJAX() returns nothing
	 * Input: Object
	 * */
	__Simple.AJAX = function(args){
		var ajaxRequest = new AJAXInternal.Request(args);
		
		ajaxRequest.http.open(ajaxRequest.method, ajaxRequest.urlToOpen, ajaxRequest.async);
		ajaxRequest.http.setRequestHeader("Content-type", ajaxRequest.contentType+"; charset="+ajaxRequest.charset);
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
					if (typeof ajaxRequest.timeout !== "undefined") {
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
		if (typeof args["timeout"] === "number") {
			ajaxRequest.timeout = setTimeout(function(){
				ajaxRequest.http.abort();
				__Simple.Call(ajaxRequest.onTimeout);
			}, args["timeout"]);
		}
		
		ajaxRequest.http.send_s(ajaxRequest);
	};
	
	/*
	 * Call() returns Mixed
	 * Input: Mixed, Mixed, Mixed
	 * */
	__Simple.Call = function(callback, first, second){
		if (__Simple.Type(callback) === "function") {
			if (typeof second !== "undefined") return callback(first, second);
			else if (typeof first !== "undefined") return callback(first);
			else return callback();
		}
	};
	
	__Simple.Cookie = {
		Get: function(name){
			return CookieInternal.data[name];
		},
		
		Set: function(name, value, expires){
		
		},
	};
	
	/*
	 * DOMElement() returns Mixed
	 *	Input: String, String
	 * */
	__Simple.DOMElement = function(elementString, context){
		if (typeof context === "undefined") {
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
		if (__Simple.Type(callback) === "function") {
			if (DOMInteral.ready === false && DOMInteral.busy === false) {
				DOMInteral.callbacks.push(callback);
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
			result[decodeURIComponent(buffer[1])] = (typeof buffer[2] !== "undefined" ? decodeURIComponent(buffer[2]) : null);
			buffer = RegexInternal.queryString.exec(queryString);
		}
		
		return result;
	};
	
	/*
	 * Simple.Each() returns nothing
	 * Input: Mixed, Function
	 * */
	__Simple.Each = function(haystack, callback){
		if (typeof haystack !== "undefined") {
			/* Possible haystack shortcuts */
			if (haystack === __Simple.Cookie) haystack = CookieInternal.data;
			else if (haystack === __Simple.GET) haystack = __GET;
			
			/* Iterator will hold a reference to haystack */
			var iterator = new Iterator(haystack);
			
			/* Presumably only an Array will have a "length" property */
			if (haystack.hasOwnProperty("length")) {
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
	 * Exists() returns Mixed
	 * Input: Mixed, Mixed, Boolean
	 * */
	__Simple.Exists = function(object, override, doReturnBoolean){
		var useBool = (typeof doReturnBoolean !== "undefined" && doReturnBoolean);
		
		if (typeof object !== "undefined") {
			if (useBool) return true;
			else return object;
		} else {
			if (useBool) return false;
			else return override;
		}
	};
	
	/*
	 * EncodeQueryString() returns String
	 * Input: Object
	 * */
	__Simple.EncodeQueryString = function(object){
		var result = "";
	
		for (var index in object) {
			result += (index + "=" + object[index] + "&");
		}
		
		/* Trim off the extra ampersand. */
		if (result.length > 0) {
			result = result.substring(0, result.length-1);
		}
		
		return result.replace(" ", "+");
	};
	
	__Simple.GET = {
		Exists: function(name){
			return typeof __GET[name] !== "undefined";
		},
		
		Find: function(name){
			return __Simple.GET.Exists(name) ? __GET[name] : undefined;
		}
	};
	
	/*
	 * IsArray() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsArray = function(object){
		return __Simple.Type(object) === "array";
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
	 * IsFunction() returns Boolean
	 * Input: Mixed
	 * */
	__Simple.IsFunction = function(object){
		return __Simple.Type(object) === "function";
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
		return object === null ? "null" : (ClassTypesInteral[Object.prototype.toString.call(object)] || "object");
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
	
	if (typeof document.addEventListener !== "undefined") {
		document.addEventListener("DOMContentLoaded", DOMInternal.OnDOMContentLoaded, false);
		window.addEventListener("load", DOMInternal.OnReady, false);
	} else if (typeof document.attachEvent !== "undefined") {
		document.attachEvent("onreadystatechange", DOMInternal.OnDOMContentLoaded);
		window.attachEvent("onload", DOMInternal.OnReady, false);
	} else {
		window.onload = DOMInternal.OnReady;
	}
}(Simple));