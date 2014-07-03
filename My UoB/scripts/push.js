var _onDeviceIsRegistered = function() {
	$("#initializeButton").hide();
    $("#registerButton").hide();
    $("#unregisterButton").show();
    $("#messageParagraph").html(successText + "Device is registered in Telerik BackEnd Services and can receive push notifications.");
};

var _onDeviceIsNotRegistered = function() {
            $("#unregisterButton").hide();
            $("#registerButton").show();
            $("#messageParagraph").html(successText + "Device is not registered in Telerik BackEnd Services. Tap the button below to register it.");
        };
        
        var _onDeviceIsNotInitialized = function() {
            $("#unregisterButton").hide();
            $("#initializeButton").show();
            $("#messageParagraph").html("Device unregistered.<br /><br />Push token was invalidated and device was unregistered from Telerik BackEnd Services. No push notifications will be received.");
        };
        
        var _onDeviceRegistrationUpdated = function() {
            $("#messageParagraph").html("Device registration updated.");
        };
        
      
        //Initializes the device for push notifications.
        var enablePushNotifications = function () {
            //Initialization settings
            //alert("enablePushNotifications");
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
            		var data = JSON.parse(localStorage.getItem("alerts"));
                    data.push("[" + args = "]");
                    localStorage.setItem("alerts", data);
                    //add to alertsData
                    //move to Alerts View (if open)
                    //kendoMobileApp.navigate('#tabstrip-alerts');
                    //alert(data);
                    alert('Android notification received: ' + JSON.stringify(args));
        		},
                notificationCallbackIOS: function(args) {
            		alert('iOS notification received: ' + JSON.stringify(args)); 
        		}
            }
            
            //$("#initializeButton").hide();
            //alert("Initializing push notifications...");
            
        //    var currentDevice = el.push.currentDevice();
            //alert(currentDevice);
            //el.push.currentDevice("false");
            
            el.push.currentDevice().enableNotifications(pushSettings, function() {alert('Initialized successfully');}, function() {alert('Initialization error');});
         	/*
            currentDevice.enableNotifications(pushSettings)
                .then(
                    function(initResult) {
                        //$("#tokenLink").attr('href', 'mailto:test@example.com?subject=Push Token&body=' + initResult.token);
                        alert(initResult.token);
                        //$("#messageParagraph").html(successText + "Checking registration status...");
                        return currentDevice.getRegistration();
                    },
                    function(err) {
                        alert("ERROR!<br /><br />An error occured while initializing the device for push notifications.<br/><br/>" + err.message);
                    }
                ).then(
                    function(registration) {                        
                        _onDeviceIsRegistered();                      
                    },
                    function(err) {                        
                        if(err.code === 801) {
                            _onDeviceIsNotRegistered();      
                        }
                        else {                        
                            alert("ERROR!<br /><br />An error occured while checking device registration status: <br/><br/>" + err.message);
                        }
                    }
                );
            */
        };
        
        var registerInEverlive = function() {
            var currentDevice = el.push.currentDevice();
            
            if (!currentDevice.pushToken) currentDevice.pushToken = "some token";
            el.push.currentDevice()
                .register({ Age: 15 })
                .then(
                    _onDeviceIsRegistered,
                    function(err) {
                        alert('REGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        var disablePushNotifications = function() {
            el.push.currentDevice()
                .disableNotifications()
                .then(
                    _onDeviceIsNotInitialized,
                    function(err) {
                        alert('UNREGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        var updateRegistration = function() {
            el.push.currentDevice()
                .updateRegistration({ Age: 16 })
                .then(
                    _onDeviceRegistrationUpdated,
                    function(err) {
                        alert('UPDATE ERROR: ' + JSON.stringify(err));
                    }
                );
        };
    
