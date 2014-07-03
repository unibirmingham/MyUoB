(function (global) {
    var map,
        geocoder,
        LocationViewModel,
    	me,
    	markers = [],
    	serviceMarkers = [],
    	retailMarkers = [],
    	learningMarkers = [],
    	transportMarkers = [],
    	cultureMarkers = [],
    	buildingMarkers = [],
    	paramMarker = [],
    	
        app = global.app = global.app || {};
    
    if (navigator.onLine) {
        buildingsUrl = "data/map-buildings.json";
        categoriesUrl = "http://www.butler.bham.ac.uk/pocket_guides/index.json";
        facilitiesUrl = "http://www.butler.bham.ac.uk/pocket_guides/index.json";
    }
    else {
        if (!localStorage.getItem('buildings')) {
            buildingsUrl = "data/map-buildings.json";
        }
        if (!localStorage.getItem('categories')) {
            buildingsUrl = "data/map-categories.json";
        }
        if (!localStorage.getItem('facilities')) {
            buildingsUrl = "data/map-facilities.json";
        }
    }
    if (!localStorage.getItem('campus')) {
            localStorage.setItem('campus', 'Edgbaston');
    }
    
    buildings = new kendo.data.DataSource({
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("buildings");
            	if((cachedData != null || cachedData != undefined) && (!navigator.onLine)) {
                	//if local data exists and we're offline, load from it
                	operation.success(JSON.parse(cachedData));
            	} else {
                	$.ajax({ 
                   	 url: buildingsUrl,
                   	 dataType: "json",
                   	 success: function(response) {
                   	     //store response, if online 
                   	     if (navigator.onLine) {
                                localStorage.setItem("buildings", JSON.stringify(response));
                            }
                   	     //pass the response to the DataSource
                   	     operation.success(response);
                            
                   	 }
                	});
            	}
        	}
        },
        
        schema: {
            parse: function(response) {
                var buildings = [];
                for (var i =0; i < response.length; i++) {
                    var building = {
                        id: response[i].ContentId,
                        BuildingName: response[i].BuildingName,
                        BuildingCode: response[i].BuildingCode,
                        Colour: response[i].Colour,
                        DisplayName: response[i].BuildingName + " (" + response[i].BuildingCode + ")"
                    };
                    buildings.push(building);
                }
                return buildings;
            }        
        },
        filter: { field: "BuildingName", operator: "eq", value: "baloney" }
    })
    
    categories = new kendo.data.DataSource({
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("categories");
            	if((cachedData != null || cachedData != undefined) && (!navigator.onLine)) {
                	operation.success(JSON.parse(cachedData));
            	} else {
                	$.ajax({ 
                   	 url: categoriesUrl,
                   	 dataType: "json",
                   	 success: function(response) {
                   	     if (navigator.onLine) {
                                localStorage.setItem("categories", JSON.stringify(response));
                            }
                   	     operation.success(response);
                   	 }
                	});
            	}
        	}
        }   
    })
    
    facilities = new kendo.data.DataSource({
		transport: {
            read: function(operation) {
	            var cachedData = localStorage.getItem("facilities");
            	if((cachedData != null || cachedData != undefined) && (!navigator.onLine)) {
                	operation.success(JSON.parse(cachedData));
            	} else {
                	$.ajax({ 
                   	 url: facilitiesUrl,
                   	 dataType: "json",
                   	 success: function(response) {
                   	     if (navigator.onLine) {
                                localStorage.setItem("facilities", JSON.stringify(response));
                            }
                   	     operation.success(response);
                   	 }
                	});
            	}
        	}
        }   
    })
    
    LocationViewModel = kendo.data.ObservableObject.extend({
        _lastMarker: null,
        _isLoading: false,
        _buildingName: "building",
        _buildingCode: "",
        address: "",
        isGoogleMapsInitialized: false,

        onNavigateHome: function () {
            var that = this,
                position;

            that._isLoading = true;
            that.showLoading();

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    me = position;
                    map.panTo(position);
                    that._putMarker(position);

                    that._isLoading = false;
                    that.hideLoading();
                },
                function (error) {
                    //default map coordinates
                    position = new google.maps.LatLng(52.450343, -1.930547);
                    map.panTo(position);

                    that._isLoading = false;
                    that.hideLoading();

                    navigator.notification.alert("Unable to determine current location. Cannot connect to GPS satellite.",
                        function () { }, "Location failed", 'OK');
                },
                {
                    timeout: 30000,
                    enableHighAccuracy: true
                }
            );
            
            selCamp = localStorage.getItem('campus');
    		$('#map-campus option[value="' + selCamp + '"]').prop('selected', true);
            
            
            
        },
        
        // Sets the map on all markers in the array.
		setAllMap: function (map) {
  		for (var i = 0; i < markers.length; i++) {
    		markers[i].setMap(map);
  		}
		},
        
        // Sets the map on markers in the provided array. NOT USED
		setMarkersMap: function (map, coll) {
  		for (var i = 0; i < coll.length; i++) {
    		coll[i].setMap(map);
  		}
		},

		// Removes the markers from the map, but keeps them in the array.
		clearAllMarkers: function () {
            var that = this;
  			that.setAllMap(null);
		},
        
        clearMarkers: function (coll) {
            var that = this;
            
  		  that.setMarkersMap(null,coll);
		},

		// Shows any markers currently in the array.
		showMarkers: function () {
			var that = this;
            that.setAllMap(map);
		},

		// Deletes all markers in the array by removing references to them.
		deleteAllMarkers: function () {
  		  var that = this;
			that.clearAllMarkers();
  		  markers = [];
            serviceMarkers = [];
        	retailMarkers = [];
        	learningMarkers = [];
        	transportMarkers = [];
        	cultureMarkers = [];
            buildingMarkers = [];
            $("#map-feature").val("");
            that.set("featureType","");
            
            //turn off all switches
            $("#map-feature-culture").data("kendoMobileSwitch").check(false);
            $("#map-feature-retail").data("kendoMobileSwitch").check(false);
            $("#map-feature-learning").data("kendoMobileSwitch").check(false);
            $("#map-feature-services").data("kendoMobileSwitch").check(false);
            $("#map-feature-transport").data("kendoMobileSwitch").check(false);
           
       },
        
        // Deletes markers in the array by removing references to them.
		deleteMarkers: function (category) {
			var that = this;
            if (category) {
                //alert(category);
                switch (category) {
                case "Culture":
                    that.clearMarkers(cultureMarkers);
                	cultureMarkers = [];
                	break;
                case "Retail":
                    that.clearMarkers(retailMarkers);
                	retailMarkers = [];
                	break;
                case "Transport":
                    that.clearMarkers(transportMarkers);
                	transportMarkers = [];
                	break;
                case "Learning and Teaching":
                	that.clearMarkers(learningMarkers);
                    learningMarkers = [];
                	break;
                case "Services":
                	that.clearMarkers(serviceMarkers);
                    serviceMarkers = [];
                	break;
            	}
            }
            
            
            
		},
       
        getCatCode: function (code) {
            
            that = this;
            _catCode= "0\/1\/2836\/2837\/2854";
            if (code) {
                $.ajax({
  				url: 'data/map-categories.json',
  				async: false,
  				dataType: 'json',
  				success: function (response) {
                      $.each(response, function() {
                          if (code === this.Name) {
                          	_catCode = this.Key;
                          }
                      })
  				}
				});
                return _catCode;
                
            }
            
            return _catCode;
            
        },
        
        
            

        
        
        
        getBuilding: function(id) {
            that = this;
            if (id === 0) {
                return null
            }
            else {

                $.ajax({
  				url: 'data/map-buildings.json',
  				async: false,
  				dataType: 'json',
  				success: function (response) {
    				// do stuff with response.
                      $.each(response, function() {
                          if (id === this.ContentId) {
 
                              		_buildingName = this.BuildingName;
                              		_buildingCode = this.BuildingCode;
                                }
                      })
  				}
				});
                return _buildingName + ";" + _buildingCode;

            }
        },
        
 
        
        mapBuilding: function (contentId) {
            var that = this;
            
            $.getJSON("data/map-buildings.json", function(data) {
 
                $.each(data, function() {

                        if (this.ContentId == contentId) {
                            //alert("boom" + contentId);
                            var myLatlng = new google.maps.LatLng(parseFloat(this.PolygonCoordinatesAsArrayList[0][0]),parseFloat(this.PolygonCoordinatesAsArrayList[0][1]));
                            //alert(myLatlng);
                            that.createMarker(myLatlng, this.BuildingName, this.BuildingName + ";" + this.BuildingCode, "building", this.BuildingCode.substr(0,1));
                            map.panTo(myLatlng);
                            
                        }
				}); 
            }).error(function(error) {
				  	alert(error.message);
			});
                
            
            
        },
        
        
        
        mapFacilities: function (category) {
            var that = this;
            if (category) {
                var cat = that.getCatCode(category);
            //} else {
                //map all facilities
                $.getJSON("data/map-facilities.json", function(data) {
 
                	$.each(data, function() {

                        if (this.CategoryAsTaxonomyIds.indexOf(cat) != -1) {
                        	
                            var myLatlng = new google.maps.LatLng(parseFloat(this.CoordinatesArray[0]),parseFloat(this.CoordinatesArray[1]));
                            var id = this.BuildingId;
                            that.createMarker(myLatlng, this.FacilityName, that.getBuilding(id), category, null);
                        }
	            	});
 
            	}).error(function(error) {
				  	alert(error.message);
				});
                
            }
        },
        
        mapFacility: function (contentId, category) {
            var that = this;
            $.getJSON("data/map-facilities.json", function(data) {
 
                	$.each(data, function() {

                        if (this.ContentId == contentId) {
                            //alert("boom" + contentId);
                            var cat = "";
                        	if (category) {
                                cat = category;
                            }
                            var myLatlng = new google.maps.LatLng(parseFloat(this.CoordinatesArray[0]),parseFloat(this.CoordinatesArray[1]));
                            var id = this.BuildingId;
                            that.createMarker(myLatlng, this.FacilityName, that.getBuilding(id), cat, null);
                            map.panTo(myLatlng);
                        }
                        
	            	});
 
            	}).error(function(error) {
				  	alert(error.message);
				});
        },
        
        
        onFilterFeature: function (e) {
    		var that = this;
            //alert(e + ": " + e.target + ": " + e.checked + ": " + this.element.attr("id") )
            log(e);
            var featureId = this.element.attr("id");
            var featureVar = this.element.attr("name");
            var featureVal = e.checked;
            
            //alert(featureVar);
            if (featureVal) {
                app.locationService.viewModel.mapFacilities(featureVar);
            }
            else {
                app.locationService.viewModel.deleteMarkers(featureVar);
            }
            
		},

        onSearchAddress: function () {
            //var that = this;
            //var ft = that.get("featureType");
            //that.mapFacilities(ft);

            var that = this;
            
            var defaultBounds = new google.maps.LatLngBounds(
  				    new google.maps.LatLng(52.447744, -1.936833),
  				    new google.maps.LatLng(52.464511, -1.924045)
                    );
  			//map.fitBounds(defaultBounds);
            
            geocoder.geocode(
                {
                    'address': that.get("address"),
                    'bounds': defaultBounds 
                    //"bounds": "34.172684,-118.604794|34.236144,-118.500938"
                },
                function (results, status) {
					//alert(results[0].geometry.location);
                    
                    
                    
                    if (status !== google.maps.GeocoderStatus.OK) {
                        navigator.notification.alert("Unable to find address.",
                            function () { }, "Search failed", 'OK');

                        return;
                    }
                    
                    map.panTo(results[0].geometry.location);
                    that._putMarker(results[0].geometry.location);
                });
            closeModalView();
        },
        
        onCampusSelect: function () {
            var that = this;
            var camp = that.get("campus");
            
            switch (camp) {
                case "Edgbaston":
                    position = new google.maps.LatLng(52.450343, -1.930547);
                	
                    map.panTo(position);
                	localStorage.setItem('campus', 'Edgbaston');
                	break;
                case "Selly":
                    position = new google.maps.LatLng(52.434874, -1.946983);
                	
                    map.panTo(position);
                	localStorage.setItem('campus', 'Selly');
                	break;
                case "Dental":
                    position = new google.maps.LatLng(52.485691, -1.895232);
                
                    map.panTo(position);
                	localStorage.setItem('campus', 'Dental');
                	break;
            }
        },
        
        closeMapDrawerButton: function () {
            $("#map-drawer").data("kendoMobileDrawer").hide();
            //$(".drawer-link").removeClass("active");
            //$(this).addClass("active");
            return false;
        },
        
        onCampusHome: function() {
        	var that = this;

            that._isLoading = true;
            that.showLoading();

            switch (localStorage.getItem('campus')) {
                case "Edgbaston":
                    position = new google.maps.LatLng(52.450343, -1.930547);
                    map.panTo(position);
                	break;
                case "Selly":
                    position = new google.maps.LatLng(52.434874, -1.946983);
                    map.panTo(position);
                	break;
                case "Dental":
                    position = new google.maps.LatLng(52.485691, -1.895232);
                    map.panTo(position);
                	break;
                default:
                	position = new google.maps.LatLng(52.450343, -1.930547);
            		map.panTo(position);
                	
            }
            
			//that._putMarker(position);
            
            that._isLoading = false;
            that.hideLoading();

        },
        

        showLoading: function () {
            if (this._isLoading) {
                app.application.showLoading();
            }
        },

        hideLoading: function () {
            app.application.hideLoading();
        },

        _putMarker: function (position) {
            var that = this;

            if (that._lastMarker !== null && that._lastMarker !== undefined) {
                that._lastMarker.setMap(null);
            }

            that._lastMarker = new google.maps.Marker({
                map: map,
                position: position
            });
        },
        
        putPin: function (position) {
            var that = this;
            //var pinColor = "66CCFF";
    		//var pinImageGood = new google.maps.MarkerImage("images/computers.png");
        },
        
        createMarker: function (position, facilityTitle, buildingName, category, zone){
            var icon = "images/uni.png";
            var catMarkerCollection = learningMarkers;
			var windowState = "closed";
            
            switch (category.toUpperCase()) {
                case "CULTURE":
                	icon = "images/art.png";
                	catMarkerCollection = cultureMarkers;
                	break;
                case "RETAIL":
                	icon = "images/retail.png";
            	    catMarkerCollection = retailMarkers;
                	break;
                case "TRANSPORT":
                	icon = "images/trans.png";
                	catMarkerCollection = transportMarkers;
                	break;
                case "SERVICES":
                	icon = "images/pin.png";
                	catMarkerCollection = serviceMarkers;
                	break;
            	case "BUILDING":
                	if (zone) {
                		icon = "images/building_" + zone + ".png";
                	} else {
                        icon = "images/building_other.png";
                    }   	
                	catMarkerCollection = buildingMarkers;
                	windowState = "open";
                	break;
            }
            marker = new google.maps.Marker({
    			map: map,
     		   position: position,
    			title: facilityTitle,
    			icon: new google.maps.MarkerImage(icon)
    		});
            markers.push(marker);
            catMarkerCollection.push(marker);
            var descripDiv = ""
            if (category.toUpperCase()==="BUILDING") {
                descripDiv = "<div class='markerInfo'>";
            }
            else {
            	descripDiv = "<div class='markerInfo'><span class='markerTitle'>" + facilityTitle + "</span>";
            }

            if (buildingName) {
                var bui = buildingName.split(";");
                if (category.toUpperCase()==="BUILDING") {
                    descripDiv = descripDiv + "<span class='markerTitle'>" + bui[0] + " (" + bui[1] + ")</span>";
                }
                var imgLoc = "images/buildings/" + bui[1] + ".jpg";
                descripDiv = descripDiv + "<br/><img src='" + imgLoc + "'/>"
                if (!category.toUpperCase()==="BUILDING") {
                	descripDiv = descripDiv + "<br/><span class='facilityLocation'>Building: " + bui[0] + " " + "(" + bui[1] + ")</span>";
            	}
				//get distance
                descripDiv = descripDiv + "<br/><span class='distance'>Distance: " + distance(position.lat(), position.lng(),me.lat(),me.lng()) + " (approx)</span>";
                //alert(position.lat());
                //descripDiv = descripDiv + "<br/><span class='distance'>Distance: " + distance(52.356522,-1.998138,52.454217648033463,-1.9306327754630956) + "</span>";
            }
            descripDiv = descripDiv + "</div>";
            
            this.addInfoWindow(map, marker, descripDiv, windowState)
			
        },
        
        addInfoWindow: function(map, marker, message, windowstate) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
            
            if (windowstate==="open"){
                infoWindow.open(map, marker);
            }
        },
        
        oneMarkerAtTime: function ()
    	{
        	google.maps.event.addListener(marker,"animation_changed",function()
        	{
        	   if(marker.getAnimation()==null)
        	    {
        	        createMarker(currentMarkerIndex+=1);
        	    }
        	});
        
    	}
    });

    app.locationService = {
        initLocation: function () {
            var mapOptions;

            if (typeof google === "undefined"){
                return;
            } 

            app.locationService.viewModel.set("isGoogleMapsInitialized", true);
            
            
            
            
            $("#filterable-buildings").kendoMobileListView({
            dataSource: buildings,
            template: $("#buildings-template").text(),
            filterable: {
                field: "DisplayName",
                operator: "contains"
            }
            })
            

            mapOptions = {
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
                mapTypeControl: true,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                }
            };

            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
            
            geocoder = new google.maps.Geocoder();
            app.locationService.viewModel.onNavigateHome.apply(app.locationService.viewModel, []);

        },

        show: function (e) {
            if (!app.locationService.viewModel.get("isGoogleMapsInitialized")) {
                return;
            }

            //show loading mask in case the location is not loaded yet 
            //and the user returns to the same tab
            app.locationService.viewModel.showLoading();
            
            //log with analytics
			ScreenButtonClicked("Location");

            //resize the map in case the orientation has been changed while showing other tab
            google.maps.event.trigger(map, "resize");
            //alert(e.dataItem);
            
            var cid = e.view.params.contentId;
            var cat = e.view.params.category;
            if (cid) {
                if (cat === "building") {
                 	app.locationService.viewModel.mapBuilding(cid);   
                }
                else {
                	app.locationService.viewModel.mapFacility(cid, cat);
                }
            }

        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            app.locationService.viewModel.hideLoading();
        },

        viewModel: new LocationViewModel()
    };
    
    
    
}
)(window);

function distance(lon1, lat1, lon2, lat2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
  var dLon = (lon2-lon1).toRad(); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  var dm = parseFloat(d*1000).toFixed(0); //distance in m
    return dm + "m";
}

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

/*
window.navigator.geolocation.getCurrentPosition(function(pos) {
  console.log(loc); 
  console.log(
    distance(pos.coords.longitude, pos.coords.latitude, 42.37, 71.03)
  ); 
});
*/