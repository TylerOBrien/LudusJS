LudusJS
----------
This is a lightweight JavaScript library designed to simplify common tasks when writing vanilla JavaScript (i.e. typically when not using frameworks like jQuery or MooTools). Originally this was only an AJAX wrapper, but as I wrote it I thought up features to add, and eventually it became what it is now.

How to Use
----------
Usage is pretty much the same as jQuery; include the LudusJS source, and then pass callbacks to a ready function, which will ensure that they are called after the DOM finishes loading.  
This is a basic example:

```html
<!DOCTYPE HTML>
<html>
	<head>
		<script src="ludus.js"></script>
		<script>
			Ludus.ready(function(){
				alert(Ludus.element("#foo").innerHTML);
			});
		</script>
	</head>
	<body>
		<div id="foo">hello world</div>
	</body>
</html>
````

Documentation
----------
* [Ludus.addEvent](#ludusaddevent)
* [Ludus.ajax](#ludusajax)
* [Ludus.arraysEqual](#ludusarraysequal)
* [Ludus.call](#luduscall)
* [Ludus.compare](#luduscompare)
* [Ludus.cookie.exists](#luduscookieexists)
* [Ludus.cookie.get](#luduscookieget)
* [Ludus.cookie.getAll](#luduscookiegetall)
* [Ludus.cookie.set](#luduscookieset)
* [Ludus.decodeQueryString](#ludusdecodequerystring)
* [Ludus.each](#luduseach)
* [Ludus.element](#luduselement)
* [Ludus.encodeQueryString](#ludusencodequerystring)
* [Ludus.equals](#ludusequals)
* [Ludus.erase](#luduserase)
* [Ludus.exists](#ludusexists)
* [Ludus.format](#ludusformat)
* [Ludus.generateArray](#ludusgeneratearray)
* [Ludus.get.exists](#ludusgetexists)
* [Ludus.get.get](#ludusgetget)
* [Ludus.get.getAll](#ludusgetgetall)
* [Ludus.hasProperty](#ludushasproperty)
* [Ludus.hasValue](#ludushasvalue)
* [Ludus.indexOf](#ludusindexof)
* [Ludus.isArray](#ludusisarray)
* [Ludus.isDOMElement](#ludusisdomelement)
* [Ludus.isDOMElementArray](#ludusisdomelementarray)
* [Ludus.isEmptyArray](#ludusisemptyarray)
* [Ludus.isEmptyObject](#ludusisemptyobject)
* [Ludus.isIterable](#ludusisiterable)
* [Ludus.isNumeric](#ludusisnumeric)
* [Ludus.isObject](#ludusisobject)
* [Ludus.isString](#ludusisstring)
* [Ludus.lambda](#luduslambda)
* [Ludus.objectToArray](#ludusobjecttoarray)
* [Ludus.random](#ludusrandom)
* [Ludus.ready](#ludusready)
* [Ludus.removeEvent](#ludusremoveevent)
* [Ludus.round](#ludusround)
* [Ludus.toInt](#ludustoint)
* [Ludus.toUnsignedInt](#ludustounsignedint)
* [Ludus.type](#ludustype)

Ludus.addEvent
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
	
	$.ready(function(){
		$.addEvent("#foo", "mouseover", function(){
			console.log("over: foo");
		});
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ready(function(){
		$.addEvent(["#foo","#bar"], "mouseover", function(){
			console.log("over: " + this.getAttribute("id"));
		});
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ready(function(){
		$.addEvent("#foo", ["mouseout","mouseover"], function(){
			console.log("out/over: " + this.getAttribute("id"));
		});
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	function onFocus() {
		console.log("focus");
	}
	
	$.ready(function(){
		$.addEvent($.DOMElement(".myClass"), "focus", onFocus);
		$.addEvent($.DOMElement("#myId"), "focus", onFocus);
	});
}(Ludus));
```

Ludus.ajax
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
	
	$.ajax({
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
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ajax({
		url: "someFileThatDoesNotExist.txt",
		onNotFound: function(response, ms){
			console.log("It took '"+ms+"' to conclude that the file does not exist");
		}
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ajax({
		method: "POST",
		url: "update.php",
		data: {"id":42, "status":"foo"},
		onSuccess: function(response, ms){
			console.log("POST success");
		}
	});
}(Ludus));
```

Ludus.call
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
	
	$.call(foo); // Called foo()
	$.call(bar); // Will do nothing
	$.call(baz); // Will do nothing
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	function myCallback(id, args) {
		console.log(id + " => " + args);
	}
	
	$.call(myCallback, 42, {"foo":"bar", "baz":1234});
}(Ludus));
```

Ludus.cookie.exists
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
	
	if ($.cookie.exists("id") && $.cookie.exists("name")) {
		console.log("The 'id' and 'name' cookies have been set.");
	}
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.cookie.exists(["id","name"])) {
		console.log("The 'id' and 'name' cookies have been set.");
	}
}(Ludus));
```

Ludus.cookie.get
----------
> > __Input:__ _Array|String source_  
> > __Output:__ _Object|String result_
> > 
> > Returns the value of the passed cookie name (the value of "source").  
> > If "source" is an _Array_ then an _Object_ will be returned.

```javascript
(function($){
	"use strict";
	
	var id = $.cookie.get("id");
	var email = $.cookie.get("email");
	var name = $.cookie.get("name");
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	var object = $.cookie.get(["id","email","name"]);
}(Ludus));
```

Ludus.Cookie.GetAll
----------
> > __Input:__ _Nothing_  
> > __Output:__ _Object result_
> > 
> > Returns an _Object_ containing the data for all cookies.

```javascript
(function($){
	"use strict";
	
	var object = $.cookie.getAll();
}(Ludus));
```

Ludus.cookie.set
----------
> > __Input:__ _String name, String value, Integer milliseconds_  
> > __Output:__ _Nothing_
> > 
> > Sets cookie data.
> > Is similar to the way PHP sets cookies.

```javascript
(function($){
	"use strict";
	
	/* Set cookies for 3600000 milliseconds, or 1 hour. */
	$.cookie.set("id", "johndoe42", 3600000);
	$.cookie.set("email", "johndoe@foo.bar.com", 3600000);
	$.cookie.set("name", "John Doe", 3600000);
}(Ludus));
```

Ludus.decodeQueryString
----------
> > __Input:__ _String source_  
> > __Output:__ _Object result_
> > 
> > Converts the passed query string into an object.

```javascript
(function($){
	"use strict";
	
	var queryString = "id=42&name=John%20Doe&type=Burly";
	var object = $.decodeQueryString(queryString);
	
	console.log(object);
}(Ludus));
```

__Ludus.element__
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
	
	$.ready(function(){
		var divArr = $.element("div");
		var foo = $.element("#foo");
		var barArr = $.element(".bar");
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ready(function(){
		var parent = $.element("#parent");
		var children = $.element(".child", parent);
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	$.ready(function(){
		$.each($.element(".myClass"), function(){
			console.log(this.innerHTML);
		});
	});
}(Ludus));
```

Ludus.ready
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
	
	$.ready(function(){
		console.log("DOM Ready Function #1");
	});
	
	$.ready(function(){
		console.log("DOM Ready Function #2");
	});
	
	$.ready(function(){
		console.log("DOM Ready Function #3");
	});
}(Ludus));
```

Ludus.each
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
	
	$.each(arr, function(){
		console.log(this);
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	var arr = [{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}];
	
	$.each(arr, function(){
		console.log(this.id);
	});
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	var arr = [1,2,3,4,5];
	var obj = {"a":1, "b":2, "c":3};
	
	$.each(arr, function(itr){
		console.log(itr.value);
	});

	$.each(obj, function(itr){
		console.log(itr.index + " => " + itr.value);
	});
}(Ludus));
```

Ludus.encodeQueryString
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
	
	console.log($.encodeQueryString(data)); // id=42&name=John%20Doe&type=Burly
}(Ludus));
```

Ludus.equals
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
	
	console.log($.equals(five, five)); // True
	console.log($.equals(five, seven)); // False
	console.log($.equals(five + two, seven)); // True
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	var foo = 5;
	var bar = "5";
	
	console.log($.equals(foo, bar)); // False
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	var foo = [1,3,5,1];
	var bar = [1,3,5,1];
	var baz = {"a":1, "b":3, "c":5, "d":1};
	var bes = {"a":1, "b":3, "c":5, "d":1};
	
	console.log($.equals(foo, bar)); // True
	console.log($.equals(foo, baz)); // False
	console.log($.equals(baz, bes)); // True
}(Ludus));
```
____
```javascript
(function($){
	"use strict";
	
	if ($.equals($.get, {"id":"42", "name":"foo"})) {
		console.log("Query string is 'id=42&name=foo'.");
	}
}(Ludus));
```

Ludus.exists
----------
> > __Input:__ _Mixed val, Mixed override[, Boolean doReturnBool]_  
> > __Output:__ _Boolean|Mixed result_
> >
> > Used for determining if "val" has been defined. If so then "val" will be returned. If not then "override" will be returned.  
> > If "doReturnBool" is _true_ then true/false values will be returned instead of val/override, respectively.

```javascript
(function($){
	"use strict";
	
	console.log($.exists(foo, 42)); // 42
	console.log($.exists(foo, 42, true)); // false
	
	var foo = "hello world";
	
	console.log($.exists(foo, 42)); // hello world
	console.log($.exists(foo, 42, true)); // true
}(Ludus));
```
	
Ludus.generateArray
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
	
	var arr_1 = $.generateArray(3, "foo"); // ["foo", "foo", "foo"]
	var arr_2 = $.generateArray(3, myCallback); // [function{}, function{}, function{}]
	var arr_3 = $.generateArray(3, myCallback, true); // ["foo", "foo", "foo"]
}(Ludus));
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
	
	console.log($.generateArray(10, fibonacci, true)); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
}(Ludus));
```

Ludus.get.exists
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
	
	if ($.get.exists("id") && $.get.exists("name") && $.get.exists("foo")) {
		console.log("GET['id'], GET['name'], and GET['foo'] have been defined.");
	}
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.get.exists(["id","name","foo"])) {
		console.log("GET['id'], GET['name'], and GET['foo'] have been defined.");
	}
}(Ludus));
```

Ludus.get.get
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
	
	var id = $.get.get("id");
	var name = $.get.get("name");
	var foo = $.get.get("foo");
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	var object = $.get.get(["id","name","foo"]);
}(Ludus));
```

Ludus.get.getAll
----------
> > __Input:__ _Nothing_  
> > __Output:__ _Object result_  
> >
> > Returns an _Object_ containing all GET data.

```javascript
(function($){
	"use strict";
	
	var object = $.get.getAll();
}(Ludus));
```

Ludus.hasProperty
----------
> > __Input:__ _Array|Object source, String property[, Boolean doIterateSource]_  
> > __Output:__ _Boolean result_  
> >
> > Returns true if the property exists in the passed object, or array of objects.  
> > Otherwise returns false.

```javascript
(function($){
	"use strict";
	
	if ($.hasProperty({"foo":"bar"}, "foo")) {
		console.log("Has 'foo' property");
	}
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.hasProperty($.GET, "id")) {
		console.log("Query string 'id' has been defined.");
	}
}(Ludus));
```

Ludus.hasValue
----------
> > __Input:__ _Array|Object container, Mixed value_
> > __Output:__ _Boolean result_  
> >
> > Returns true if the passed value exists in the passed container.  
> > Is compatible with both arrays and objects.  
> >    
> > Performs strict comparisons, so the int value 3 and string value "3" will _not_ be  considered equal. See the third example for an example of this happening.

```javascript
(function($){
	"use strict";
	
	if ($.hasValue([1,2,3,4,5], 3)) {
		console.log("The value '3' exists in the array.");
	}
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.hasValue({"foo":"bar"}, "bar")) {
		console.log("The value 'bar' exists in the object.");
	}
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	if ($.hasValue({"num":42}, "42")) {
		// Won't reach here.
	} else {
        console.log("The object does not contain the string value '42'.");
    }
}(Ludus));
```

Ludus.lambda
----------
> > __Input:__ _Mixed source_  
> > __Output:__ _Function callback_  
> >
> > Creates a function that will do nothing except for return the passed value (even if it is undefined)  
> > Is based on the MooTools function of the same name.

```javascript
(function($){
	"use strict";
	
	var callback = $.lambda(42);
    var num = callback();
    
    console.log(num); // 42
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
    // Disable all anchor click events
	$.AddEvent("a", "click", $.lambda(false));
}(Ludus));
```

Ludus.objectToArray
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
	var arr = $.objectToArray(obj);
	
	console.log("Keys: " + arr[0]); // foo, hello
	console.log("Values: " + arr[1]); // bar, world
}(Ludus));
```

Ludus.format
----------
> > __Input:__ _String source[, Array|String ...]_  
> > __Output:__ _String result_
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
	var result = $.format(source, "fox", "dog");
	
	console.log(result); // The quick brown fox jumps over the lazy dog.
}(Ludus));
```
_____
```javascript
(function($){
	"use strict";
	
	var source = "%d bottles of %s on the %s.";
	var result = $.format(source, [99,"beer","wall"]);
	
	console.log(result); // 99 bottles of beer on the wall.
}(Ludus));
```