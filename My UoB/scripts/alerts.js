(function (global) {
    
    if (navigator.onLine) {
        alertsUrl = "http://api.everlive.com/v1/tAgMU0P9nOfiJMF2/Push/Notifications";
    }
    else {
        if (!localStorage.getItem('pastAlerts')) {
            alertsUrl = "data/alerts.json";
        }
    }
    
    pastAlerts = new kendo.data.DataSource({
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("pastAlerts");
                var sortExp = { "ModifiedAt" : -1 };
            	if((cachedData != null || cachedData != undefined) && (!navigator.onLine)) {
                	//if local data exists and we're offline, load from it
                	operation.success(JSON.parse(cachedData));
            	} else {
                	$.ajax({ 
						type: "GET",
                        url: alertsUrl,
                        headers: {
        					"Authorization": "Masterkey vBKiy80O5t4zil0Yup8L80bB6KEgFYns",
                            //only get sent messages
                            "X-Everlive-Filter": JSON.stringify({
            					"Status": 30
        					}),
                            //get latest
                            "X-Everlive-Sort" : JSON.stringify(sortExp),
                            //get first 16 only
                            "X-Everlive-Skip" : 0,
              			  "X-Everlive-Take" : 16
    					},
                   	 dataType: "json",
                   	 success: function(response) {
                   	     //store response, if online
                   	     //pass the pass response to the DataSource
                            if (response.Count == 0) {
                            	var resultStr = [{ Message: "No past alerts currently available.", ModifiedAt: "" }];
                            	localStorage.setItem("pastAlerts", JSON.stringify([{ Message: "No past alerts currently available.", ModifiedAt: "" }]));
                                operation.success(resultStr);
                            } else {
                                localStorage.setItem("pastAlerts", JSON.stringify(response.Result));
                                operation.success(response.Result);
                            }
                        }   
                	});
            	}
        	}
        }   
    })

})(window);