(function (global) {
    var app = global.app = global.app || {};

    document.addEventListener('deviceready', function () {
        navigator.splashscreen.hide();
        $(document.body).height(window.innerHeight);
    }, false);

    app.application = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout"});

    
})(window);