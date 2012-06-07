SimpleJS
----------
This is a lightweight JavaScript library designed to simplify common tasks in vanilla JavaScript. Originally this was designed as an AJAX wrapper, but eventually grew into a much larger library. SimpleJS makes no attempt to replicate, or replace, other existing libraries such as jQuery or MooTools; it is merely something I designed to simplify JavaScript when specifically _not_ using those libraries.

The current version, while usable, is not yet complete.

Simple.AddEvent
----------
> > __Input:__ _Array|DOMObject|String element, Array|String event, Function callback_  
> > __Output:__ _Nothing_
> >
> > Adds the passed event(s) to the passed element(s).
> > If an array is given as the element then all elements will be given the passed event.
> > If an array is given as the event, the element will be given all events.
> > If an array is given for both then all given elements will contain all given events.
> > 
> > The passed elements can either be strings, which will be converted into DOM objects, or DOM objects themselves.  
> > Arrays can be a mix of both.

```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		$.AddEvent("#foo", "mouseover", function(){
			console.log("over: foo");
		});
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		$.AddEvent(["#foo","#bar"], "mouseover", function(){
			console.log("over: " + this.getAttribute("id"));
		});
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	function Toggle() {
		console.log("over/out: foo");
	}
	
	$.DOMReady(function(){
		$.AddEvent("#foo", ["mouseout","mouseover"], Toggle);
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	function onFocus() {
		console.log("focus");
	}
	
	$.DOMReady(function(){
		$.AddEvent($.DOMElement(".myClass"), "focus", onFocus);
		$.AddEvent($.DOMElement("#myId"), "focus", onFocus);
	});
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	/* Let's do something crazy */
	Simple.AddEvent([["input","h1"],["#myid",".myclass",["span"]]], "mouseover", function(){
		console.log("over: " + this.getAttribute("name"));
	});
}(Simple));
```

Simple.AJAX
----------
> > __Input:__ _Object args_  
> > __Output:__ _Nothing_
> >
> > Used to perform AJAX operations.  
> > Behaves in a manner similar to a combination of jQuery and Prototype's methods of handling AJAX.
> >
> > The following are all available properties:  
> > ``` charset ``` ``` The charset of the target. ``` ``` Default is 'UTF-8'. ```  
> > ``` contentType ``` ``` The Content-Type header of the target. ``` ``` Default is 'application/x-www-form-urlencoded'. ```  
> > ``` data ``` ``` The GET/POST variables that will be passed. ```  
> > ``` method ``` ``` The request method to use. Can only be GET or POST. ``` ``` Default is 'GET'. ```  
> > ``` onConnect ``` ``` The function called upon connection with target. ```  
> > ``` onError ``` ``` The function called upon encountering an error. ```  
> > ``` onNotFound ``` ``` The function called upon encountering a 404 not found error. ```  
> > ``` onProcess ``` ``` The function called upon beginning processing of request. ```  
> > ``` onRecvRequest ``` ``` The function called upon receiving a request. ```  
> > ``` onSuccess ``` ``` The function call upon a successful request. ```  
> > ``` timeout ``` ``` The timeout for the request, in milliseconds. ```  
> > ``` url ``` ``` The target URL. ```  

```javascript
(function($){
	"use strict";
	
	$.AJAX({
		url: "someFile.txt",
		onError: function(error, ms){
			var response = error[0];
			var errorCode = error[1];
		},
		onSuccess: function(response, ms){
			console.log(response);
			console.log("\nTook '"+ms+"' milliseconds");
		}
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.AJAX({
		url: "someFileThatDoesNotExist.txt",
		onNotFound: function(response, ms){
			console.log("It took '"+ms+"' to conclude that the file does not exist");
		}
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.AJAX({
		method: "POST",
		url: "update.php",
		data: {"id":42, "status":"foo"},
		onSuccess: function(response, ms){
			console.log("POST success");
		}
	});
}(Simple));
```

Simple.Call
----------
> > __Input:__ _Function callback, [Mixed args1, [Mixed args2]]_  
> > __Output:__ _Mixed returnValue_
> >
> > If the passed "callback" variable is a function then it will be called. If it is anything other than a function then it will be ignored.  
> > The two args variables are optional parameters that when defined will be passed to the callback.
> >
> > The return value of this function will be the return value of the passed callback.

```javascript
(function($){
	"use strict";
	
	function foo() {
		console.log("Called foo()");
	}
	
	var bar = "hello world";
	
	$.Call(foo); // Called foo()
	$.Call(bar); // Will do nothing
	$.Call(baz); // Will do nothing
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	function myCallback(id, args) {
		console.log(id + " => " + args);
	}
	
	$.Call(myCallback, 42, {"foo":"bar", "baz":1234});
}(Simple));
```

Simple.Cookie
----------
```javascript
(function($){
	"use strict";
	
	var name = $.Cookie.Get("username");
	var email = $.Cookie.Get("email");
	
	$.Cookie.Set("id", "usr_445_foo", 3600000); // Set cookie for 3600 seconds.
	
	console.log($.Cookie.Exists("id")); // true
}(Simple));
```

__Simple.DOMElement__
----------
> > __Input:__ _String element [, DOMObject|String context]_  
> > __Output:__ _Array|DOMObject result_
> > 
> > Used for selecting DOM elements.  
> > Depending on the value of the passed string one of four _getElement_ functions will be called.  
> >
> > The following are example values:  
> > ``` #foo ``` ``` <div id="foo"></div> ```  
> > ``` .bar ``` ``` <section class="bar"></section> ```  
> > ``` :baz ``` ``` <input name="baz" type="text"> ```  
> > ``` span ``` ``` <span></span> ```  
> >
> > Unlike jQuery the objects returned will not be wrappers of the original DOMObjects. The DOMObjects themselves will be returned. This function acts only as a "shortcut" for calling the _getElement_ functions.

```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		var divArr = $.DOMElement("div");
		var foo = $.DOMElement("#foo");
		var barArr = $.DOMElement(".bar");
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		var parent = $.DOMElement("#parent");
		var children = $.DOMElement(".child", parent);
	});
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		$.Each($.DOMElement(".myClass"), function(){
			console.log(this.innerHTML);
		});
	});
}(Simple));
```

Simple.DOMReady
----------
> > __Input:__ _Function callback_  
> > __Output:__ _Nothing_  
> >
> > Behaves in an identical manner as the _jQuery.ready_ function.  
> > The passed callback will be called when the DOM is ready. If the DOM is ready when the callback is passed then it will be called immediately.  
> > Callbacks will be called in the order that they are passed.

```javascript
(function($){
	"use strict";
	
	$.DOMReady(function(){
		alert("DOM Ready Function #1");
	});
	
	$.DOMReady(function(){
		alert("DOM Ready Function #2");
	});
	
	$.DOMReady(function(){
		alert("DOM Ready Function #3");
	});
}(Simple));
```

Simple.Each
----------
> > __Input:__ _Array|Object haystack, Function callback_  
> > __Output:__ _Nothing_
> > 
> > Iterates through the passed haystack, passing each element to the callback.  
> > In the context of the callback the _this_ operator will always refer to the current element (see examples).

```javascript
(function($){
	"use strict";
	
	var arr = [1,2,3,4,5];
	
	$.Each(arr, function(){
		console.log(this);
	});
}(Simple));
```
____
```javascript
	(function($){
		"use strict";
		
		var arr = [{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}];
		
		$.Each(arr, function(){
			console.log(this.id);
		});
	}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	var arr = [1,2,3,4,5];
	var obj = {"a":1, "b":2, "c":3};
	
	$.Each(arr, function(itr){
		console.log(itr.value);
	});

	$.Each(obj, function(itr){
		console.log(itr.i + " => " + itr.value);
	});
}(Simple));
```

Simple.Equals
----------
```javascript
(function($){
	"use strict";
	
	var two = 2;
	var five = 5;
	var seven = 7;
	
	console.log($.Equals(five, five)); // True
	console.log($.Equals(five, seven)); // False
	console.log($.Equals(five + two, seven)); // True
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	var foo = 5;
	var bar = "5";
	
	console.log($.Equals(foo, bar)); // False
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	var foo = [1,3,5,1];
	var bar = [1,3,5,1];
	var baz = {"a":1, "b":3, "c":5, "d":1};
	var bes = {"a":1, "b":3, "c":5, "d":1};
	
	console.log($.Equals(foo, bar)); // True
	console.log($.Equals(foo, baz)); // False
	console.log($.Equals(baz, bes)); // True
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	if ($.Equals($.GET, {"id":"42", "name":"foo"})) {
		// ...
	}
}(Simple));
```

Simple.Exists
----------
> > __Input:__ _Mixed val, Mixed override[, Boolean doReturnBool]_  
> > __Output:__ _Boolean|Mixed result_
> >
> > Used for determining if "val" has been defined. If so then "val" will be returned. If not then "override" will be returned.  
> > If "doReturnBool" is _true_ then true/false values will be returned instead of val/override, respectively.

```javascript
(function($){
	"use strict";
	
	console.log($.Exists(foo, 42)); // 42
	console.log($.Exists(foo, 42, true)); // false
	
	var foo = "hello world";
	
	console.log($.Exists(foo, 42)); // hello world
	console.log($.Exists(foo, 42, true)); // true
}(Simple));
```
	
Simple.GenerateArray
----------
> > __Input:__ _Integer num, Mixed val[, Boolean isValueCallback_]  
> > __Output:__ _Array result_
> >
> > Creates a new array of _n_ size where _n_ is the value of "num", assigning "val" to each element.
> >
> > If "isValueCallback" is _true_ then the return value of "val" will be used instead of "val" itself. As well a reference to the array, and the current index position, will be passed to the callback (see second example).

```javascript
(function($){
	"use strict";
	
	function myCallback() {
		return "foo";
	}
	
	var arr_1 = $.GenerateArray(3, "foo"); // ["foo", "foo", "foo"]
	var arr_2 = $.GenerateArray(3, myCallback); // [function{}, function{}, function{}]
	var arr_3 = $.GenerateArray(3, myCallback, true); // ["foo", "foo", "foo"]
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	function fibonacci(arr, i) {
		if (arr.length > 1) {
			return arr[i-1] + arr[i-2];
		} else {
			return arr.length;
		}
	}
	
	var arr = $.GenerateArray(10, fibonacci, true);
}(Simple));
```

Simple.GET
----------
```javascript
(function($){
	"use strict";
	
	console.log($.GET.Exists("foo")); // Will output true if "foo" is defined
	console.log($.GET.Find("foo")); // Will output value of "foo" if is defined, otherwise will output 'undefined'
}(Simple));
```
____
```javascript
(function($){
	"use strict";
	
	$.Each($.GET, function(itr){
		console.log(itr.i + " => " + itr.value);
	});
}(Simple));
```

Simple.ObjectToArray
----------
> > __Input:__ _Object source_  
> > __Output:__ _Array result_  
> >
> > Converts the passed object into a two dimensional array.  
> > The first index will contain all of the object's keys/indices.  
> > The second index will contain all of the object's values, stored respective to the keys/indices.

```javascript
(function($){
	"use strict";
	
	var obj = {"foo":"bar", "hello":"world"};
	var arr = $.ObjectToArray(obj);
	
	console.log("Keys: " + arr[0]);
	console.log("Values: " + arr[1]);
}(Simple));
```

Simple.Sprintf
----------
> > __Input:__ _String source_  
> > __Output:__ _String result_
> >
> > Behaves almost identically to the C/PHP/whatever function of the same name.   
> > The only difference is that this function does not support the all of the same % variables as the PHP function; I have not seen any real need for them.
> >
> > The available variables are:  
> > ```  %b  ``` ```  Value will be treated as a signed integer; formatted as binary.  ```  
> > ```  %d  ``` ```  Value will be treated as a signed integer.  ```  
> > ```  %f  ``` ```  Value will be treated as a floating point number.  ```  
> > ```  %o  ``` ```  Value will be treated as an octal number.  ```  
> > ```  %u  ``` ```  Value will be treated as an unsigned integer.  ```  
> > ```  %x  ``` ```  Value will be treated as a signed integer; formatted as hexadecimal in lowercase.  ```  
> > ```  %X  ``` ```  Value will be treated as a signed integer; formatted as hexadecimal in uppercase.  ```

```javascript
(function($){
	"use strict";
	
	var source = "The quick %s jumped over the lazy %s.";
	var result = $.Sprintf(source, "fox", "dog");
	
	console.log(result);
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	var source = "%d bottles of %s on the %s.";
	var result = $.Sprintf(source, [99,"beer","wall"]);
	
	console.log(result);
}(Simple));
```