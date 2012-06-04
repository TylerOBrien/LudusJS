SimpleJS
==========

This is a lightweight JavaScript library designed to simplify common tasks in vanilla JavaScript. Originally this was designed as an AJAX wrapper, but eventually grew into a much larger library. SimpleJS makes no attempt to replicate, or replace, other existing libraries such as jQuery or MooTools; it is merely something I designed to simplify JavaScript when specifically _not_ using those libraries.

__Simple.AddEvent__
----------

	(function($){
		"use strict";
		
		$.AddEvent("#myObject", "focus", function(){
			console.log("Object has focus");
		});
	}(Simple));
____
	(function($){
		"use strict";
		
		function onFocus() {
			console.log("event called");
		}
		
		var arr = $.DOMElement(".myClass");
		var obj = $.DOMElement("#myId");
		
		$.AddEvent(arr, "focus", onFocus);
		$.AddEvent(obj, "focus", onFocus);
	}(Simple));

__Simple.AJAX__
----------

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
____
	(function($){
		"use strict";
		
		$.AJAX({
			url: "someFileThatDoesNotExist.txt",
			onNotFound: function(response, ms){
				console.log("It took '"+ms+"' to conclude that the file does not exist");
			}
		});
	}(Simple));
____
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

__Simple.Call__
----------

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
____
	(function($){
		"use strict";
		
		function myCallback(id, args) {
			console.log(id + " => " + args);
		}
		
		$.Call(myCallback, 42, {"foo":"bar", "baz":1234});
	}(Simple));

__Simple.Cookie__
----------

	(function($){
		"use strict";
		
		var name = $.Cookie.Get("username");
		var email = $.Cookie.Get("email");
		
		$.Cookie.Set("id", "usr_445_foo", 3600000); // Set cookie for 3600 seconds.
		
		console.log($.Cookie.Exists("id")); // true
	}(Simple));

__Simple.DOMElement__
----------

	(function($){
		"use strict";
		
		$.DOMReady(function(){
			var divArr = $.DOMElement("div");
			var foo = $.DOMElement("#foo");
			var barArr = $.DOMElement(".bar");
		});
	}(Simple));
____
	(function($){
		"use strict";
		
		$.DOMReady(function(){
			var parent = $.DOMElement("#parent");
			var children = $.DOMElement(".child", parent);
		});
	}(Simple));
____
	(function($){
		"use strict";
		
		$.DOMReady(function(){
			$.Each($.DOMElement(".myClass"), function(){
				console.log(this.innerHTML);
			});
		});
	}(Simple));

__Simple.DOMReady__
----------

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

__Simple.Each__
----------

	(function($){
		"use strict";
		
		var arr = [1,2,3,4,5];
		
		$.Each(arr, function(){
			console.log(this);
		});
	}(Simple));
____
	(function($){
		"use strict";
		
		var arr = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
		
		$.Each(arr, function(){
			console.log(this.id);
		});
____
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

__Simple.Equals__
----------

	(function($){
		"use strict";
		
		var two = 2;
		var five = 5;
		var seven = 7;
		
		console.log($.Equals(five, five)); // True
		console.log($.Equals(five, seven)); // False
		console.log($.Equals(five + two, seven)); // True
	}(Simple));
____
	(function($){
		"use strict";
		
		var foo = 5;
		var bar = "5";
		
		console.log($.Equals(foo, bar)); // False
	}(Simple));
____
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
____
	(function($){
		"use strict";
		
		if ($.Equals($.GET, {"id":"42", "name":"foo"})) {
			// ...
		}
	}(Simple));

__Simple.Exists__
----------

	(function($){
		"use strict";
		
		console.log($.Exists(foo, 42)); // 42
		console.log($.Exists(foo, 42, true)); // false
		
		var foo = "hello world";
		
		console.log($.Exists(foo, 42)); // hello world
		console.log($.Exists(foo, 42, true)); // true
	}(Simple));
	
__Simple.GenerateArray__
----------

	(function($){
		"use strict";
		
		function myCallback() {
			return "foo";
		}
		
		var arr_1 = $.GenerateArray(3, "foo"); // ["foo", "foo", "foo"]
		var arr_2 = $.GenerateArray(3, myCallback); // [function{}, function{}, function{}]
		var arr_3 = $.GenerateArray(3, myCallback, true); // ["foo", "foo", "foo"]
	}(Simple));
	
__Simple.GET__
----------

	(function($){
		"use strict";
		
		console.log($.GET.Exists("foo")); // Will output true if "foo" is defined
		console.log($.GET.Find("foo")); // Will output value of "foo" if is defined, otherwise will output 'undefined'
	}(Simple));
____
	(function($){
		"use strict";
		
		$.Each($.GET, function(itr){
			console.log(itr.i + " => " + itr.value);
		});
	}(Simple));

__Simple.ObjectToArray__
----------

	(function($){
		var obj = {"foo":"bar", "hello":"world"};
		var arr = $.ObjectToArray(obj);
		
		console.log("Keys: " + arr[0]);
		console.log("Values: " + arr[1]);
	}(Simple));