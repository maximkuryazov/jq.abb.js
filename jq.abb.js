(function() {
    function setStringPrototype(key) {
        if (!String.prototype[key]) {
            String.prototype[key] = function () {
                var arguments = Array.prototype.slice.call(arguments);
                var length = arguments.length;
                var argumentsToString = "";
                arguments.forEach(function (argument, index) {
                    argumentsToString += "'" + argument + "'";
                    if (index < length - 1) {
                        argumentsToString += ",";
                    }
                });
                if (jQuery.isFunction(jQuery()[key])) {
                    eval("jQuery(this.toString())['" + key + "'](" + argumentsToString + ")");
                }
            }
        }
    }
    for(var key in jQuery()) {
        setStringPrototype(key);
    }
})();

// Usage

$(function() {
    '.content'.hide('slow');
});
