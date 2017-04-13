var suggestedRoute = angular.module('suggestedRoute', []);

suggestedRoute.controller('SuggestedController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var sugRoute = localStorage.getItem("suggestedRoute"); //getting the suggested route
    //console.log(sugRoute);
    if(JSON.parse(sugRoute) == "segmentsErr"){
        console.log("entering if");
        var mainElement = angular.element(document.querySelector('#sugMain'));
        mainElement.html('<p> אין מספיק ימי טיול עבור נקודת ההתחלה שהבחרה. <br> נסה להוריד את ימי הטיול/את מספר הק"מ ליום </p>'); 
    } else if(JSON.parse(sugRoute) == "typeErr"){
        console.log("entering if");
        var mainElement = angular.element(document.querySelector('#sugMain'));
        mainElement.html('<p> המסלול אינו תואם את אופי הטיול שבחרת </p>'); 
    } else if(JSON.parse(sugRoute) == "diffErr"){
        console.log("entering if");
        var mainElement = angular.element(document.querySelector('#sugMain'));
        mainElement.html('<p> המסלול אינו תואם את רמת הקושי שבחרת </p>'); 
    } else if(JSON.parse(sugRoute) == "typeDiffErr"){
        console.log("entering if");
        var mainElement = angular.element(document.querySelector('#sugMain'));
        mainElement.html('<p> המסלול אינו תואם את אופי הטיול ואת רמת הקושי שבחרת </p>'); 
    } else {
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
        
        var newTripSites = [];
        for(var i=0; i<sugJson.trip_sites.length; i++){
            if(i == (sugJson.trip_sites.length)-1){
                newTripSites[i] = sugJson.trip_sites[i];
            } else newTripSites[i] = sugJson.trip_sites[i] + ", ";
        }

        var newTripType = [];
        for(var i=0; i<sugJson.trip_type.length; i++){
            if(i == (sugJson.trip_type.length)-1){
                newTripType[i] = sugJson.trip_type[i];
            } else newTripType[i] = sugJson.trip_type[i] + ", ";
        }

        //getting suggested route overview
        $scope.area = sugJson.area;
        $scope.tripStartPt = sugJson.trip_start_pt;
        $scope.tripEndPt = sugJson.trip_end_pt;
        $scope.tripDaysNum = sugJson.days_num;
        $scope.tripDayKm = sugJson.day_km;
        $scope.tripKm = sugJson.trip_km;
        $scope.tripDiff = sugJson.trip_difficulty;
        $scope.tripSites = newTripSites;
        $scope.tripType = newTripType;

        //building all daily sections overview
        var routeDailySecs = ""; //holds all daily sections html
        for(var i=0; i<sugJson.daily_sections.length; i++){
            var dailySec = '<section class="suggesteDailySec"><span> מספר יום: ' +  sugJson.daily_sections[i].day_num +
            '</span><br> <span> נקודת התחלה: ' +  sugJson.daily_sections[i].start_pt + 
            '</span><br> <span>  נקודת סיום: ' +  sugJson.daily_sections[i].end_pt + 
            '</span><br> <span> מספר ק"מ: ' +  sugJson.daily_sections[i].total_km +
            '</span><br> <span> רמת קושי: ' +  sugJson.daily_sections[i].difficulty +
            '</span><br> <span> משך: ' +  sugJson.daily_sections[i].duration + ' שעות </span> <br> <span> תיאור המסלול: ';
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
        var email = localStorage.getItem("email");
        var newIdCounter = tripId + 1;
        localStorage.setItem("idCounter", newIdCounter);
        var url = "http://localhost:3000/addRoute/" + tripId + "/" + email;
        $http.get(url).success(function(route){
            if(route != "routeNotAdded"){ 
                var routeStr = JSON.stringify(route); 
                localStorage.setItem("currentRoute", routeStr);
                window.location.assign("http://localhost:8080/userprofile.html");
            }
        });
    };
    }
}]);
