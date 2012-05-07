/*
 * SimpleJS v0.0.1
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
if (typeof XMLHttpRequest === 'undefined') {
	var XMLHttpRequest = function() {
		return new ActiveXObject('Microsoft.XMLHTTP');
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
XMLHttpRequest.prototype.send_s = function(args) {
	if (typeof args === 'undefined' || args === null) {
		if (this.isActiveX) this.send();
		else this.send(null);
	} else if ('method' in args && 'queryString' in args && args.method === 'POST') {
		this.send(args.queryString);
	} else {
		this.send_s();
	}
}

/* 
 * decodeQueryString() returns Object
 * Input: Nothing
    * Converts the string to an Object that represents a query string.
    * Examples of valid formats:
      * ?id=42&email=foo@bar.com&type=helloworld
	  * &id=42&foo&name=John+Doe
	  * foo&bar
    * */
String.prototype.decodeQueryString = function() {
	var buffer;
	var queryString = this.replace('+', ' ');
	var regex = /[?&]?([^&=]+)=?([^&]+)?/g;
	var result = {};
	
	while (buffer = regex.exec(queryString)) {
		result[decodeURIComponent(buffer[1])] = decodeURIComponent(buffer[2]);
	}
	
	return result;
};

var Simple = {
	AJAX: function(args) {
		var ajaxRequest = new Simple.AJAXRequest(args);
		
		ajaxRequest.http.open(ajaxRequest.method, ajaxRequest.urlToOpen, true);
		ajaxRequest.http.setRequestHeader('Content-type', ajaxRequest.contentType+'; charset='+ajaxRequest.charset);
		
		if (ajaxRequest.method === 'POST') {
			ajaxRequest.http.setRequestHeader('Content-length', ajaxRequest.queryString.length);
			ajaxRequest.http.setRequestHeader('Connection', 'close');
		}
		
		ajaxRequest.http.onreadystatechange = function(){
			switch (ajaxRequest.http.readyState) {
				case 1:
					ajaxRequest.timeBegin = new Date().getTime();
					Simple.AJAXHandler.CallIfExists(ajaxRequest.onConnect);
				break;
				case 2:
					Simple.AJAXHandler.CallIfExists(ajaxRequest.onRequest);
				break;
				case 3:
					Simple.AJAXHandler.CallIfExists(ajaxRequest.onProcess);
				break;
				case 4:
					if (typeof ajaxRequest.timeout !== 'undefined') {
						clearTimeout(ajaxRequest.timeout);
					}
					
					ajaxRequest.timeEnd = new Date().getTime();
					ajaxRequest.timeDifference = (ajaxRequest.timeEnd - ajaxRequest.timeBegin);
					
					switch (ajaxRequest.http.status) {
						case 200:
							Simple.AJAXHandler.CallIfExists(ajaxRequest.onSuccess, ajaxRequest.http.responseText, ajaxRequest.timeDifference);
						break;
						case 404:
							Simple.AJAXHandler.CallIfExists(ajaxRequest.onNotFound, ajaxRequest.http.responseText, ajaxRequest.timeDifference);
						default:
							Simple.AJAXHandler.CallIfExists(ajaxRequest.onError, ajaxRequest.http.status, ajaxRequest.timeDifference);
						break;
					}
				break;
			}
		};
		
		/*
		 * Add a new timeout if one is given.
		 * The time is assumed to be milliseconds.
		 * */
		if ('timeout' in args && args['timeout'] === true) {
			ajaxRequest.timeout = setTimeout(function() {
				ajaxRequest.http.abort();
				Simple.AJAXHandler.CallIfExists(ajaxRequest.onTimeout);
			}, args['timeout']);
		}
		
		ajaxRequest.http.send_s(ajaxRequest);
	},
	
	/*
	 * AJAXHandler
	 * This object contains boilerplate functions that help organise the code of Simple AJAX.
	 * These probably won't need to be used outside of the AjaxRequest constructor function.
	 * Note:
		* These functions are also where the default values are assigned.
	 * */
	AJAXHandler: {
		/*
		 * CallIfExists() returns Nothing
		 * Input: Function, Mixed, Mixed
			* Takes a callback, and up to two optional parameters.
			* Depending on the number of parameters given will make one of three different calls.
			* */
		CallIfExists: function(callback, param1, param2) {
			if (typeof callback === 'function') {
				if (typeof param2 !== 'undefined') callback(param1, param2);
				else if (typeof param1 !== 'undefined') callback(param1);
				else callback();
			}
		},
		
		/*
		 * GetCarset() returns String
		 * Input: String
			* Takes a passed object, assumed String.
			* If NULL or UNDEFINED is passed then a default value is returned.
			* Otherwise the passed value is returned back.
			* */
		GetCharset: function(charset) {
			return (typeof charset === 'string') ? charset : 'utf-8';
		},
		
		/*
		 * GetContentType() returns String
		 * Input: String
			* See GetCharset().
			* */
		GetContentType: function(contentType) {
			return (typeof contentType === 'string') ? contentType : 'application/x-www-form-urlencoded';
		},
		
		/*
		 * GetMethod() returns String
		 * Input: String
			* See GetCharset().
			* */
		GetMethod: function(method) {
			return (typeof method === 'string') ? method : 'GET';
		},
		
		/*
		 * GetQueryString() returns String
		 * Input: Object
		 * Takes an object of (key=>value) pairs and converts them to a query string.
		 * For example:
			* The object {a:1,b:2,c:3} would become "a=1&b=2&c=3".
			* Note that the question mark is not appended to the beginning.
		 * */
		GetQueryString: function(data) {
			var output = '';
			
			if (typeof data !== 'undefined') {
				var output = '';
				
				for (var key in data) {
					output = (output + key +'='+ data[key] + '&');
				}
				
				// Trim off the extra ampersand.
				output = output.substring(0, output.length-1);
			}
			
			return output;
		},
		
		/*
		 * GetUrl() returns String
		 * Input: String
			* See GetCharset().
			* */
		GetUrl: function(url) {
			return (typeof url === 'string') ? url : '/';
		},
		
		/*
		 * GetUrlToOpen() returns String
		 * Input: String, String, String
			* Returns the value that will be passed to the XMLHttpRequest.open() function.
			* If the method is a GET it will be the entire URL, as well as the query string.
			* If the method is a POST then it will only be the query string.
			* */
		GetUrlToOpen: function(url, queryString, method) {
			return (method === 'POST') ? url : (url + '?' + queryString);
		}
	},
	
	AJAXRequest: function(args) {
		this.charset = Simple.AJAXHandler.GetCharset(args['charset']);
		this.contentType = Simple.AJAXHandler.GetContentType(args['contentType']);
		this.http = new XMLHttpRequest();
		this.method = Simple.AJAXHandler.GetMethod(args['method']);
		this.onConnect = args['onConnect'];
		this.onError = args['onError'];
		this.onNotFound = args['onNotFound'];
		this.onProcess = args['onProcess'];
		this.onRequest = args['onRequest'];
		this.onSuccess = args['onSuccess'];
		this.onTimeout = args['onTimeout'];
		this.queryString = Simple.AJAXHandler.GetQueryString(args['data']);
		this.timeBegin = 0;
		this.timeDifference = 0;
		this.timeEnd = 0;
		this.timeout = null;
		this.url = Simple.AJAXHandler.GetUrl(args['url']);
		this.urlToOpen = Simple.AJAXHandler.GetUrlToOpen(this.url, this.queryString, this.method);
	},
	
	Cookie: {
		data: {},
		
		DoUpdateData: function() {
			this.data = {};
			
			var arr = document.cookie.split('; ');
			var buffer = null;
			var cookie = null;
			var regex = /([^=]+)=(.*)/;
			
			Simple.Each(arr, function(){
				cookie = regex.exec(this);
				Simple.Cookie.data[escape(cookie[1])] = escape(cookie[2]);
			});
		},
		
		Get: function(name) {
			if (this.data === null) {
				this.DoUpdateData();
			}
			return Simple.Cookie.data[name];
		},
		
		Set: function(name, value, expiration) {
			document.cookie = (name+'='+value+';') + (expiration ? ' expires=0;' : '');
			this.DoUpdateData();
		}
	},
	
	/*
	 * Each() returns Nothing
	 * Input: Array|Object, Function
	    *
	    * */
	Each: function (haystack, callback) {
		if (typeof haystack !== 'undefined' && haystack !== null) {
			var iterator = {
				i: null,
				parent: haystack,
				value: null
			};
			if (haystack.forEach !== undefined) {
				var end = haystack.length;
				for (var i = 0; i < end; i++) {
					iterator.value = haystack[i];
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
	},
	
	/*
	 * Equals() returns Boolean
	 * Input: Mixed, Mixed
	    * Compares each element of both passed objects, checking for strict equality.
	    * */
	Equals: function(first, second) {
		var result = true;
		
		Simple.Each(first, function(itr) {
			if (itr.value !== second[itr.index]) {
				return result = false;
			}
		});
		
		return result;
	},
	
	/*
	 * Exists() returns Mixed
	 * Input: Mixed, Mixed, Boolean
	    *
	    * */
	Exists: function(value, override, doReturnBoolean) {
		var output;
		
		if (typeof value !== 'undefined') {
			output = value;
		} else if (typeof doReturnBoolean !== 'undefined' && doReturnBoolean === true) {
			output = false;
		} else {
			output = override;
		}
		
		return output;
	},
	
	DOM: {
		callbacks: [], // The array of each callback function to be called when the DOM is ready.
		isReady: false, // This boolean is used to ensure that DOM.OnReady is only called once.
		
		/*
		 * OnDOMContentLoaded() returns Nothing
		 * Input: Nothing
		    * The function called by the event listeners.
		    * Because of the legacy event listener this may be called twice.
		    * */
		OnDOMContentLoaded: function() {
			if (typeof document.addEventListener !== 'undefined') {
				document.removeEventListener('DOMContentLoaded', Simple.DOM.OnDOMContentLoaded, false);
				Simple.DOM.OnReady();
			} else if (typeof document.attachEvent !== 'undefined' && document.readyState === 'complete' && document.body !== null) {
				document.detachEvent('onreadystatechange', Simple.DOM.OnDOMContentLoaded);
				Simple.DOM.OnReady();
			}
		},
		
		/*
		 * OnReady() returns Nothing
		 * Input: Nothing
		    * The function called when the DOM has finished loading/is ready.
		    * Uses a boolean to prevent multiple calls because it may be called twice by 
		    * the event listener and legacy event listener.
		    * */
		OnReady: function() {
			if (Simple.DOM.isReady === false) {
				if (Simple.DOM.callbacks.length > 0) {
					Simple.Each(Simple.DOM.callbacks, function(){
						this.call(null);
					});
				}
				Simple.DOM.isReady = true;
			}
		},
		
		/*
		 * WhenReady() returns Nothing
		 * Input: Function
		    * Adds the passed callback to the array of callbacks that are called when
		    * the DOM is ready.
		    * */
		WhenReady: function(callback) {
			if (Simple.DOM.isReady === false) {
				Simple.DOM.callbacks.push(callback);
			}
		}
	},
	
	GET: {
		data: document.location.search.decodeQueryString(),
		
		/*
		 * exists() returns Boolean
		 * Input: String
		 * */
		exists: function(index) {
			return (typeof index === 'string' && index in this.data);
		},
		
		/*
		 * find() returns Mixed
		 * Input: String
		 * */
		find: function(index) {
			if (this.exists(index)) {
				return this.data[index];
			}
		}
	}
};

Simple.Cookie.DoUpdateData();

if (typeof document.addEventListener !== 'undefined') {
	document.addEventListener('DOMContentLoaded', Simple.DOM.OnDOMContentLoaded, false);
	window.addEventListener('load', Simple.DOM.OnReady, false);
} else if (typeof document.attachEvent !== 'undefined') {
	document.attachEvent('onreadystatechange', Simple.DOM.OnDOMContentLoaded);
	window.attachEvent('onload', Simple.DOM.OnReady, false);
} else {
	window.onload = Simple.DOM.OnReady;
}