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
 
 var Simple = window.$ = {};
 
 (function($){
    "use strict";
    
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
    
    /* * * Private * * */
    
    /*
     * AJAXRequest Object
     * Is used in the Simple.AJAX() function.
     * */
    var AJAXRequest = function(args){
        this.async = $.Exists(args.async, true);
        this.charset = $.Exists(args.charset, "utf-8");
        this.contentType = $.Exists(args.contentType, "application/x-www-form-urlencoded");
        this.data = $.Exists(args.data, {});
        this.http = new XMLHttpRequest();
        this.http.request = this;
        this.method = $.Exists(args.method, "GET");
        this.onError = args.onError;
        this.onConnect = args.onConnect;
        this.onNotFound = args.onNotFound;
        this.onProcess = args.onProcess;
        this.onRecvRequest = args.onRecvRequest;
        this.onSuccess = args.onSuccess;
        this.queryString = $.EncodeQueryString(this.data);
        this.url = $.Exists(args.url, "/");
        this.urlToOpen = (this.method === "POST") ? this.url : (this.url + "?" + this.queryString);
    };
    
    /*
     * AJAXRequestHandler() returns Nothing
     * Input: Nothing
        * This is the handler function for http.onreadystatechange.
        * Is called in the Simple.AJAX() function.
     * */
    var AJAXRequestHandler = function(){
        switch (this.readyState) {
            case 1: /* CONNECT */
                $.Call(this.request.onConnect);
            break;
            case 2: /* REQUEST RECEIVED */
                this.timeBegin = new Date().getTime();
                $.Call(this.request.onRecvRequest);
            break;
            case 3: /* PROCESSING */
                $.Call(this.request.onProcess);
            break;
            case 4: /* COMPLETE */
                if (typeof this.request.timeout !== Cache.undefined) {
                    clearTimeout(this.request.timeout);
                }
                
                this.timeEnd = new Date().getTime();
                this.timeDifference = (this.timeEnd - this.timeBegin);
                
                switch (this.status) {
                    case 200: $.Call(this.request.onSuccess, this.responseText, this.timeDifference);
                    break;
                    case 404: $.Call(this.request.onNotFound, this.responseText, this.timeDifference);
                    default:  $.Call(this.request.onError, [this.responseText,this.status], this.timeDifference);
                    break;
                }
            break;
        }
    };
    
    /*
     * Cache of commonly used values.
     * */
    var Cache = {
        array: "array",
        contentType: "contentType",
        cookieGetRegex: "=([^;]+);?", /* Passed as an argument to RegExp's constructor. */
        func: "function",
        number: "number",
        object: "object",
        on: "on",
        string: "string",
        timeout: "timeout",
        undefined: "undefined",
        uint32max: 4294967296
    };
    
    /*
     * Cache used for implementing the $.Type() function.
     * Based on jQuery's code for doing the same thing.
     * */
    var ClassTypes = {};
    (function(ctypes){
        var buffer = "Array Boolean Date Function Number Object RegExp String".split(" ");
        for (var i=buffer.length; i--;) {
            ctypes["[object " + buffer[i] + "]"] = buffer[i].toLowerCase();
        }
    }(ClassTypes));
    
    /*
     * Comparison() returns Boolean
     * Input: Array, Function
        * Called by the "is" functions, such as "isArray" and "isObject".
        * Is used when comparing an array of values.
     * */
    var Comparison = function(values, predicate){
        var result = $.IsArray(values);
        for (var len=values.length; result && len--;) {
            result = predicate(values[len]);
        }
        return result;
    };
    
    /*
     * Array of Function.
     * Each function in this array will be called when the DOM is ready.
     * */
    var DOMReadyCallbacks = [];
    
    /*
     * All event based functions will go here.
     * Right now that is only the DOM loading events.
     * Might add some more here in the future.
     * */
    var Events = {
        /*
         * onDOMContentLoaded() returns Nothing
         * Input: Nothing
             * Called by one of two possible event listeners.
             * For modern browsers this will be the document's "DOMContentLoaded" event.
         * */
        onDOMContentLoaded: function(){
            if (State.hasAddEventListener) {
                document.removeEventListener("DOMContentLoaded", Events.onDOMContentLoaded, false);
                Events.onReady();
            } else if (State.hasAttachEvent && document.readyState === "complete" && document.body !== null) {
                document.detachEvent("onreadystatechange", Events.onDOMContentLoaded);
                Events.onReady();
            }
        },
        
        /*
         * onReady() returns Nothing
         * Input: Nothing
             * Called when the DOM is considered ready.
             * Typically, on modern browsers, this is called by Events.onDOMContentLoaded().
             * Legacy browsers may call this from the window.onload event.
         * */
        onReady: function(){
            if (State.isReady === false && State.isBusy === false) {
                State.isBusy = true;
                for (var i=0, len=DOMReadyCallbacks.length; i < len; i++) {
                    DOMReadyCallbacks[i]();
                }
                State.isReady = true;
                State.isBusy = false;
            }
        }
    };
    
    /*
     * Functions for adding/removing events are here.
     * */
    var EventManager = {
        /*
         * ProcessEventListener() returns Nothing
         * Input: Boolean, Array|String, Array|String, Function, Boolean
            * This function is called by the Simple.AddEvent and Simple.RemoveEvent functions.
            * If the "element" or "event" objects are arrays then they will be processed recursively.
         * */
        ProcessEventListener: function(isAddingEvent, element, event, callback, useCapture){
            /* If a string is given then assume it's a DOM element. */
            if ($.IsString(element)) {
                element = $.DOMElement(element);
            }
            /* If an array has been given then pass each element to this function recursivly. */
            if ($.IsDOMElementArray(element) || $.IsArray(element)) {
                /* Use "i<len" instead of "len--" to ensure the events are processed in order. */
                for (var i=0, len=element.length; i < len; i++) {
                    EventManager.ProcessEventListener(isAddingEvent, element[i], event, callback, useCapture);
                }
            } else {
                /* The event object might be an array. */
                if ($.IsArray(event)) {
                    for (var i=0, len=element.length; i < len; i++) {
                        EventManager.ToggleEventListener(isAddingEvent, element, event[i], callback, useCapture);
                    }
                } else {
                    EventManager.ToggleEventListener(isAddingEvent, element, event, callback, useCapture);
                }
            }
        },
        
        /*
         * ToggleEventListener() returns Nothing
         * Input: Boolean, DOMElement, String, Function, Boolean
            * Is called by EventManager.ProcessEventListener().
            * Depending on the value of "isAddingEvent" will either add or remove the passed event.
         * */
        ToggleEventListener: function(isAddingEvent, element, event, callback, useCapture){
            /* First: ensure the required objects are defined. */
            if (typeof element !== Cache.undefined && element !== null) {
                /* Second: determine which event type to use: "addEventListener" or "attachEvent". */
                if (typeof element.addEventListener !== Cache.undefined) {
                    if (typeof useCapture === Cache.undefined) {
                        useCapture = false;
                    }
                    /* Determine if the event is being added or removed. */
                    if (isAddingEvent) {
                        element.addEventListener(event, callback, useCapture);
                    } else {
                        element.removeEventListener(event, callback, useCapture);
                    }
                } else {
                    /* Determine if the event is being added or removed. */
                    if (isAddingEvent) {
                        element.attachEvent(Cache.on+event, callback);
                    } else {
                        element.detachEvent(Cache.on+event, callback);
                    }
                }
            }
        }
    };
    
    /*
     * */
    var ObjectShortcut = function(source){
        switch (source) {
            case $.Cookie: return $.Cookie.GetAll();
            case $.GET: return QueryString;
            default: return source;
        }
    };
    
    /*
     * Cache of commonly used regular expressions
     * */
    var RegularExpressions = {
        cookie: /[ ]?([^=]+)=([^;]+)[; ]?/g,
        floatingPoint: /[0-9]+([.][0-9]+)?/g,
        notNumber: /[^0-9.\-+]+/g, /* Used to match anything NOT a number. That is 0-9 and decimal points. */
        number: /([0-9]{1,3}([,][0-9]{3})?)+([.][0-9]+)?/g, /* Used to match any number. Includes commas because some string-numbers use them. */
        queryString: /[?&]?([^&=]+)=?([^&]+)?/g,
        sprintfVariable: /%[b|d|f|h|H|o|s|u|x|X]/g
    };
    
    /* 
     * SendAJAXRequest() returns Nothing
     * Input: AJAXInternal.Request, Object
        * A "safe" version of XMLHttpRequest.send().
        * Is compatible with both ActiveX-based AJAX and otherwise.
        * */
    var SendAJAXRequest = function(request, args){
        if (typeof args === Cache.undefined || args === null) {
            if (request.isActiveX) {
                request.http.send();
            } else {
                request.http.send(null);
            }
        } else if ("method" in args && "queryString" in args && args.method === "post") {
            request.http.send(args.queryString);
        } else {
            SendAJAXRequest(request, null);
        }
    };
    
    /*
     * Made a seperate block for this because I might add additional functions in the future.
     * For now it is just the Process() one.
     * */
    var TextProcessor = {
        /*
         * Process() returns String
         * Input: String, String
            * Is called by Simple.Sprintf().
            * Replaced sprintf variables with the appropriate value; converting it
            * to a string if necessary.
         * */
        Process: function(type, value){
            switch (type){
                case "%b": return $.ToInt(value).toString(2);
                case "%d": return $.ToInt(value).toString();
                case "%f": return parseFloat(value).toString();
                case "%h": return $.ToInt(value).toString(16);
                case "%H": return $.ToInt(value).toString(16).toUpperCase();
                case "%o": return $.ToInt(value).toString(8);
                case "%u": return $.ToUnsignedInt(value).toString();
                case "%x": return "0x" + $.ToInt(value).toString(16);
                case "%X": return "0x" + $.ToInt(value).toString(16).toUpperCase();
                default: return value;
            }
        }
    };
    
    /*
     * Various states will be stored here.
     * Is essentially a cache of boolean values.
     * */
    var State = {
        hasAddEventListener: (typeof document.addEventListener !== Cache.undefined),
        hasAttachEvent: (typeof document.attachEvent !== Cache.undefined),
        isReady: false,
        isBusy: false
    };
    
    /* * * Public * * */
    
    /*
     * AddEvent() returns Nothing
     * Input: Array|String, Array|String, Function, Boolean
        * Adds the processed event.
        * If this event already exists then this function won't actually do anything.
     * */
    $.AddEvent = function(element, event, callback, useCapture){
        EventManager.ProcessEventListener(true, element, event, callback, useCapture);
    };
    
    /*
     * AJAX() returns Nothing
     * */
    $.AJAX = function(args){
        var request = new AJAXRequest(args);
        
        /* 
         * Prepare the AJAX request.
         * */
        request.http.open(request.method, request.urlToOpen, request.async);
        request.http.setRequestHeader(Cache.contentType, request.contentType+"; charset="+request.charset);
        request.http.onreadystatechange = AJAXRequestHandler;
        
        /*
         * Add a new timeout if one is given.
         * The time is assumed to be milliseconds.
         * */
        if ($.IsNumeric(args[Cache.timeout])) {
            request.timeout = setTimeout(function(){
                request.http.abort();
                $.Call(request.onTimeout);
            }, args[Cache.timeout]);
        }
        
        /* 
         * Pass the object twice because the request object will also contain the GET/POST
         * variables being sent through HTTP (which is what the second parameter holds).
         */
        SendAJAXRequest(request, request);
    };
    
    /*
     * ArraysEqual() returns Boolean
     * Input: Array, Array
        * Returns true if the two passed arrays are identical.
        * False otherwise.
    * */
    $.ArraysEqual = function(first, second){
        var result = $.IsArray([first,second],true) && first.length === second.length;
        if (result) {
            for (var len=first.length; result && len--;) {
                result = $.Equals(first[len], second[len]);
            }
        }
        return result;
    };

    /*
     * Call() returns Mixed
     * Input: Mixed, Mixed, Mixed
     * */
    $.Call = function(callback, first, second){
        if ($.Type(callback) === Cache.func) {
            if (typeof second !== Cache.undefined) {
                return callback(first, second);
            } else if (typeof first !== Cache.undefined) {
                return callback(first);
            } else {
                return callback();
            }
        }
    };
    
    /*
     * Cookie management is in here.
     * Will update this description in the future, maybe.
     * */
    $.Cookie = {
        /*
         * Exists() returns Boolean
         * Input: String
            * Returns true if the passed cookie name has been defined.
            * False otherwise.
        * */
        Exists: function(name){
            return $.HasProperty($.Cookie.GetAll(), name);
        },
        
        /*
         * Get() returns String|undefined
         * Input: String
            * Returns the value of the passed cookie name.
            * Will return undefined if the cookie has not been defined.
        * */
        Get: function(name){
            var result = new RegExp(name + Cache.cookieGetRegex, "g").exec(document.cookie);
            if (result !== null) {
                return result[1];
            }
        },
        
        /*
         * GetAll() returns Object
         * Input: Nothing
            * Returns an object containing all of the cookie definitions.
         * */
        GetAll: function(){
            var currentCookie = document.cookie;
            var regex = RegularExpressions.cookie;
            var buffer = regex.exec(currentCookie);
            var result = {};
            
            while (buffer !== null) {
                result[buffer[1]] = buffer[2];
                buffer = regex.exec(currentCookie);
            }
            
            return result;
        },
        
        /*
         * Set() returns Nothing
         * Input: String, Mixed, Number, String, String, Boolean
         * */
        Set: function(name, value, milliseconds, path, domain, secure){
            var date = new Date;
            var expiration = new Date(milliseconds);
            
            date.setTime(date.getTime() + expiration.getTime());
            
            document.cookie = [
                encodeURIComponent(name)+"="+encodeURIComponent(value),
                "; expires="+date.toUTCString(),
                path ? "; path=" + path : "",
                domain ? "; domain=" + domain : "",
                secure ? "; secure" : ""
            ].join("");
        }
    };
    
    /*
     * DOMElement() returns Object
     * Input: String, String|DOMElement
     * */
    $.DOMElement = function(elementStr, context){
        /* Ensure context is defined. */
        if (typeof context === Cache.undefined) {
            context = document;
        } else if ($.IsString(context)) {
            context = $.DOMElement(context);
        }
        
        /* Second condition is necessary for IE6-8. */
        if ($.IsDOMElement(context) || context === document) {
            /*
             * Match the HTMLCollection object.
             * */
            var result;
            switch (elementStr.charAt(0)) {
                case "#": result=context.getElementById(elementStr.substring(1)); break;
                case ".": result=context.getElementsByClassName(elementStr.substring(1)); break;
                case ":": result=context.getElementsByName(elementStr.substring(1)); break;
                default:  result=context.getElementsByTagName(elementStr); break;
            }
            
            /* The getElements functions return arrays (sort of)
             * If any are empty then return NULL instead.
             * * */
            if (result !== null && $.HasProperty(result, Cache.length) && result.length === 0) {
                return null;
            } else {
                return result;
            }
        }
    };
    
    /*
     * Each() returns Nothing
     * Input: Mixed, Function, Boolean
        * Iterates through the passed haystack.
        * Will pass an iterator to the callback.
     * */
    $.Each = function(haystack, callback, ignoreReturnValues){
        haystack = ObjectShortcut(haystack);
        
        /*
         * By default the Each() function will halt if a callback returns false.
         * This boolean will disable that.
         * */
        ignoreReturnValues = $.Exists(ignoreReturnValues, null, true);
        
        /*
         * DOMObjectArrays aren't actually arrays, so the $.IsArray function returns false.
         * So also check for them.
         * */
         if ($.IsArray(haystack) || $.IsDOMElementArray(haystack)) {
            var valueBuffer;
            for (var i=0, end=haystack.length; i < end; i++) {
                valueBuffer = haystack[i];
                if (callback.call(valueBuffer, {"index":i,"value":valueBuffer}) === false && !ignoreReturnValues) {
                    break;
                }
            }
         } else {
            var valueBuffer;
            for (var index in haystack) {
                valueBuffer = haystack[index];
                if (callback.call(valueBuffer, {"index":index,"value":valueBuffer}) === false && !ignoreReturnValues) {
                    break;
                }
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
    $.DecodeQueryString = function(string){
        var regex = RegularExpressions.queryString;
        var buffer = regex.exec(string);
        var result = {};
        
        while (buffer) {
            result[decodeURIComponent(buffer[1])] = $.Exists(buffer[2], null, true) ? decodeURIComponent(buffer[2]) : "";
            buffer = regex.exec(string);
        }
        
        return result;
    };
    
    /*
     * DOMReady() returns Nothing
     * Input: Function
         * Adds the passed function to the list of callbacks that
         * are called when the DOM is ready.
     * */
    $.DOMReady = function(callback){
        if ($.Type(callback) === Cache.func) {
            if (State.isReady === false && State.isBusy === false) {
                DOMReadyCallbacks.push(callback);
            } else {
                callback();
            }
        }
    };
    
    /*
     * EncodeQueryString() returns String
     * Input: Object
         * Encodes a passed Object into a query string.
         * For example, this:
             * {name:"John Doe", id:42}
         * Will become:
             * name=John%20Doe&id=42
     * */
    $.EncodeQueryString = function(source){
        var result = "";
        for (var index in source) {
            result += (encodeURIComponent(index) + "=" + encodeURIComponent(source[index]) + "&");
        }
        return result.substring(0, result.length-1);
    };
    
    /*
     * Equals() returns Boolean
     * Input: Object, Object, Boolean
        * Compares the two passed objects and returns true if they are considered equal.
        * Returns false otherwise.
     * */
    $.Equals = function(first, second){
        first = ObjectShortcut(first);
        second = ObjectShortcut(second);
        
        if ($.IsArray([first,second],true)) {
            return $.ArraysEqual(first, second);
        } else if ($.IsObject([first,second],true)) {
            var firstArray=$.ObjectToArray(first), secondArray=$.ObjectToArray(second);
            return $.Equals(firstArray[0],secondArray[0]) && $.Equals(firstArray[1],secondArray[1]);
        } else {
            return first === second;
        }
    };
    
    /*
     * Exists() returns Mixed
     * Input: Mixed, Mixed, Boolean
         * Used for determining if the passed object is defined.
         *
         * If the object is defined then it will be returned.
         * Otherwise the override object will be returned.
         *
         * If "doReturnBoolean" is true then true/false is returned in place of object/override.
     * */
    $.Exists = function(source, override, doReturnBoolean){
        source = ObjectShortcut(source);
        if (typeof source !== Cache.undefined) {
            if (doReturnBoolean) {
                return true;
            } else {
                return source;
            }
        } else {
            if (doReturnBoolean) {
                return false;
            } else {
                return override;
            }
        }
    };
    
    /*
     * This section contains query string related methods.
     * It is also a sort of "magic object". It can be passed to functions
     * to perform operations on the query string.
     *
     * Example:
        * var hasId = $.HasProperty($.GET, "id");
        * var matches = $.Equals($.GET, {"id":"42", "name":"John Doe"});
     * */
    $.GET = {
        /*
         * Exists() returns Boolean
         * Input: Array|String
             * Returns true if the passed GET variable has been defined.
             * Does not require a value to have been assigned to the GET variables.
         * */
        Exists: function(name){
            if ($.Type(name) === Cache.array) {
                var result = name.length;
                for (var len=result; result && len--;) {
                    result = (typeof QueryString[name[len]] !== Cache.undefined);
                }
                return result;
            } else {
                return typeof QueryString[name] !== Cache.undefined;
            }
        },
        
        /*
         * Get() returns String|undefined
         * Input: String
            * Returns the value of the passed query string variable.
            * Will return undefined if it has not been defined.
         * */
        Get: function(source){
            if ($.Type(source) === Cache.array) {
                var result = {};
                for (var len=source.length; len--;) {
                    result[source[len]] = QueryString[source[len]];
                }
                return result;
            } else {
                return QueryString[source];
            }
        },
        
        /*
         * GetAll() returns Object
         * Input: Nothing
            * Returns a copy of the query string object.
         * */
        GetAll: function(){
            var result = {};
            for (var index in QueryString) {
                result[index] = QueryString[index];
            }
            return result;
        }
    };
    
    /*
     * GenerateArray() returns Array
     * Input: Number, Mixed, Boolean
        * Generates an array based on the passed parameters.
        * If the third argument is a boolean "true" then second argument is
        * treated as a callback.
        * Can be used to quickly create an array of N size by not assigning
        * the "value" argument a value:
            * var arr = $.GenerateArray(10);
        * The array can also be manipulated as it grows:
            * var arr = $.GenerateArray(10, function(src,i){
                            if (i>0) {
                                src[i-1] = Math.pow(src.length,2);
                                return 0;
                            }
                        }, true);
            * console.log(arr); // [1, 4, 9, 16, 25, 36, 49, 64, 81, 0]
     * */
    $.GenerateArray = function(amount, value, isCallback){
        var result = [];
        for (var i = 0; i < amount; i++) {
            result[i] = isCallback ? value(result,i) : value;
        }
        return result;
    };
    
    /*
     * HasProperty() returns Boolean
     * Input: String, String, Boolean
        * Returns true if the object has the passed property defined.
        * For example, checking for "foo" on this object:
            * {"hello":"world", "id":42, "foo":null}
        * Will return true because it is defined.
        * Its value is irrelevent.
     * */
    $.HasProperty = function(source, property, doIterateSource){
        source = ObjectShortcut(source);
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            var result = $.IsArray(source);
            for (var len=source.length; result && len--;) {
                result = typeof source[len][property] !== Cache.undefined;
            }
            return result;
        } else {
            return typeof source[property] !== Cache.undefined;
        }
    };
    
    /*
     * HasValue() returns Boolean
     * Input: Array|Object, Mixed
        * Returns true if the passed container has the passed source defined.
        * For example, the following will return true for the value "bar":
            * {"id":42, "foo":"bar", "hello":"world"};
            * [1, 2, "foo", 3, 4, 5];
        * However, only the second will return true for "foo".
        * Indices in objects are not searched.
     * */
    $.HasValue = function(source, value){
        source = ObjectShortcut(source);
        var result = false;
        $.Each(source, function(itr){
            return !(result = $.Equals(value,itr.value));
        });
        return result;
    };
    
    /*
     * IsArray() returns Boolean
     * Input: Array, Boolean
     * */
    $.IsArray = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsArray);
        } else {
            return ($.Type(source) === Cache.array);
        }
    };
    
    /*
     * IsDOMElement() returns Boolean
     * Input: Object, Boolean
     * */
    $.IsDOMElement = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsDOMElement);
        } else {
            return typeof source !== Cache.undefined && source !== null && $.HasProperty(source, "ELEMENT_NODE");
        }
    };
    
    /*
     * IsDOMElementArray() returns Boolean
     * Input: Object, Boolean
     * */
    $.IsDOMElementArray = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsDOMElementArray);
        } else {
            return typeof source !== Cache.undefined && source !== null && $.IsDOMElement(source[0]) && $.HasProperty(source, "item");
        }
    };
    
    /*
     * IsEmptyArray() returns Boolean
     * Input: Array, Boolean
        * Returns true if the passed array is empty.
        * False otherwise.
    * */
    $.IsEmptyArray = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsEmptyArray);
        } else {
            return $.IsArray(source) && !source.length;
        }
    };
    
    /*
     * IsEmptyObject() returns Boolean
     * Input: Object|Array, Boolean
        * Returns true if the passed object contains no indices, or is undefined.
        * Will only return false if the object contains no indices, even if defined.
    * */
    $.IsEmptyObject = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsEmptyObject);
        } else {
            if (typeof source !== Cache.undefined) {
                for (var index in source) {
                    return false;
                }
            }
            return true;
        }
    };
    
    /*
     * IsNumeric() returns Boolean
     * Input: Array|Mixed, Array
     * */
    $.IsNumeric = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsNumeric);
        } else {
            return !isNaN(parseFloat(source)) && isFinite(source);
        }
    };
    
    /*
     * IsObject() returns Boolean
     * Input: Object|Array, Boolean
     * */
    $.IsObject = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsObject);
        } else {
            return ($.Type(source) === Cache.object);
        }
    };
    
    /*
     * IsString() returns Boolean
     * Input: Array|String, Boolean
     * */
    $.IsString = function(source, doIterateSource){
        if (typeof doIterateSource !== Cache.undefined && doIterateSource) {
            return Comparison(source, $.IsString);
        } else {
            return ($.Type(source) === Cache.string);
        }
    };
    
    /*
     * ObjectToArray() returns Array
     * Input: Object
        * Converts the passed object into an array.
        * The first element will be the object's indices.
        * The second element will be the object's values.
        *
        * For example:
            * {foo:"bar", id:42, name:"John Doe"}
        * Will become:
            * [
                ["foo", "id", "name"],
                ["bar",  42,  "John Doe"]
              ]
        *
    * */
    $.ObjectToArray = function(source){
        source = ObjectShortcut(source);
        var result = [[],[]];
        for (var index in source) {
            result[0].push(index);
            result[1].push(source[index]);
        }
        return result;
    };
    
    /*
     * RemoveEvent() returns Nothing
     * Input: Array|String, Array|String, Function, Boolean
        * Removed the processed event.
        * If this event does not exist then this function won't actually do anything.
     * */
    $.RemoveEvent = function(element, event, callback, useCapture){
        EventManager.ProcessEventListener(false, element, event, callback, useCapture);
    };
    
    /*
     * Round returns Number
     * Input: Number, Number
     * */
    $.Round = function(num, decimalPlaces){
        decimalPlaces = Math.pow(10, decimalPlaces ? decimalPlaces : 0);
        return Math.round(num*decimalPlaces) / decimalPlaces;
    };
    
    /*
     * Sprintf() returns String
     * Input: String, Mixed
     * */
    $.Sprintf = function(source){
        if (arguments.length > 1) {
            /* 
             * The values may be in the arguments array,
             * or may be an array passed as the second argument.
             * */
            var indexOffset = 1;
            var values = arguments;
            
            if ($.IsArray(arguments[1])) {
                indexOffset = 0;
                values = arguments[1];
            }
            
            var variables = source.match(RegularExpressions.sprintfVariable);
            var end = (variables) ? variables.length : 0;
            
            /* Replace each sprintf variable with the appropriate values. */
            for (var i = 0; i < end; i++) {
                source = source.replace(
                    variables[i], 
                    TextProcessor.Process(variables[i], values[i+indexOffset].toString())
                );
            }
        }
        
        return source;
    };
    
    /*
     * ToInt() returns Number|NaN
     * Input: Mixed, Number
        * Converts the passed object to an integer.
        * Objects that cannot be converted will be returned as NaN.
     * */
    $.ToInt = function(source, base){
        if ($.Type(source) !== Cache.number) {
            var result = source.match(RegularExpressions.number);
            if (result !== null && result.length === 1) {
                return parseInt(source.replace(RegularExpressions.notNumber, Cache.emptyString), $.Exists(base,10));
            } else {
                return NaN;
            }
        } else {
            return parseInt(source, $.Exists(base,10));
        }
    };
    
    /*
     * ToUnsignedInt() returns Number|NaN
     * Input: Mixed, Number, Number
        * Converts the passed object to an unsigned integer.
        * Objects that cannot be converted will be returned as NaN.
     * */
    $.ToUnsignedInt = function(source, base, max){
        if (source = $.ToInt(source, base)) {
            return (source > 0) ? source : ($.Exists(max,Cache.uint32max) - Math.abs(source));
        } else {
            return source;
        }
    };
    
    /*
     * Type() returns String
     * Input: Mixed
         * Returns the type of the passed object.
         * Based on jQuery's code for doing the same thing.
     * */
    $.Type = function(source){
        return source === null ? "null" : (ClassTypes[Object.prototype.toString.call(source)] || "object");
    };
    
    /* * * Query Strings * * */
    
    var QueryString = $.DecodeQueryString(document.location.search);
    
    /* * * Event Listeners * * */
    
    if (State.hasAddEventListener) {
        document.addEventListener("DOMContentLoaded", Events.onDOMContentLoaded, false);
        window.addEventListener("load", Events.onReady, false);
    } else if (State.hasAttachEvent) {
        document.attachEvent("onreadystatechange", Events.onDOMContentLoaded);
        window.attachEvent("onload", Events.onReady, false);
    } else {
        window.onload = Events.onReady;
    }
 }(Simple));