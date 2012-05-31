SimpleJS
==========

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et tellus non tortor cursus lacinia et et mauris. Fusce ante sem, pretium vel cursus in, congue a dui. Suspendisse elementum tristique mattis. Integer sollicitudin elit sodales orci placerat porta. Donec orci libero, rhoncus in luctus nec, euismod quis ipsum. Donec fringilla tristique tincidunt. Cras orci eros, euismod ac lacinia vehicula, ullamcorper ut metus. Mauris quis tellus leo, quis ultricies ante. Cras mattis feugiat nisl, sit amet pretium metus porttitor nec. Maecenas viverra tristique erat quis luctus. 

Examples
----------

__Simple.Each__

__Simple.Each__

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