(function (global) {
    app = global.app = global.app || {};

    document.addEventListener("deviceready", onDeviceReady, true);

    app.application = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout"});
    
    //load templates
    templateLoader.loadExtTemplate("templates/news.tmpl.html");
   
    
})(window);

function onDeviceReady() {
    
    navigator.splashscreen.hide();
    $(document.body).height(window.innerHeight);
    
    var gaPlugin = window.plugins.gaPlugin;
    log("stored:" + localStorage.getItem('allowUsageTracking'));
                                
    //if no variable stored locally, create one and set value as undefined
    if (!localStorage.getItem('allowUsageTracking')) {
        localStorage.setItem('allowUsageTracking','unset');
    }
    console.log("AllowUsageTracking: " + localStorage.getItem('allowUsageTracking'));
                            
    if (localStorage.getItem('allowUsageTracking')!="deny") {
        gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-47250154-1", 5);
        log('gaPlugin initialised');
    }

    $('#clearLog').on('click', function() {
        $('#log').val('');
    });
                        
}

//GA plugin
function nativePluginResultHandler (result) {
    log('nativePluginResultHandler: '+result);
}
        
function nativePluginErrorHandler (error) {
    log('nativePluginErrorHandler: '+error);
}
                        
function ScreenButtonClicked(page) {
    var lsi = localStorage.getItem('allowUsageTracking');
    if (lsi == "allow" || lsi == "unset") {
        gaPlugin.trackPage( nativePluginResultHandler, nativePluginErrorHandler, page);        
    }                            
}
                        
function goingAway() {
    gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
}
    

//VIEW Init/Change Events


//INFO Screen
function infoInit() {
    ScreenButtonClicked("info");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}

//LOGGING    
function log(msg) {
    $('#log').val($('#log').val() + msg + '\n');
}

