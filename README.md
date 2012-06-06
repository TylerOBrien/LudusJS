SimpleJS
----------
This is a lightweight JavaScript library designed to simplify common tasks in vanilla JavaScript. Originally this was designed as an AJAX wrapper, but eventually grew into a much larger library. SimpleJS makes no attempt to replicate, or replace, other existing libraries such as jQuery or MooTools; it is merely something I designed to simplify JavaScript when specifically _not_ using those libraries.

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
> > Note:  
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
> > __Input:__ _args_
> > __Output:__ _Nothing_
> >
> > Used to perform AJAX operations. Is very similar to way jQuery and Prototype handle AJAX.  
> > The default __request method__ is _"GET"_, and the default __path__ is _"/"_.

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
> > __Input:__ _Function callback_, [Mixed _args1_, [Mixed _args2_]]  
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
> > __Input:__ _element_  
> > __Output:__ _DOMObject_
> > 
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
The _$.GenerateArray_ function can also be used to generate a Fibonacci number sequence:
```javascript
(function($){
	"use strict";
	
	$.GenerateArray(10, function(arr, i){
		if (arr.length > 1) {
			return arr[i-1] + arr[i-2];
		} else {
			return arr.length;
		}
	}, true);
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
	var obj = {"foo":"bar", "hello":"world"};
	var arr = $.ObjectToArray(obj);
	
	console.log("Keys: " + arr[0]);
	console.log("Values: " + arr[1]);
}(Simple));
```