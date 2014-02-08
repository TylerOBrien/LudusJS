LudusJS
----------
This is a lightweight JavaScript library designed to simplify common tasks when writing vanilla JavaScript (i.e. typically when not using frameworks like jQuery or MooTools). Originally this was only an AJAX wrapper, but as I wrote it I thought up features to add, and eventually it became what it is now.

Documentation
----------
Thorough docs on every function is available on [the Wiki](https://github.com/TylerOBrien/LudusJS/wiki).

How to Use
----------
Usage is pretty much the same as jQuery; include the LudusJS source, and then pass callbacks to a ready function, which will ensure that they are called after the DOM finishes loading.  
This is a basic example:

```html
<!DOCTYPE HTML>
<html>
    <head>
        <script src="js/ludus.js"></script>
        <script>
            Ludus.ready(function() {
                Ludus.addEvent("#myForm", "submit", function(event) {
                    event.preventDefault();
                });

                Ludus.addEvent("#myButton", "click", function(event) {
                    var form = Ludus.element("#myForm");
                    var data = Ludus.element("input", form);

                    Ludus.each(data, function() {
                        alert(Ludus.format("%s => %s", this.name, this.value));
                    });
                });
            });
        </script>
    </head>
    <body>
        <form id="myForm">
            Name: <input name="name" type="text"><br>
            Email: <input name="email" type="text"><br>

            <button id="myButton">Submit</button>
        </form>
    </body>
</html>
````
