var suggestedRoute = angular.module('suggestedRoute', []);

suggestedRoute.controller('SuggestedController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var sugRoute = localStorage.getItem("suggestedRoute"); //getting the suggested route
    $scope.name =  localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");
    var sugJson = JSON.parse(sugRoute);
    //merge daily sections coord arrays
    var tripCoordsArr = []; // all daily sections coords
    var tmpCoordsArr = []; // holds coords temporarily 
    var dailyCoordsArray = []; // holds one daily section's coords
    for(var i=0; i<sugJson.daily_sections.length; i++){
        for(var j=0; j<sugJson.daily_sections[i].coord_array.length; j++){
            var dailyCoord = {
                lat: Number(sugJson.daily_sections[i].coord_array[j].lat),
                lng: Number(sugJson.daily_sections[i].coord_array[j].lng)
            }
            dailyCoordsArray.push(dailyCoord);
        }
        tripCoordsArr = tmpCoordsArr.concat(dailyCoordsArray);
        dailyCoordsArray = [];
        tmpCoordsArr = tripCoordsArr;
    }
    var suggestedCoords = JSON.stringify(tripCoordsArr);
    localStorage.setItem("suggestedCoords", suggestedCoords);

    var newTripType = [];
    for(var i=0; i<sugJson.trip_type.length; i++){
        if(i == (sugJson.trip_type.length)-1){
            newTripType[i] = sugJson.trip_type[i];
        } else newTripType[i] = sugJson.trip_type[i] + ", ";
    }

    //getting suggested route overview
    $scope.area = sugJson.area;
    if(sugJson.direction == "north") $scope.direction = "צפון -> דרום";
    else $scope.direction = "דרום -> צפון";
    $scope.tripStartPt = sugJson.trip_start_pt;
    $scope.tripEndPt = sugJson.trip_end_pt;
    $scope.tripDaysNum = sugJson.days_num;
    $scope.tripDayKm = sugJson.day_km;
    $scope.tripKm = sugJson.trip_km;
    $scope.tripDiff = sugJson.trip_difficulty;
    $scope.tripType = newTripType;

    //building all daily sections overview
    var routeDailySecs = ""; //holds all daily sections html
    for(var i=0; i<sugJson.daily_sections.length; i++){
        var dailySec = '<section class="suggesteDailySec"><span> מספר יום: ' +  sugJson.daily_sections[i].day_num +
        '</span><br> <span> נקודת התחלה: ' +  sugJson.daily_sections[i].start_pt + 
        '</span><br> <span>  נקודת סיום: ' +  sugJson.daily_sections[i].end_pt + 
        '</span><br> <span> מספר ק"מ: ' +  sugJson.daily_sections[i].total_km +
        '</span><br> <span> רמת קושי: ' +  sugJson.daily_sections[i].difficulty +
        '</span><br> <span> משך: ' +  sugJson.daily_sections[i].duration + ' שעות </span> <br> <span> מאפייני המסלול: ';
        for(var j = 0; j<sugJson.daily_sections[i].description.length; j++){
            console.log(sugJson.daily_sections[i].description[j]);
            dailySec += sugJson.daily_sections[i].description[j] + '<br>';
        }
        dailySec+='</span></section><br>';
        routeDailySecs+=dailySec;
    }
    $scope.dailySecs = routeDailySecs;
    //console.log($scope.dailySecs);
        
    //adding daily sections overview to html
    var dailySecsContent = angular.element(document.querySelector('#dailySecs'));
    dailySecsContent.html($scope.dailySecs);

    $scope.isOpen = false; //flag to check if the daily sections overview is open
    //function to show and hide daily sections overview
    $scope.showHide = function(){
        //if the overview is is closed
        if($scope.isOpen == false){
            dailySecsContent.removeClass('hidden');
            dailySecsContent.addClass('visible');
            $scope.isOpen = true;   
        } 
        //if the overview is open
        else {
            dailySecsContent.removeClass('visible');
            dailySecsContent.addClass('hidden');
            $scope.isOpen = false;
        }
    };

    //function to add the route to the traveler
    $scope.addRoute = function(){
        var tripId = parseInt(localStorage.getItem("idCounter"));
        console.log(tripId);
        var email = localStorage.getItem("email");
        var newIdCounter = tripId + 1;
        localStorage.setItem("idCounter", newIdCounter);
        var url = "http://localhost:3000/addRoute/" + tripId + "/" + email;
        $http.get(url).success(function(route){
            if(route != "routeNotAdded"){ 
                /*var routeStr = JSON.stringify(route); 
                localStorage.setItem("currentRoute", routeStr);*/
                var myRoutes = localStorage.getItem("myRoutes");
                //if 'my routes' is empty
                if(myRoutes == "null") {
                    //update myRoutes localy
                    var myRoutesArr = [route];
                    var myRoutesStr = JSON.stringify(myRoutesArr);
                    localStorage.setItem("myRoutes", myRoutesStr);
                //if there are trips in 'my routes'
                } else {
                    //update myRoutes localy
                    var myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
                    myRoutesArr.push(route);
                    var myRoutesStr = JSON.stringify(myRoutesArr);
                    localStorage.setItem("myRoutes", myRoutesStr); 
                }
                window.location.assign("http://localhost:8080/myroutes.html");
            }
        });
    };

    $scope.goBack = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.addClass("show");
    }

    $scope.stay = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.removeClass("show");
    }

    $scope.back = function(){
        localStorage.setItem("suggestedBack", true);
        window.location.assign("http://localhost:8080/routeform.html");
    }
}]);
