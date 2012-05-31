SimpleJS
==========

Examples
----------

__Simple.Each__
`var arr = [1,2,3,4,5];
var obj = {"a":1, "b":2, "c":3};

Simple.Each(arr, function(itr){
	console.log(itr.value);
});

Simple.Each(obj, function(itr){
	console.log(itr.i + " => " + itr.value);
});`