SimpleJS
==========

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et tellus non tortor cursus lacinia et et mauris. Fusce ante sem, pretium vel cursus in, congue a dui. Suspendisse elementum tristique mattis. Integer sollicitudin elit sodales orci placerat porta. Donec orci libero, rhoncus in luctus nec, euismod quis ipsum. Donec fringilla tristique tincidunt. Cras orci eros, euismod ac lacinia vehicula, ullamcorper ut metus. Mauris quis tellus leo, quis ultricies ante. Cras mattis feugiat nisl, sit amet pretium metus porttitor nec. Maecenas viverra tristique erat quis luctus. 

Examples
----------

__Simple.AJAX__

	(function($){
		"use strict";
		
		$.AJAX({
			method: "GET",
			url: "someFile.txt",
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
			method: "GET",
			url: "someFileThatDoesNotExist.txt",
			onNotFound: function(response, ms){
				console.log("It took '"+ms+"' to conclude that the file does not exist");
			}
		});
	}(Simple));

__Simple.Cookie__

	(function($){
		"use strict";
		
		var name = $.Cookie.Get("username");
		var email = $.Cookie.Get("email");
		
		$.Cookie.Set("id", "usr_445_foo");
	}(Simple));
____
	(function($){
		"use strict";
		
		if ($.Cookie.Exists("foo")) {
			console.log("Has cookie 'foo'. Might be valid; might expired. Who knows?");
		}
		
		if ($.Cookie.IsValid("username")) {
			console.log("Has valid cookie 'username'");
		}
		
		if ($.Cookie.IsExpired("old_cookie")) {
			console.log("Has expired cookie 'old_cookie'");
		}
	}(Simple));

__Simple.DOMElement__

	(function($){
		"use strict";
		
		$.DOMReady(function(){
			var divs = $.DOMElement("div");
			var elem = $.DOMElement("#foo");
			var elemArr = $.DOMElement(".bar");
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

	(function($){
		"use strict";
		
		$.DOMReady(function(){
			alert("DOM is ready");
		});
	}(Simple));

__Simple.Each__

Without an iterator:

	(function($){
		"use strict";
		
		var arr = [1,2,3,4,5];
		
		$.Each(arr, function(){
			console.log(this);
		});
	}(Simple)();
____
	(function($){
		"use strict";
		
		var arr = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}];
		
		$.Each(arr, function(){
			console.log(this.id);
		});

With an iterator:

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
		
		console.log($.Equals(foo, bar)); // True
		console.log($.Equals(foo, baz)); // True
		console.log($.Equals(foo, baz, true)); // False
	}(Simple));

__Simple.Exists__

	(function($){
		"use strict";
		
		console.log($.Exists(foo, 42)); // 42
		console.log($.Exists(foo, 42, true)); // false
		
		var foo = "hello world";
		
		console.log($.Exists(foo, 42)); // hello world
		console.log($.Exists(foo, 42, true)); // true
	}(Simple));

__Simple.GET__

	(function($){
		"use strict";
		
		console.log($.GET.exists("foo")); // Will output true if "foo" is defined
		console.log($.GET.find("foo")); // Will output value of "foo" if is defined, otherwise will output 'undefined'
	}(Simple));
____
	(function($){
		"use strict";
		
		$.Each($.GET, function(itr){
			console.log(itr.i + " => " + itr.value);
		});
	}(Simple));