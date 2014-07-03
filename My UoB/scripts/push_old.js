(function (global) {
    var AlertViewModel,
    app = global.app = global.app || {};
	
    var el = new Everlive({
    	apiKey: 'tAgMU0P9nOfiJMF2',
    	scheme: 'https'
	});

    //mainViewModel = (function () {
    AlertViewModel = kendo.data.ObservableObject.extend({
        
        successText: "SUCCESS!<br /><br />The device has been initialized for push notifications.<br /><br />",       
		baasApiKey: 'tAgMU0P9nOfiJMF2',
		baasScheme: 'https',
		androidProjectNumber: "577074892731",
		emulatorMode: false,
    	       
        
        _onDeviceIsRegistered: function() {
            $("#initializeButton").hide();
            $("#registerButton").hide();
            $("#unregisterButton").show();
            $("#messageParagraph").html("Device is registered in Telerik BackEnd Services and can receive push notifications.");
        },    
            
        _onDeviceIsNotRegistered: function() {
            $("#unregisterButton").hide();
            $("#registerButton").show();
            $("#messageParagraph").html("Device is not registered in Telerik BackEnd Services. Tap the button below to register it.");
        },
        
        _onDeviceIsNotInitialized: function() {
            $("#unregisterButton").hide();
            $("#initializeButton").show();
            $("#messageParagraph").html("Device unregistered.<br /><br />Push token was invalidated and device was unregistered from Telerik BackEnd Services. No push notifications will be received.");
        },
        
        _onDeviceRegistrationUpdated: function() {
            $("#messageParagraph").html("Device registration updated.");
        },
        
        onAndroidPushReceived: function(args) {
            alert('Android notification received: ' + JSON.stringify(args)); 
        },
        
        onIosPushReceived: function(args) {
            alert('iOS notification received: ' + JSON.stringify(args)); 
        },
        
        //Initializes the device for push notifications.
        enablePushNotifications: function () {
            //Initialization settings
            var pushSettings = {
                android: {
                    senderID: this.androidProjectNumber
                },
                iOS: {
                    badge: "true",
                    sound: "true",
                    alert: "true"
                },
                notificationCallbackAndroid : this.onAndroidPushReceived,
                notificationCallbackIOS: this.onIosPushReceived
            }
            
            $("#initializeButton").hide();
            $("#messageParagraph").text("Initializing push notifications...");
            
            var currentDevice = el.push.currentDevice(this.emulatorMode);
            
            currentDevice.enableNotifications(pushSettings)
                .then(
                    function(initResult) {
                        $("#tokenLink").attr('href', 'mailto:test@example.com?subject=Push Token&body=' + initResult.token);
                        $("#messageParagraph").html("The device has been initialized for push notifications.<br />" + "Checking registration status...");
                        
                        return currentDevice.getRegistration();
                    },
                    function(err) {
                        $("#messageParagraph").html("ERROR!<br /><br />An error occured while initializing the device for push notifications.<br/><br/>" + err.message);
                    }
                ).then(
                    function(registration) {                        
                        alert("reg now");
                        this._onDeviceIsRegistered();                      
                    },
                    function(err) {                        
                        if(err.code === 801) {
                            this._onDeviceIsNotRegistered();      
                        }
                        else {                        
                            $("#messageParagraph").html("ERROR!<br /><br />An error occured while checking device registration status: <br/><br/>" + err.message);
                        }
                    }
                );
        },
        
        registerInEverlive: function() {
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
        },
        
        disablePushNotifications: function() {
            el.push.currentDevice()
                .disableNotifications()
                .then(
                    _onDeviceIsNotInitialized,
                    function(err) {
                        alert('UNREGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        },
        
        updateRegistration: function() {
            el.push.currentDevice()
                .updateRegistration({ Age: 16 })
                .then(
                    _onDeviceRegistrationUpdated,
                    function(err) {
                        alert('UPDATE ERROR: ' + JSON.stringify(err));
                    }
                );
        },
        
        
            enablePushNotifications: this.enablePushNotifications,
            registerInEverlive: this.registerInEverlive,
            disablePushNotifications: this.disablePushNotifications,
            updateRegistration: this.updateRegistration
        
            
    });
    
    app.alertService = {
        initAlert: function () {

//            app.locationService.viewModel.set("isGoogleMapsInitialized", true);
            
//            app.locationService.viewModel.onNavigateHome.apply(app.locationService.viewModel, []);

        },

        show: function (e) {
            
            //app.alertService.alertModel.showLoading();
            
            //log with analytics
			//ScreenButtonClicked("Alerts");

        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            //app.alertService.alertModel.hideLoading();
        },

        alertModel: new AlertViewModel()
    };
 
    
})(window);
