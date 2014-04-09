(function (global) {
    var map,
        geocoder,
        LocationViewModel,
    	markers = [],
        app = global.app = global.app || {};
    	

    LocationViewModel = kendo.data.ObservableObject.extend({
        _lastMarker: null,
        _isLoading: false,
        _buildingName: "building",
         
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
        },
        
        // Sets the map on all markers in the array.
		setAllMap: function (map) {
  		for (var i = 0; i < markers.length; i++) {
    		markers[i].setMap(map);
  		}
		},

		// Removes the markers from the map, but keeps them in the array.
		clearMarkers: function () {
            var that = this;
  		that.setAllMap(null);
		},

		// Shows any markers currently in the array.
		showMarkers: function () {
			var that = this;
            that.setAllMap(map);
		},

		// Deletes all markers in the array by removing references to them.
		deleteMarkers: function () {
  		  var that = this;
            //alert("bioom");
            that.clearMarkers();
  			markers = [];
            $("#map-feature").val("");
            that.set("featureType","");
		},
        
        getMarkers: function () {
            //return map.markers;
        },
        
        
        
        getCatCode: function (code) {
            
            that = this;
            _catCode= "0\/1\/2836\/2837\/2854";
            //alert(code);
            if (code) {
                $.ajax({
  				url: 'data/map-categories.json',
  				async: false,
  				dataType: 'json',
  				success: function (response) {
    				// do stuff with response.
                      $.each(response, function() {
                          if (code === this.Name) {
                          	_catCode = this.Key;
                              //alert(this.Key);
                              
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
                                }
                      })
  				}
				});
                return _buildingName;

            }
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
                            that.createMarker(myLatlng, this.FacilityName, that.getBuilding(id), category);
                        }
	            	});
 
            	}).error(function(error) {
				  	alert(error.message);
				});
                
            }
        },
        
        

        onSearchAddress: function () {
            var that = this;

            /*
            geocoder.geocode(
                {
                    'address': that.get("address")
                },
                function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        navigator.notification.alert("Unable to find address.",
                            function () { }, "Search failed", 'OK');

                        return;
                    }

                    map.panTo(results[0].geometry.location);
                    that._putMarker(results[0].geometry.location);
                });
            */
            var ft = that.get("featureType");
            that.mapFacilities(ft);
            
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
        
        createMarker: function (position, facilityTitle, buildingName, category){
            var icon = "images/uni.png";
            switch (category) {
                case "Culture":
                	icon = "images/art.png";
                	break;
                case "Retail":
                	icon = "images/retail.png";
                	break;
                case "Transport":
                	icon = "images/trans.png";
                	break;
            }
            marker = new google.maps.Marker({
    			map: map,
     		   position: position,
    			title: facilityTitle,
    			icon: new google.maps.MarkerImage(icon)
    		});
            markers.push(marker);
            var descripDiv = "<div class='markerInfo'><span class='markerTitle'>" + facilityTitle + "</span>";
            if (buildingName) {
                descripDiv = descripDiv + "<br/><span class='facilityLocation'>Building: " + buildingName + "</span>";
            }
            
            //descripDiv = descripDiv + "<span class='markerDistance'>Distance: " + locations[index].distance + "m. </span>";
            descripDiv = descripDiv + "</div>";
            
            this.addInfoWindow(map, marker, descripDiv)

            //that.oneMarkerAtTime();
        },
        
        addInfoWindow: function(map, marker, message) {

            var infoWindow = new google.maps.InfoWindow({
                content: message
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open(map, marker);
            });
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

            //resize the map in case the orientation has been changed while showing other tab
            google.maps.event.trigger(map, "resize");
            //alert(e.dataItem);
            
            
            
        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            app.locationService.viewModel.hideLoading();
        },

        viewModel: new LocationViewModel()
    };
    
    
    //, click: onSearchAddress" 
}
)(window);