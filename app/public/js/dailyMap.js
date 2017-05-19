function initMap() {
    var chosenRoute = JSON.parse(localStorage.getItem("chosenRoute"));
    var myRoutes = localStorage.getItem("myRoutes");
    //if there isn't a current trip for the current day
    //if(myRoutes == null || myRoutes == "[]" || chosenRoute == "null"){
    console.log("chosen in js: "+ chosenRoute);
    if(chosenRoute != null){
        var currentDate = new Date(); //today's date
        var foundDay = false; //flag to check if the trip days have the current date
        for(var i = 0; i< chosenRoute.daily_sections.length; i++){
            var tmpDate = new Date(chosenRoute.daily_sections[i].date);
            if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) && (currentDate.getFullYear() == tmpDate.getFullYear())){
                currentDayPos = i;
                foundDay = true;
            }  
        }
        console.log(foundDay);
        if(foundDay == false) localStorage.setItem("chosenRoute", null);
    }
    var chosenRoute = JSON.parse(localStorage.getItem("chosenRoute"));
    if(chosenRoute == null){
         navigator.geolocation.getCurrentPosition(function(position){
            window.lat = position.coords.latitude;
            window.lng = position.coords.longitude;
            map  = new google.maps.Map(document.getElementById('map'), {
                center:{lat:window.lat, lng:window.lng},
                zoom:13,
                mapTypeId: google.maps.MapTypeId.ROAD
            });
            var mark = new google.maps.Marker({position:{lat:lat, lng:lng}, map:map});
            document.getElementById('map').className = 'backgroundMap';
        });
    }
    //if there is a chosen trip for the current day
    else {
        document.getElementById('map').className = 'miniMap'; //change map display settings
        var dailyCoordsArray = []; // holds one daily section's coords
        // get the current day coords
        var currentDate = new Date(); //today's date
        var currentDayPos = 0;
        var foundDay = false; //flag to check if the trip days have the current date
        //find the current trip day 
        for(var i = 0; i< chosenRoute.daily_sections.length; i++){
            var tmpDate = new Date(chosenRoute.daily_sections[i].date);
            if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) && (currentDate.getFullYear() == tmpDate.getFullYear())){
                currentDayPos = i;
                foundDay = true;
                break;
            }  
        }
        //when the current trip day was found - fill the daily coords array
        if(foundDay == true){
            for(var j=0; j<chosenRoute.daily_sections[currentDayPos].coord_array.length; j++){
                var dailyCoord = {
                    lat: Number(chosenRoute.daily_sections[currentDayPos].coord_array[j].lat),
                    lng: Number(chosenRoute.daily_sections[currentDayPos].coord_array[j].lng)
                }
                dailyCoordsArray.push(dailyCoord);
            }
        }
        var centerCoord = dailyCoordsArray[parseInt(dailyCoordsArray.length/2)];

        var map; //holds the google map
        var mark; //pin on map that shows user's position

        //creating 'my location' button to add to the map
        function CenterControl(controlDiv, map) {
            // Set CSS for the control border.
            var controlUI = document.createElement('div');
            controlUI.style.backgroundColor = '#fff';
            controlUI.style.border = '2px solid #fff';
            controlUI.style.borderRadius = '3px';
            controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
            controlUI.style.cursor = 'pointer';
            controlUI.style.marginBottom = '22px';
            controlUI.style.textAlign = 'center';
            controlUI.title = 'Click to recenter the map';
            controlDiv.appendChild(controlUI);

            // Set CSS for the control interior.
            var controlText = document.createElement('div');
            controlText.style.color = 'rgb(25,25,25)';
            controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
            controlText.style.fontSize = '16px';
            controlText.style.lineHeight = '38px';
            controlText.style.paddingLeft = '5px';
            controlText.style.paddingRight = '5px';
            controlText.innerHTML = '&#9737;';
            controlUI.appendChild(controlText);

            // Setup the click event listeners - set the map to the user's current location
            controlUI.addEventListener('click', function() {
                navigator.geolocation.getCurrentPosition(function(position){
                    window.lat = position.coords.latitude;
                    window.lng = position.coords.longitude;
                    map.setCenter({lat:window.lat, lng:window.lng, alt:0});
                });
            });
        }

        //get the user's current position and put it on the map 
        navigator.geolocation.getCurrentPosition(function(position){
            window.lat = position.coords.latitude;
            window.lng = position.coords.longitude;
            map  = new google.maps.Map(document.getElementById('map'), {
                center:centerCoord,
                zoom:13,
                mapTypeId:google.maps.MapTypeId.ROAD
            });

            //draws the route by its coordinates
            var lineCoordinatesPath = new google.maps.Polyline({
                path: dailyCoordsArray,
                geodesic: true,
                strokeColor: '#004d00',
                strokeOpacity: 1.0,
                strokeWeight: 4
            });
            lineCoordinatesPath.setMap(map);
            
            var dayAlerts = chosenRoute.daily_sections[currentDayPos].alert;
            var alertMarkers = [];
            if(dayAlerts.length != 0){
                for(var i =0; i<dayAlerts.length; i++){
                    console.log(dayAlerts[i]);
                    var coord = {
                        lat: Number(dayAlerts[i].coord.lat),
                        lng: Number(dayAlerts[i].coord.lng)
                    }
                    alertMarkers[i] = new google.maps.Marker({
                        position: coord,
                        map: map,
                        title: dayAlerts[i].content
                    });
                    var infowindow = new google.maps.InfoWindow();
                    google.maps.event.addListener(alertMarkers[i], 'click', function() {
                        var marker = this;
                        var content = '<div id="alertContent">' + this.title +'</div>';   
                        infowindow.setContent(content);
                        infowindow.open(map, this);
                    });
                }
            }

            //adding a pin with the chosen accomm for the day
            if(chosenRoute.daily_sections[currentDayPos].chosen_accomm != null){
                console.log(chosenRoute.daily_sections[currentDayPos].chosen_accomm);
                var infowindow = new google.maps.InfoWindow();
                var service = new google.maps.places.PlacesService(map);

                service.getDetails({
                  placeId: chosenRoute.daily_sections[currentDayPos].chosen_accomm.accomm_id
                }, function(place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        var marker = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location
                        });
                        google.maps.event.addListener(marker, 'click', function() {
                            var content = '<div><strong>' + place.name + '</strong><br>' + place.vicinity + '<br>'; 
                            if(place.formatted_phone_number) {
                                content += place.formatted_phone_number;
                            }
                            content+='</div>';
                            infowindow.setContent(content);
                            infowindow.open(map, this);
                        });
                    }
                });
            }

            //add the 'my locaiton' button
            var centerControlDiv = document.createElement('div');
            var centerControl = new CenterControl(centerControlDiv, map);
            centerControlDiv.index = 1;
            map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
            mark = new google.maps.Marker({position:{lat:lat, lng:lng}, map:map});
        });
        //function that redraws the user's current position
        var redraw = function(payload) {
            lat = payload.message.lat;
            lng = payload.message.lng;
            mark.setPosition({lat:lat, lng:lng, alt:0});
        }; 
        var pnChannel = "map-channel";
        var pubnub = new PubNub({
            publishKey: 'pub-c-17c5478f-c63f-436a-8f06-8e0da70e9069',
            subscribeKey: 'sub-c-36f24c50-dafe-11e6-9c30-0619f8945a4f'
        });    
        pubnub.subscribe({channels: [pnChannel]});
        pubnub.addListener({message:redraw});
        //check the user's position every 5 secs
        setInterval(function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                window.lat = position.coords.latitude;
                window.lng = position.coords.longitude;
                console.log(window.lat + " " + window.lng);
                pubnub.publish({channel:pnChannel, message:{lat:window.lat, lng:window.lng}});
            });  
        }, 5000);
    }
}