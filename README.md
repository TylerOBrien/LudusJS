SimpleJS
==========

Examples
----------

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