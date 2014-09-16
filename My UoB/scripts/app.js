(function (global) {
    
	var app = global.app = global.app || {};
	var gaPlugin;
	var offLine;
	
})(window);
                
function initialize() {
    "use strict";
    document.addEventListener("deviceready", onDeviceReady, true);
}
   
function onDeviceReady() {
    
 	window.addEventListener("offline", function() {        
        $(".offlineMessage").show();
        hideNetworkDependentItems();
        offLine = true;
    });
    window.addEventListener("online", function() {
        $(".offlineMessage").hide();
        showNetworkDependentItems();
		offLine = false;
    });
    
    $(".filterFeature").kendoMobileSwitch({
    	change: app.locationService.viewModel.onFilterFeature
    });
    
    if (navigator.onLine) {
    	$(".offlineMessage").hide();
        offLine = false;
    	showNetworkDependentItems();    
    } else {
    	$(".offlineMessage").show();
    	hideNetworkDependentItems();    
        offLine = true;
    }

    
    //GA
    gaPlugin = window.plugins.gaPlugin;
    console.log("stored:" + localStorage.getItem('allowUsageTracking'));
                                
    //if no variable stored locally, create one and set value as undefined
    if (!localStorage.getItem('allowUsageTracking')) {
        localStorage.setItem('allowUsageTracking','unset');
    }
    log("AllowUsageTracking: " + localStorage.getItem('allowUsageTracking'));
                            
    if (localStorage.getItem('allowUsageTracking')!="deny") {
        gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-47250154-2", 5);
        console.log('gaPlugin initialised');
    }
    
    console.log("stored(push):" + localStorage.getItem('allowPushNotifications'));
    //if no variable stored locally, create one and set value as undefined
    if (!localStorage.getItem('allowPushNotifications')) {
        localStorage.setItem('allowPushNotifications','deny');
    }
    console.log("allowPushNotifications: " + localStorage.getItem('allowPushNotifications'));
    
    //if no variable stored locally, create one and set value as undefined
    if (!localStorage.getItem('alerts')) {
        localStorage.setItem('alerts','[]');
    }

    //PUSH NOTIFICATIONS
    el = new Everlive({
    	apiKey: 'tAgMU0P9nOfiJMF2',
    	scheme: 'https'
	});
   
	//push settings
    var pushSettings = {
    	android: {
        	senderID: "577074892731"
        },
        iOS: {
        	badge: "true",
            sound: "true",
            alert: "true"
        },
        notificationCallbackAndroid : function(args) {
            $("#modalview-notification span#notification_message").html(args.message);
            alertDate = new Date();
            $("#modalview-notification span#notification_date").html(alertDate.toDateString());       
            openModalViewNotification();
        },
        notificationCallbackIOS: function(args) {
        	console.log('iOS notification received: ' + JSON.stringify(args)); 
            $("#modalview-notification span#notification_message").html(args.alert);
            alertDate = new Date();
            $("#modalview-notification span#notification_date").html(alertDate.toDateString());
            openModalViewNotification();
        }
	}
    
    //check if initialised already...
    el.push.currentDevice().enableNotifications(pushSettings, function() {console.log('Initialized successfully');}, function(e) {console.log('Initialization error: ' + e);});
    
    console.log("offline: " + offLine + "; pushSetting: " + localStorage.getItem('allowPushNotifications'));
    
    //register, if not already registered, not offline, and enabled
    var pushSet = localStorage.getItem('allowPushNotifications');
    if (!offLine && (pushSet=="unset" || pushSet=="allow")) {
        el.push.currentDevice().getRegistration(successCallback, function() {
    		console.log("Registering the device...");
            el.push.currentDevice().register();
    	});
    } else {
        console.log("NOT registering the device.");
    }
    
    //News and Events preferences
    if (!localStorage.getItem('newspreferences')) {
        	localStorage.setItem('student-news',true);
        	localStorage.setItem('research-news',true);
        	localStorage.setItem('sport-news',true);
        	localStorage.setItem('newspreferences','set');
        console.log('setting news preferences');
	}
    if (!localStorage.getItem('eventspreferences')) {
       	localStorage.setItem('performance-events',true);
        	localStorage.setItem('exhibition-events',true);
        	localStorage.setItem('lecture-events',true);
        	localStorage.setItem('sport-events',true);
        	localStorage.setItem('student-events',true);
        	localStorage.setItem('eventspreferences','set');
        console.log('setting events preferences');
	}
    
    $('#clearLog').on('click', function() {
        $('#log').val('');
    });
    
}

//GA plugin
function nativePluginResultHandler (result) {
    console.log('nativePluginResultHandler: '+result);
}
        
function nativePluginErrorHandler (error) {
    console.log('nativePluginErrorHandler: '+error);
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
    

function hideNetworkDependentItems() {
    $("li a.networkDependent").removeAttr("data-role").click(function(e) {
        	//e.preventDefault();
        	//return false;
    	}).parent().addClass("itemUnavailable");
}

function showNetworkDependentItems() {
    $("li a.networkDependent").attr("data-role");
    $("li a.networkDependent").click(function(e) {
        	//return true;
    	}).parent().removeClass("itemUnavailable");
}


//VIEW Init/Change Events

//EVENTS

function eventsInit() {
    
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
        change: onEventsPrefChange
    });
    $("#student-events-switch").kendoMobileSwitch({
        checked: studentEventsVal,
        change: onEventsPrefChange
    });
    $("#sport-events-switch").kendoMobileSwitch({
        checked: sportEventsVal,
        change: onEventsPrefChange
    });
    $("#lecture-events-switch").kendoMobileSwitch({
        checked: lectureEventsVal,
        change: onEventsPrefChange
    });
    $("#exhibition-events-switch").kendoMobileSwitch({
        checked: exhibitionEventsVal,
        change: onEventsPrefChange
    });
}

function eventListViewPullWithEndless(e) {
    
    var ekeyStr = "";
    dateNow = new Date();
    var twoWeeksTime = new Date();
	twoWeeksTime.setDate(+14);
    //format
    dateNowIso = dateNow.toISOString();
    twoWeeksTimeIso = twoWeeksTime.toISOString();
    var eventsurl = "http://www.birmingham.ac.uk/web_services/Events.svc/?startDate=" + dateNowIso + "&endDate=" + twoWeeksTimeIso;
    if (localStorage.getItem('student-events')==='true') {
        ekeyStr += "students "
    }
    if (localStorage.getItem('sport-events')==='true') {
        ekeyStr += "sport "
    }
    if (localStorage.getItem('performance-events')==='true') {
        ekeyStr += "performance "
    }
    if (localStorage.getItem('exhibition-events')==='true') {
        ekeyStr += "exhibibition "
    }
    if (localStorage.getItem('lecture-events')==='true') {
        ekeyStr += "lecture "
    }
	ekeyStr = $.trim(ekeyStr)
    
    if (!offLine) {
        app.application.showLoading();
        var dataSource = null;
        
        if (ekeyStr.length>1) {
            if(ekeyStr.indexOf(" ") != -1){
            	eventsurl += "&keywords=" + ekeyStr + "&keywordOperator=OR";
            } else {
            	eventsurl += "&keywords=" + ekeyStr + "";
            }
        	console.log("Events URL: " + eventsurl);
        	dataSource = new kendo.data.DataSource({
        	    transport: {
        	        read: {
        	            url: eventsurl,
        	            dataType: "json"
        	        }
        	    },
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
       
    }
    else {
          
		$("#pull-eventslistview").kendoMobileListView().html("<li><div class='event-item'>Events feed requires network connection</div></li>");        
    
    }
}


//Event Item
function eventItemView(e) {
    $("#event-detail").html('');
    app.application.showLoading();
    var contentId = parseInt(e.view.params.contentId);
    
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
            $("#event-detail").html(event);
            app.application.hideLoading();
        }
    });
    
    eventSource.read();
    
    ScreenButtonClicked("event item:");
}

//NEWS

function newsInit() {
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
    
}

function newsListViewPullWithEndless(e) {

    //determine what's required: limit needed as is order by
    var keyStr = "";
    var newsurl = "http://www.birmingham.ac.uk/web_services/News.svc/?days=10";
    
    if (localStorage.getItem('student-news')==='true') {
        keyStr += "students "
    }
    if (localStorage.getItem('research-news')==='true') {
        keyStr += "research "
    }
    if (localStorage.getItem('sport-news')==='true') {
        keyStr += "sport"
    }
    keyStr = $.trim(keyStr)
    
    if (!offLine) {
    
        app.application.showLoading();
        var dataSource = null;
        
        if (keyStr.length>1) {
            if(keyStr.indexOf(" ") != -1){
            	newsurl += "&keywords=" + keyStr + "&keywordOperator=OR";
            } else {
            	newsurl += "&keywords=" + keyStr + "";   
            }
        dataSource = new kendo.data.DataSource({
            	transport: {
                	read: {
                	    url: newsurl,
                	    dataType: "json"
                	}
            	},
            	change: function (data) {
                	app.application.hideLoading();
            	},
            	error: function (e) {
                    console.log("news datasource error:" + e.errors);

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
    }
    else {
		$("#pull-newslistview").kendoMobileListView().html("<li><div class='news-item'>News feed requires network connection</div></li>");        
    }
}

//News Item
function newsItemView(e) {
    $("#news-detail").html('');
    app.application.showLoading();
    var contentId = parseInt(e.view.params.contentId);
    
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
            $("#news-detail").html(newsitem);
            app.application.hideLoading();
        }
    });
    
    newsSource.read();
    
    ScreenButtonClicked("news item:");
}

function alertListView(e) {
    app.application.showLoading();
    if (localStorage.getItem("allowPushNotifications")=="deny") {
		$("#alertlistview").kendoMobileListView({
			dataSource:new kendo.data.DataSource({
            	data: [
        			{ Message: "You currently have push notifications disabled.", ModifiedAt: "" }
    			]
			}),
  		  template: $("#alerts-template").text(),
			pullToRefresh: true
    	});
    } else {
        $("#alertlistview").kendoMobileListView({
			dataSource:pastAlerts,
  		  template: $("#alerts-template").text(),
			pullToRefresh: true
        });
    }
	setTimeout(function () {app.application.hideLoading()}, 400);
}


//HOME view
function homeInit() {
    
}
function homeShow() {

}

//INFO view
function infoShow() {
    //check for network...
    if (!offLine) {
    	ScreenButtonClicked("info");
    }
}

//MAP view
function mapInit() {

}


//SETTINGS screen
function settingsInit() {
//function settingsShow()
    switchVal = true;
    if (localStorage.getItem('allowUsageTracking')==="deny") {
        switchVal = false;    
    }
    $("#usage-tracking-switch").kendoMobileSwitch({
        checked: switchVal,
        change: onTrackingChange
    });
    
    pushVal = true;
    if (localStorage.getItem('allowPushNotifications')==="deny") {
        pushVal = false;    
    }
    $("#push-notifications-switch").kendoMobileSwitch({
        checked: pushVal,
        change: onPushChange
    });
}

function settingsShow() {
	if (!offLine) {
    	ScreenButtonClicked("settings");
    }
}


//Guide view
function guideShow() {
	//check for network
    ScreenButtonClicked("pocket-guide");
//    log("stored:" + localStorage.getItem('allowUsageTracking'));
}

function guideInit() {
    
}

//Manage change of user preferences (GA tracking & Push Notifications)
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
function onPushChange(e) {
    console.log("Change Push Val : checked - " + e.checked + "");
    var allowPushVal;
    if (e.checked) {
        allowPushVal = "allow";
        PushNotificationsOn();
    }
    else {
        allowPushVal = "deny";
    	PushNotificationsOff();
        
    }
    console.log("New value : " + allowPushVal);
    localStorage.setItem('allowPushNotifications', allowPushVal);
    $("#alertlistview").data("kendoMobileListView").refresh();
}

//Initializes the device for push notifications.
function PushNotificationsOn() {
    console.log("enabling Push");
    //Initialization settings
	var successText = "SUCCESS!<br /><br />The device has been initialized for push notifications.<br /><br />";
    //enablePushNotifications();
    console.log("el" + el);
    console.log("dev" + el.push.currentDevice());
    console.log("pushSettings:");
    console.log(pushSettings);
    el.push.currentDevice().enableNotifications(pushSettings, successCallback, errorCallback);
    console.log(successText);
	registerInEverlive();
}

function PushNotificationsOff() {
    console.log("disabling Push");
    //Initialization settings
    console.log("el" + el);
    console.log("dev" + el.push.currentDevice());
    console.log("successCallback:" + successCallback);
    console.log("errorCallback:" + errorCallback);
    el.push.currentDevice().unregister(successCallback, errorCallback);
    }

function onNewsPrefChange(e) {
    
    console.log(e);
    var newsVar = this.element.attr("id");
    var newsVal = e.checked;
    var localStor = newsVar.replace("-switch", "");
    console.log(localStor + " : " + newsVal);
    localStorage.setItem(localStor, newsVal);
    console.log(localStor + " | " + localStorage.getItem(localStor));
    newsListViewPullWithEndless();

}

function onEventsPrefChange(e) {
    
    var eventsVar = this.element.attr("id");
    var eventsVal = e.checked;
    var localStor = eventsVar.replace("-switch", "");
    localStorage.setItem(localStor, eventsVal);
    eventListViewPullWithEndless();
    
}

function getFriendFacePosts() {
    
    if (!offLine) {
    	app.application.showLoading();
    	var dataSource = new kendo.data.DataSource({
        	transport: {
                	read: {
                        url: "http://www.friendface.alfred.bham.ac.uk/facebook/feed.json",
                	    dataType: "json"
                	}
            },
            change: function (data) {
            	app.application.hideLoading();
            }
     	});

     	$("#pull-friendfacelistview").kendoMobileListView({
        	    dataSource: dataSource,
        	    template: $("#friendface-template").text(),
        	    pullToRefresh: true
     	});    
		//log with analytics
		ScreenButtonClicked("facebook posts");        
    } else {
		$("#pull-friendfacelistview").kendoMobileListView().html("<li><div class='post-item'>Facebook feed requires network connection</div></li>");        
    }
}


function getTweets() {    
	//check network
    if (!offLine) {
        
    	app.application.showLoading();
    	var twitter_user  = "unibirmingham";
    	//pull-twitterlistview
    	var dataSource = new kendo.data.DataSource({
        	transport: {
            	read: {
                    url: "http://www.alfred.bham.ac.uk/twitter-api/index.php?screenname=" + twitter_user,
                    dataType: "json"
                }
            },
            change: function (data) {
            	app.application.hideLoading();
            }
		});

		$("#pull-twitterlistview").kendoMobileListView({
        	dataSource: dataSource,
        	template: $("#tweets-template").text(),
        	pullToRefresh: true
        });
        ScreenButtonClicked("Tweets");
	} else {
        $("#pull-twitterlistview").kendoMobileListView().html("<li><div class='tweet-item'>Twitter feed requires network connection</div></li>");
    }
}

//LOGGING    
function log(msg) {
    $('#log').val($('#log').val() + msg + '\n');
}

function cleanOutHtmlTags(content) {

    var myString =  content.replace("&lt;p&gt;","<p>").replace("&lt;/p&gt;","</p>");
    myString =  content.replace("&amp;","&");
    
    console.log("here")
    return myString;
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

function timeAgo(created, source) {
    		var date_str = created;
    		
    		if (source && source =="facebook") {
                var created_new = created.replace(/-/g, '/').replace('T', ' ').replace('+0000','');
                date_str = new Date(created_new);
            } else {
                
            }
    		
    		var date_tweet = new Date(date_str);
            var date_now   = new Date();
            var date_diff  = date_now - date_tweet;
            var hours      = Math.round(date_diff/(1000*60*60));
            var days = 0; 
            var timeStr = '';
            if (hours>=24) {
            	days =Math.round(hours/24);
                var dayUnit = "day";
                if (days>1) {
                	dayUnit = "days";
                }
                timeStr = '' + days + ' ' + dayUnit + ' ago';
            }
            else {
            	if (hours<1) {
                	timeStr = 'Just now...';
                }
                else {
                    var hourUnit = "hour";
                
                	if (hours>1) {
                		hourUnit = "hours";
                	}
                	timeStr = '' + hours + ' ' + hourUnit + ' ago';
            	}
            }
			return timeStr;
}

function prettyTime(dateStr) {
    var pTime = "";
    var pDate = new Date(parseInt(dateStr.replace("/Date(", "").replace(")/",""), 10));
    pTime = pDate.toLocaleTimeString();
    return pTime;    
}

function prettyDate(dateStr) {
    var pDate = "";
    if (dateStr) {
        pDate = new Date(dateStr).toLocaleString();
	}
    return pDate;
}

function cleanUpFacebookUrls(facebookurl) {
    cleanUrl = facebookurl.replace(/&amp;/g, "&")
    return cleanUrl;
}


function closeModalView() {
        $("#modalview-search").kendoMobileModalView("close");
    	$("#modalview-buildings").kendoMobileModalView("close");
}

function successCallback() {
    console.log("success from successCallback");
}

function errorCallback(e) {
    console.log("error callback: " + e);
}

function closeModalViewNotification() {
	$("#modalview-notification").kendoMobileModalView("close");
}

function openModalViewNotification() {
   $("#modalview-notification").data("kendoMobileModalView").open();
}

function clearAlerts() {
 
}


function refreshAlertsList() {
    
}

function resetAlertsList() {

}

var pushSettings = {
    	android: {
        	senderID: "577074892731"
        },
        iOS: {
        	badge: "true",
            sound: "true",
            alert: "true"
        },
        notificationCallbackAndroid : function(args) {
            $("#modalview-notification span#notification_message").html(args.message);
			//date
            alertDate = new Date();
            $("#modalview-notification span#notification_date").html(alertDate.toDateString());
            openModalViewNotification();
        },
        notificationCallbackIOS: function(args) {
            //this one?
        	console.log('iOS notification received: ' + JSON.stringify(args));
            console.log("Message:" + args.alert);
            $("#modalview-notification span#notification_message").html(args.alert);
            alertDate = new Date();
            $("#modalview-notification span#notification_date").html(alertDate.toDateString());
            openModalViewNotification();
        }
	}

var registerInEverlive = function() {
            var currentDevice = el.push.currentDevice();
            
            if (!currentDevice.pushToken) currentDevice.pushToken = "some token";
    		console.log("pushtoken: " + currentDevice.pushToken);
    		console.log("getRegistration: " + el.getRegistration);
    		//need to check if device is registered or not before attempting to register here...
            el.push.currentDevice()
                .register({ Age: 15 })
                .then(
                    console.log('REGISTER SUCCESS'),
                    function(err) {
                        console.log('REGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };