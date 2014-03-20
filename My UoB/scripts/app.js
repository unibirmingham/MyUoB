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
    
    
    //News and Events preferences
    if (!localStorage.getItem('newspreferences')) {
        	localStorage.setItem('student-news',true);
        	localStorage.setItem('research-news',false);
        	localStorage.setItem('sport-news',false);
        	localStorage.setItem('newspreferences','set');
	}
    if (!localStorage.getItem('eventspreferences')) {
        	localStorage.setItem('performance-events',false);
        	localStorage.setItem('exhibition-events',false);
        	localStorage.setItem('lecture-events',false);
        	localStorage.setItem('sport-events',false);
        	localStorage.setItem('student-events',true);
        	localStorage.setItem('eventspreferences','set');
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




//EVENTS
function eventListViewPullWithEndless(e) {
    
    var ekeyStr = "";
    var eventsurl = "http://www.birmingham.ac.uk/web_services/Events.svc/";
    if (localStorage.getItem('student-events')==='true') {
        ekeyStr += "students,"
    }
    if (localStorage.getItem('sport-events')==='true') {
        ekeyStr += "sport,"
    }
    

    app.application.showLoading();
    var dataSource = null;
    
    if (ekeyStr.length>1) {
		ekeyStr = ekeyStr.substring(0,ekeyStr.length-1);
        
        eventsurl += "?keywords=" + ekeyStr;
    
    	dataSource = new kendo.data.DataSource({
    	    transport: {
    	        read: {
    	            url: eventsurl,
    	            dataType: "json"
    	        }
    	    },
    	    serverPaging: true,
    	    pageSize: 10,
    	    change: function (data) {
    	        app.application.hideLoading();
    	    }
    	});
	
	    $("#pull-eventslistview").kendoMobileListView({
	        dataSource: dataSource,
	        template: $("#events-template").text(),
	        pullToRefresh: true
	    });
    }
    else {
        $("#pull-eventslistview").kendoMobileListView().html("<li><div class='news-item'>No events currently available - have you disabled all events sources in your <a href='#tabstrip-settings'>settings</a>?</div></li>");
        app.application.hideLoading();
    }
   
    ScreenButtonClicked("events");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}


//Event Item
function eventItemView(e) {
    $("#event-detail").html('');
    app.application.showLoading();
    var contentId = parseInt(e.view.params.contentId);
    log(contentId);
    
    var eventSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "http://www.birmingham.ac.uk/web_services/Events.svc/" + contentId,   
                dataType: "json"
            }
        },
        
        schema: {
            data: function (data)
            {
                return [data];
            }
        },
        change: function (data) {
            var template = kendo.template($("#event-template").text());
            var event = kendo.render(template, this.view());
            log(event);
            $("#event-detail").html(event);
            app.application.hideLoading();
        }
    });
    
    eventSource.read();
    
    ScreenButtonClicked("event item:");
    log("stored:" + localStorage.getItem('allowUsageTracking') + ": EVENTITEM");
}

//NEWS
function newsListViewPullWithEndless(e) {
    
    //determine what's required: limit needed as is order by
    var keyStr = "";
    var newsurl = "http://www.birmingham.ac.uk/web_services/News.svc/";
    if (localStorage.getItem('student-news')==='true') {
        keyStr += "students,"
    }
    if (localStorage.getItem('research-news')==='true') {
        keyStr += "research,"
    }
    if (localStorage.getItem('sport-news')==='true') {
        keyStr += "sport,"
    }
    
    app.application.showLoading();
    var dataSource = null;
    
    if (keyStr.length>1) {
        newsurl += "?keywords=" + keyStr;
    	dataSource = new kendo.data.DataSource({
        	transport: {
            	read: {
            	    url: newsurl,
            	    dataType: "json"
            	}
        	},
        	serverPaging: true,
        	pageSize: 10,
        	change: function (data) {
            	app.application.hideLoading();
        	}
    	});

    	$("#pull-newslistview").kendoMobileListView({
    	    dataSource: dataSource,
    	    template: $("#news-template").text(),
    	    pullToRefresh: true
    	});
    
    }
    else {
        $("#pull-newslistview").kendoMobileListView().html("<li><div class='news-item'>No news currently available - have you disabled all news sources in your <a href='#tabstrip-settings'>settings</a>?</div></li>");
        app.application.hideLoading();
    }
    ScreenButtonClicked("news");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
    
}

//News Item
function newsItemView(e) {
    $("#news-detail").html('');
    app.application.showLoading();
    var contentId = parseInt(e.view.params.contentId);
    log(contentId);
    
    var newsSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "http://www.birmingham.ac.uk/web_services/News.svc/" + contentId,   
                dataType: "json"
            }
        },
        
        schema: {
            data: function (data)
            {
                return [data];
            }
        },
        change: function (data) {
            var template = kendo.template($("#news-item-template").text());
            var newsitem = kendo.render(template, this.view());
            log(newsitem);
            $("#news-detail").html(newsitem);
            app.application.hideLoading();
        }
    });
    
    newsSource.read();
    
    ScreenButtonClicked("news item:");
    log("stored:" + localStorage.getItem('allowUsageTracking') + ": NEWSITEM");
}

//HOME view
function homeInit() {
    
}
function homeShow() {

}

//INFO view
function infoShow() {
    ScreenButtonClicked("info");
    log("stored:" + localStorage.getItem('allowUsageTracking'));
}

//MAP view
function mapInit() {
        ScreenButtonClicked("map");
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
    
    //news
    var studentNewsVal = false;
    if (localStorage.getItem('student-news')==='true') {
        studentNewsVal = true;
    }
    var researchNewsVal = false;
    if (localStorage.getItem('research-news')==='true') {
        researchNewsVal = true;
    }
    var sportNewsVal = false;
    if (localStorage.getItem('sport-news')==='true') {
        sportNewsVal = true;
    }
    $("#research-news-switch").kendoMobileSwitch({
        checked: researchNewsVal,
        change: onNewsPrefChange
    });
    $("#student-news-switch").kendoMobileSwitch({
        checked: studentNewsVal,
        change: onNewsPrefChange
    });
    $("#sport-news-switch").kendoMobileSwitch({
        checked: sportNewsVal,
        change: onNewsPrefChange
    });
    
    //events
    var studentEventsVal = false;
    if (localStorage.getItem('student-events')==='true') {
        studentEventsVal=true;
    }
    var performanceEventsVal = false;
    if (localStorage.getItem('performance-events')==='true') {
        performanceEventsVal = true;
    }
    var sportEventsVal = false;
    if (localStorage.getItem('sport-events')==='true') {
        sportEventsVal = true;
    }
    var lectureEventsVal = false;
    if (localStorage.getItem('lecture-events')==='true') {
        lectureEventsVal = true;
    }
    var exhibitionEventsVal = false;
    if (localStorage.getItem('exhibition-events')==='true') {
        exhibitionEventsVal = true;
    }
    $("#performance-events-switch").kendoMobileSwitch({
        checked: performanceEventsVal,
        change: onNewsPrefChange
    });
    $("#student-events-switch").kendoMobileSwitch({
        checked: studentEventsVal,
        change: onNewsPrefChange
    });
    $("#sport-events-switch").kendoMobileSwitch({
        checked: sportEventsVal,
        change: onNewsPrefChange
    });
    $("#lecture-events-switch").kendoMobileSwitch({
        checked: lectureEventsVal,
        change: onNewsPrefChange
    });
    $("#exhibition-events-switch").kendoMobileSwitch({
        checked: exhibitionEventsVal,
        change: onNewsPrefChange
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
function guideInit() {
    
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

function onNewsPrefChange(e) {
    
    //alert(e + ": " + e.target + ": " + e.checked + ": " + this.element.attr("id") )
    var newsVar = this.element.attr("id");
    var newsVal = e.checked;
    var localStor = newsVar.replace("-switch", "");
    log(localStor + " : " + newsVal);
    localStorage.setItem(localStor, newsVal);
    
}

function onEventsPrefChange(e) {
    
}

//LOGGING    
function log(msg) {
    $('#log').val($('#log').val() + msg + '\n');
}

function cleanOutHtmlTags(content) {

    var myString =  content.replace("&lt;p&gt;","<p>").replace("&lt;/p&gt;","</p>");
    myString =  content.replace("&amp;","&");
    
    log("here")
    return myString;
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}