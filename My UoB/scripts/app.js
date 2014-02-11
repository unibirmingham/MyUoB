(function (global) {
    
 var app = global.app = global.app || {};
 var gaPlugin;
    
    })(window);
                
function initialize() {
    document.addEventListener("deviceready", onDeviceReady, true);
    
}
   

function onDeviceReady() {
    
 
    gaPlugin = window.plugins.gaPlugin;
    log("stored:" + localStorage.getItem('allowUsageTracking'));
                                
    //if no variable stored locally, create one and set value as undefined
    if (!localStorage.getItem('allowUsageTracking')) {
        localStorage.setItem('allowUsageTracking','unset');
    }
    console.log("AllowUsageTracking: " + localStorage.getItem('allowUsageTracking'));
                            
    if (localStorage.getItem('allowUsageTracking')!="deny") {
        gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-47250154-2", 5);
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

//INFO view
function infoShow() {
    ScreenButtonClicked("info");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}


//SETTINGS screen
function settingsInit() {
    var switchVal = true;
    if (localStorage.getItem('allowUsageTracking')==="deny") {
        switchVal = false;    
    }
    $("#usage-tracking-switch").kendoMobileSwitch({
        checked: switchVal,
        change: onTrackingChange
    });
    
}

function settingsShow() {
        ScreenButtonClicked("settings");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}


//Guide view
function guideShow() {
    ScreenButtonClicked("pocket-guide");
    log("stored:" + localStorage.getItem('allowUsageTracking'));    
}
function guideAdviceShow() {
    ScreenButtonClicked("AdviceAndGuidanceIndex");
    log("stored:" + localStorage.getItem('allowUsageTracking'));    
}
function guideAdviceRepShow() {
    ScreenButtonClicked("AdviceAndRepresentation");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}
function guideAdviceCounsellingShow() {
    ScreenButtonClicked("CounsellingAndGuidance");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}



//Manage change of user preferences (GA tracking)
function onTrackingChange(e) {
    log("Change");
    var allowTrackingVal;
    if (e.checked) {
        allowTrackingVal = "allow";
    }
    else {
        allowTrackingVal = "deny";
    }
    localStorage.setItem('allowUsageTracking', allowTrackingVal);
    if (allowTrackingVal=="deny"){
        gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
        log("stop");
    }
    else {
        gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-47250154-2", 5);
        log("start");
    }
}

//LOGGING    
function log(msg) {
    $('#log').val($('#log').val() + msg + '\n');
}
