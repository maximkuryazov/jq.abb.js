(function() {
    function setStringPrototype(key) {
        if (!String.prototype[key]) {
            String.prototype[key] = function (first, second, third, fourth) {
                if (jQuery.isFunction(jQuery()[key])) {
                    jQuery(this.toString())[key](first, second, third, fourth);
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
