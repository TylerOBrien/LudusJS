SimpleJS
----------
This is a lightweight JavaScript library designed to simplify common tasks in vanilla JavaScript. Originally this was designed as an AJAX wrapper, but eventually grew into a much larger library. SimpleJS makes no attempt to replicate, or replace, other existing libraries such as jQuery or MooTools; it is merely something I designed to simplify JavaScript when specifically _not_ using those libraries.

__The current version, while usable, is not yet complete.__

List of Examples
----------
* [Simple.AddEvent](#simpleaddevent)
* [Simple.AJAX](#simpleajax)
* [Simple.Call](#simplecall)
* [Simple.Cookie.Exists](#simplecookieexists)
* [Simple.Cookie.Get](#simplecookieget)
* [Simple.Cookie.GetAll](#simplecookiegetall)
* [Simple.Cookie.Set](#simplecookieset)
* [Simple.DecodeQueryString](#simpledecodequerystring)
* [Simple.DOMElement](#simpledomelement)
* [Simple.DOMReady](#simpledomready)
* [Simple.Each](#simpleeach)
* [Simple.EncodeQueryString](#simpleencodequerystring)
* [Simple.Equals](#simpleequals)
* [Simple.Exists](#simpleexists)
* [Simple.GenerateArray](#simplegeneratearray)
* [Simple.GET.Exists](#simplegetexists)
* [Simple.GET.Get](#simplegetget)
* [Simple.GET.GetAll](#simplegetgetall)
* [Simple.HasProperty](#simplehasproperty)
* [Simple.HasValue](#simplehasvalue)
* [Simple.ObjectToArray](#simpleobjecttoarray)
* [Simple.RemoveEvent](#simpleremoveevent)
* [Simple.Sprintf](#simplesprintf)

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
	
	$.DOMReady(function(){
		$.AddEvent("#foo", ["mouseout","mouseover"], function(){
			console.log("out/over: " + this.getAttribute("id"));
		});
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

Simple.Cookie.Exists
----------
> > __Input:__ _Array|String name_  
> > __Output:__ _Boolean result_
> > 
> > Returns _true_ if the cookie by the passed name has been defined.  
> > Does not require the cookie to have a value.
> >
> > The following two examples are identical.

```javascript
(function($){
	"use strict";
	
	if ($.Cookie.Exists("id") && $.Cookie.Exists("name")) {
		console.log("The 'id' and 'name' cookies have been set.");
	}
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.Cookie.Exists(["id","name"])) {
		console.log("The 'id' and 'name' cookies have been set.");
	}
}(Simple));
```

Simple.Cookie.Get
----------
> > __Input:__ _Array|String source_  
> > __Output:__ _Object|String result_
> > 
> > Returns the value of the passed cookie name (the value of "source").  
> > If "source" is an _Array_ then an _Object_ will be returned.

```javascript
(function($){
	"use strict";
	
	var id = $.Cookie.Get("id");
	var email = $.Cookie.Get("email");
	var name = $.Cookie.Get("name");
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	var object = $.Cookie.Get(["id","email","name"]);
}(Simple));
```

Simple.Cookie.GetAll
----------
> > __Input:__ _Nothing_  
> > __Output:__ _Object result_
> > 
> > Returns an _Object_ containing the data for all cookies.

```javascript
(function($){
	"use strict";
	
	var object = $.Cookie.GetAll();
}(Simple));
```

Simple.Cookie.Set
----------
> > __Input:__ _String name, String value, Integer milliseconds_  
> > __Output:__ _Nothing_
> > 
> > Sets cookie data.
> > Is similar to the way PHP sets cookies.

```javascript
(function($){
	"use strict";
	
	/* Set cookies for 3600000 milliseconds, or, 1 hour. */
	$.Cookie.Set("id", "johndoe42", 3600000);
	$.Cookie.Set("email", "johndoe@foo.bar.com", 3600000);
	$.Cookie.Set("name", "John Doe", 3600000);
}(Simple));
```

Simple.DecodeQueryString
----------
> > __Input:__ _String source_  
> > __Output:__ _Object result_
> > 
> > Converts the passed query string into an object.

```javascript
(function($){
	"use strict";
	
	var queryString = "id=42&name=John+Doe&type=Burly";
	var object = $.DecodeQueryString(queryString);
	
	console.log(object);
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
		console.log("DOM Ready Function #1");
	});
	
	$.DOMReady(function(){
		console.log("DOM Ready Function #2");
	});
	
	$.DOMReady(function(){
		console.log("DOM Ready Function #3");
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

Simple.EncodeQueryString
----------
> > __Input:__ _Object source_  
> > __Output:__ _String result_
> > 
> > Converts the passed object into a query string.

```javascript
(function($){
	"use strict";
	
	var data = {
		"id": 42,
		"name": "John Doe",
		"type": "Burly"
	};
	
	console.log($.EncodeQueryString(data)); // id=42&name=John+Doe&type=Burly
}(Simple));
```

Simple.Equals
----------
> > __Input:__ _Mixed first, Mixed second_  
> > __Output:__ _Boolean result_
> > 
> > Returns _true_ if the two objects are considered equal.

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
		console.log("Query string is 'id=42&name=foo'.");
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
> > __Input:__ _Integer num, Mixed val[, Boolean isValueCallback]_  
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
	
	console.log($.GenerateArray(10, fibonacci, true)); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
}(Simple));
```

Simple.GET.Exists
----------
> > __Input:__ _Array|String name_  
> > __Output:__ _Boolean result_  
> >
> > Returns _true_ if the GET variable by the passed name has been defined.  
> > Does not require the variable to have a value.
> >
> > The following two examples are identical.

```javascript
(function($){
	"use strict";
	
	if ($.GET.Exists("id") && $.GET.Exists("name") && $.GET.Exists("foo")) {
		console.log("GET['id'], GET['name'], and GET['foo'] have been defined.");
	}
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.GET.Exists(["id","name","foo"])) {
		console.log("GET['id'], GET['name'], and GET['foo'] have been defined.");
	}
}(Simple));
```

Simple.GET.Get
----------
> > __Input:__ _Array|String name_  
> > __Output:__ _Object|String|Undefined value_  
> >
> > Returns the value of the GET variable by the passed name.  
> > If said variable does not exist then _undefined_ is returned.
> >
> > If the value of "name" is an _Array_ then an _Object_ is returned.  
> > Each index will be the GET variable name. Each value will be the GET variable value (see second example).

```javascript
(function($){
	"use strict";
	
	var id = $.GET.Get("id");
	var name = $.GET.Get("name");
	var foo = $.GET.Get("foo");
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	var object = $.GET.Get(["id","name","foo"]);
}(Simple));
```

Simple.GET.GetAll
----------
> > __Input:__ _Nothing_  
> > __Output:__ _Object result_  
> >
> > Returns an _Object_ containing all GET data.

```javascript
(function($){
	"use strict";
	
	var object = $.GET.GetAll();
}(Simple));
```

Simple.HasProperty
----------
> > __Input:__ _Array|Object object, String property[, Boolean doIterateSource]_  
> > __Output:__ _Boolean result_  
> >
> > Returns true if the property exists in the passed object, or array of objects.  
> > Otherwise returns false.

```javascript
(function($){
	"use strict";
	
	if ($.HasProperty({"foo":"bar"}, "foo")) {
		console.log("Has 'foo' property");
	}
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.HasProperty($.GET, "id")) {
		console.log("Query string 'id' has been defined.");
	}
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
	
	console.log("Keys: " + arr[0]); // foo, hello
	console.log("Values: " + arr[1]); // bar, world
}(Simple));
```

Simple.Sprintf
----------
> > __Input:__ _String source[, Array|String ...]_  
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
	
	var source = "The quick brown %s jumps over the lazy %s.";
	var result = $.Sprintf(source, "fox", "dog");
	
	console.log(result); // The quick brown fox jumps over the lazy dog.
}(Simple));
```
_____
```javascript
(function($){
	"use strict";
	
	var source = "%d bottles of %s on the %s.";
	var result = $.Sprintf(source, [99,"beer","wall"]);
	
	console.log(result); // 99 bottles of beer on the wall.
}(Simple));
```