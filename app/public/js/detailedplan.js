var detailedPlan = angular.module('detailedPlan', []);

detailedPlan.controller('planController', ['$scope', '$http', '$compile' ,function($scope, $http, $compile){
    $scope.name  = localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");
    var userMail = localStorage.getItem("email");
    var flagPlan =  localStorage.getItem("planFlag");
    var routeOrigin;
  
    //if the route is from 'my routes'
    if(flagPlan == "current"){
        routeOrigin = JSON.parse(localStorage.getItem("currentRoute"));
    //if the route is from 'chosen routes'
    } else if(flagPlan == "currentDaily") {
        routeOrigin = JSON.parse(localStorage.getItem("currentDailyRoute"));
    //if the route is from 'daily route'
    } else routeOrigin = JSON.parse(localStorage.getItem("chosenRoute"));
    
    console.log(JSON.parse(localStorage.getItem("myRoutes")));
    console.log(routeOrigin);
    //if there are no dates chosen for the trip
    if(routeOrigin.start_date == null){
        $scope.sDate = "";
        $scope.eDate = "";
    //if there are dates chosen for the trip
    } else {
        var startDate = new Date(routeOrigin.start_date);
        var endDate = new Date(routeOrigin.end_date);
        var sDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear();
        var eDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear();
        if(sDateStr == eDateStr) {
            $scope.date = sDateStr;
        } else {
            $scope.date = eDateStr + " - " + sDateStr;
        }
    }
    $scope.start = routeOrigin.trip_start_pt;
    $scope.end = routeOrigin.trip_end_pt;
    var accommMarkers = [];

    $scope.clearAccommMarkers = function(){
        console.log(accommMarkers.length);
        if(accommMarkers.length != 0){
            for (var i = 0; i < accommMarkers.length; i++) {
                if (accommMarkers[i]) {
                    accommMarkers[i].setMap(null);
                }
            }
            accomMarkers = [];
        }
    }

    $scope.showChosenAccomm = function(){
        //show the sleep place marker on map if there is one
        $scope.clearAccommMarkers();
        for(var i=0; i<routeOrigin.daily_sections.length; i++){
            if(routeOrigin.daily_sections[i].chosen_accomm != null){
                var infowindow = new google.maps.InfoWindow();
                var service = new google.maps.places.PlacesService(map);

                service.getDetails({
                    placeId: routeOrigin.daily_sections[i].chosen_accomm.accomm_id
                }, function(place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        accommMarkers[i] = new google.maps.Marker({
                            map: map,
                            position: place.geometry.location
                        });
                        google.maps.event.addListener(accommMarkers[i], 'click', function() {
                            var phone = "";
                            if(place.formatted_phone_number) {
                                phone = place.formatted_phone_number +'<br>';
                            }
                            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                            place.vicinity + '<br>' + phone +'מקום לינה נבחר! </div>');
                            infowindow.open(map, this);
                        });
                    }
                });
            }
        }
    }

    //function that shows the details about each daily section  
    $scope.showDailySections = function(){
        console.log("inside");
        var dailySections = []; //details of all daily sections
        if(flagPlan == "current"){
            routeOrigin = JSON.parse(localStorage.getItem("currentRoute"));
        //if the route is from 'chosen routes'
        } else if(flagPlan == "currentDaily") {
            routeOrigin = JSON.parse(localStorage.getItem("currentDailyRoute"));
        //if the route is from 'daily route'
        } else routeOrigin = JSON.parse(localStorage.getItem("chosenRoute"));
        //getting all details for each daily section
        for(var i = 0; i< routeOrigin.daily_sections.length; i++){
            var chosenAccomm ="";
            console.log(routeOrigin.daily_sections[i].chosen_accomm);
            
            //if there isn't a chosen accomm for the day 
            if(routeOrigin.daily_sections[i].chosen_accomm == null){}
            //if there is a chosen accomm for the day 
            else {
                //console.log("#deleteAccomm"+routeOrigin.daily_sections[i].day_num);
                var deleteElem = angular.element(document.querySelector('#deleteAccomm'+routeOrigin.daily_sections[i].day_num));
                console.log(deleteElem);
                deleteElem.html("&#10006;");
                var phone = "";
                if(routeOrigin.daily_sections[i].chosen_accomm.phone != null){
                    phone = ", "+routeOrigin.daily_sections[i].chosen_accomm.phone;
                }
                var accommStr = routeOrigin.daily_sections[i].chosen_accomm.accomm_name + phone;
                chosenAccomm = accommStr;
            }
            //if there are no dates
            if(routeOrigin.start_date == null) {
                var dailySection = {
                    dayNum: routeOrigin.daily_sections[i].day_num,
                    dayDate: "",
                    weekDay: "",
                    startPt: routeOrigin.daily_sections[i].start_pt,
                    endPt: routeOrigin.daily_sections[i].end_pt,
                    duration: routeOrigin.daily_sections[i].duration,
                    km: routeOrigin.daily_sections[i].total_km,
                    diff: routeOrigin.daily_sections[i].difficulty,
                    chosenAccomm: chosenAccomm
                };
            //if there are dates
            }else {
                var tmpDate = new Date(routeOrigin.daily_sections[i].date);
                var dateStr = tmpDate.getDate() + "/" + (tmpDate.getMonth()+1);
                var dateDay = tmpDate.getDay();
                var daysArr = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "יום ש'"];
                    
                //details for a certain daily section
                var dailySection = {
                    dayNum: routeOrigin.daily_sections[i].day_num,
                    dayDate: dateStr,
                    weekDay: daysArr[dateDay],
                    startPt: routeOrigin.daily_sections[i].start_pt,
                    endPt: routeOrigin.daily_sections[i].end_pt,
                    duration: routeOrigin.daily_sections[i].duration,
                    km: routeOrigin.daily_sections[i].total_km,
                    diff: routeOrigin.daily_sections[i].difficulty,
                    chosenAccomm: chosenAccomm
                };
            }
            dailySections.push(dailySection);
        }
        $scope.dailySections = dailySections;
        //$scope.showChosenAccomm();
    }

    //function that returns to the page the traveler came from
    $scope.goBack = function(){
        if(flagPlan == "current"){
            window.location.assign("http://localhost:8080/myroutes.html");
        //if the route is from 'chosen routes'
        } else if(flagPlan == "currentDaily") {
            window.location.assign("http://localhost:8080/chosenroutes.html");
        //if the route is from 'daily route'
        } else window.location.assign("http://localhost:8080/dailyroute.html");
    }

    var markers = [];
    var accommDayNum;
    var placeId, placeName, placePhone; //specific accomm info 

    //function to show markers of sleeping places for a day on the map
    $scope.showAccomm = function(endPt, dayNum){
        accommDayNum = dayNum;
        var address = endPt +', ישראל';
        console.log(address);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
          'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var Lat = results[0].geometry.location.lat();
                var Lng = results[0].geometry.location.lng();
                console.log(results[0].geometry.location.lat() +  " " + results[0].geometry.location.lng());
                window.map.setCenter(new google.maps.LatLng(Lat, Lng));
                window.map.setZoom(14);
            } else {
                alert("Something got wrong " + status);
            }
            showPlaces();
        });

        //showing sleeping places markers on the map
        function showPlaces(){
            var places = new google.maps.places.PlacesService(window.map);
            var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';

            // Search for hotels in the selected city, within the viewport of the map.
            function search() {
              var search = {
                location: window.map.getCenter(),
                radius: '1000',
                types: ['lodging']
              };
              console.log(window.map.getCenter().lat + " " + window.map.getCenter().lng);
              places.nearbySearch(search, function(results, status) {
                clearMarkers();
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  // Create a marker for each hotel found, and
                  // assign a letter of the alphabetic to each marker icon.
                  for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                      position: results[i].geometry.location,
                      animation: google.maps.Animation.DROP,
                      icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                  }
                }
              });
            }

            function dropMarker(i) {
                return function() {
                    markers[i].setMap(window.map);
                };
            }
            $scope.infowindow = new google.maps.InfoWindow();

            // Get the place details for a hotel. Show the information in an info window,
            // anchored on the marker for the hotel that the user selected.
            function showInfoWindow() {
              var marker = this;
              places.getDetails({placeId: marker.placeResult.place_id},
                  function(place, status) {
                    placeId = place.place_id;
                    placeName = place.name;
                    placePhone = place.formatted_phone_number;
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                      return;
                    }
                    var content = '<div id="windowContent"><strong>' + place.name + '</strong><br>' + place.vicinity + '<br>'; 
                    if(place.formatted_phone_number) {
                        content += place.formatted_phone_number +'<br>';
                    }
                    if(place.rating) {
                        var ratingHtml = '';
                        for (var i = 0; i < 5; i++) {
                            if (place.rating < (i + 0.5)) {
                                ratingHtml += '&#10025;';
                            } else {
                                ratingHtml += '&#10029;';
                            }
                        }
                        content+=ratingHtml + '<br>';
                    }
                    content+='<button id="accommBtn" ng-click="saveAccomm()"> בחר מקום זה! </button></div>';
                    console.log(content);
                    var linkingFunction = $compile(content);
                    var elem = linkingFunction($scope);
                    $scope.infowindow.setContent(elem[0]);
                    $scope.infowindow.open(window.map, marker);
                  });
            }
            search();
        }
    }

    function clearMarkers() {
        console.log(markers.length);
        if(markers.length != 0){
            for (var i = 0; i < markers.length; i++) {
                if (markers[i]) {
                    markers[i].setMap(null);
                }
            }
            markers = [];
        }
    }

    //function that saves the chosen accomm for a specific day
    $scope.saveAccomm = function(){
        console.log("Day: " + accommDayNum);
        console.log(placeName + " " + placeId + " " + placePhone);
        var accommObj = {
            accomm_name: placeName,
            phone: placePhone,
            accomm_id: placeId
        };
        var accommStr = accommObj.accomm_name + "," + accommObj.phone + "," + accommObj.accomm_id;
        console.log(accommStr);

        $http.get("http://localhost:3000/saveAccomm/" + userMail + "/" + routeOrigin.trip_id + "/" + accommStr + "/" + accommDayNum).success(function(route){
            //updating the chosen accomm of local current route
            for(var i = 0; i<routeOrigin.daily_sections.length; i++){
                if(routeOrigin.daily_sections[i].day_num == accommDayNum){
                    console.log("found the updated route!");
                    routeOrigin.daily_sections[i].chosen_accomm = accommObj;
                    break;
                }
            }
            //if the route is from 'my routes'
            if(flagPlan == "current"){
                localStorage.setItem("currentRoute", JSON.stringify(routeOrigin));
            //if the route is from 'chosen routes'
            } else if(flagPlan == "currentDaily") {
                localStorage.setItem("currentDailyRoute", JSON.stringify(routeOrigin));
            //if the route is from 'daily route'
            } else localStorage.setItem("chosenRoute", JSON.stringify(routeOrigin));
            //updating the route in my routes, and in daily routes if exists
            var myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
            var dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    myRoutesArr[i] = routeOrigin;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    dailyRoutesArr[i] = routeOrigin;
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
            clearMarkers();
            $scope.showChosenAccomm();
            $scope.showDailySections();
        });
    }

    //function that deletes accomm for a specific day
    $scope.deleteAccomm = function(dayNum){
        console.log(dayNum);
        $http.get("http://localhost:3000/deleteAccomm/" + userMail + "/" + routeOrigin.trip_id + "/" + dayNum).success(function(route){
            //updating the chosen accomm of local current route
            for(var i = 0; i<routeOrigin.daily_sections.length; i++){
                if(routeOrigin.daily_sections[i].day_num == dayNum){
                    console.log("found the updated route!");
                    routeOrigin.daily_sections[i].chosen_accomm = null;
                    break;
                }
            }
            //if the route is from 'my routes'
            if(flagPlan == "current"){
                localStorage.setItem("currentRoute", JSON.stringify(routeOrigin));
            //if the route is from 'chosen routes'
            } else if(flagPlan == "currentDaily") {
                localStorage.setItem("currentDailyRoute", JSON.stringify(routeOrigin));
            //if the route is from 'daily route'
            } else localStorage.setItem("chosenRoute", JSON.stringify(routeOrigin));
            //updating the route in my routes, and in daily routes if exists
            var myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
            var dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    myRoutesArr[i] = routeOrigin;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    dailyRoutesArr[i] = routeOrigin;
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
            $scope.showChosenAccomm();
            $scope.showDailySections();
        });   
    }

    var isThereAccomm = [];
    //drawing detailed plan route map
    window.initMap = function(){
        document.getElementById('map').className = 'miniMap';
        
        window.flagPlan =  localStorage.getItem("planFlag");
        window.routeOrigin;
        //if the route is from 'my routes'
        if(flagPlan == "current"){
            routeOrigin = JSON.parse(localStorage.getItem("currentRoute"));
        //if the route is from 'chosen routes'
        } else if(flagPlan == "currentDaily") {
            routeOrigin = JSON.parse(localStorage.getItem("currentDailyRoute"));
        //if the route is from 'daily route'
        } else routeOrigin = JSON.parse(localStorage.getItem("chosenRoute"));
        var tripCoordsArr = []; // all daily sections coords
        var tmpCoordsArr = []; // holds coords temporarily 
        var dailyCoordsArray = []; // holds one daily section's coords
        for(var i=0; i<routeOrigin.daily_sections.length; i++){
            for(var j=0; j<routeOrigin.daily_sections[i].coord_array.length; j++){
                var dailyCoord = {
                    lat: Number(routeOrigin.daily_sections[i].coord_array[j].lat),
                    lng: Number(routeOrigin.daily_sections[i].coord_array[j].lng)
                }
                dailyCoordsArray.push(dailyCoord);
            }
            tripCoordsArr = tmpCoordsArr.concat(dailyCoordsArray);
            dailyCoordsArray = [];
            tmpCoordsArr = tripCoordsArr;
        }
        var centerCoord = tripCoordsArr[parseInt(tripCoordsArr.length/2)];
        window.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: centerCoord,
            mapTypeId: google.maps.MapTypeId.ROAD
        });
        var lineCoordinatesPath = new google.maps.Polyline({
            path: tripCoordsArr,
            geodesic: true,
            strokeColor: '#004d00',
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
        lineCoordinatesPath.setMap(window.map);

        var alertMarkers = [];
        var dayAlerts;
        var k = 0;
        console.log(routeOrigin.daily_sections.length);
        for(var j=0; j<routeOrigin.daily_sections.length; j++){
            dayAlerts = routeOrigin.daily_sections[j].alert;
            if(dayAlerts.length != 0){
                for(var i=0; i<dayAlerts.length; i++, k++){
                    console.log(dayAlerts[i]);
                    var coord = {
                        lat: Number(dayAlerts[i].coord.lat),
                        lng: Number(dayAlerts[i].coord.lng)
                    }
                    alertMarkers[k] = new google.maps.Marker({
                        position: coord,
                        map: map,
                        title: dayAlerts[i].content
                    });
                    var infowindow = new google.maps.InfoWindow();
                    google.maps.event.addListener(alertMarkers[k], 'click', function() {
                        var marker = this;
                        var content = '<div id="alertContent">' + this.title +'</div>';   
                        infowindow.setContent(content);
                        infowindow.open(map, this);
                    }); 
                }
            }
        }
        $scope.showChosenAccomm();  
    }
    $scope.showDailySections();
}]);