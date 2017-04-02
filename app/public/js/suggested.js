var suggestedRoute = angular.module('suggestedRoute', []);

suggestedRoute.controller('SuggestedController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var sugRoute = localStorage.getItem("suggestedRoute"); //getting the suggested route
    //console.log(sugRoute);
    var sugJson = JSON.parse(sugRoute);
    //console.log(sugJson);
    //getting suggested route overview
    $scope.area = sugJson.area;
    $scope.tripStartPt = sugJson.trip_start_pt;
    $scope.tripEndPt = sugJson.trip_end_pt;
    $scope.tripDaysNum = sugJson.days_num;
    $scope.tripKm = sugJson.trip_km;
    $scope.tripDiff = sugJson.trip_difficulty;
    $scope.tripType = sugJson.trip_type;
    $scope.tripSites = sugJson.trip_sites;

    //building all daily sections overview
    var routeDailySecs = ""; //holds all daily sections html
    for(var i=0; i<sugJson.daily_sections.length; i++){
        var dailySec = '<section class="suggesteDailySec"><span> מספר יום: ' +  sugJson.daily_sections[i].day_num +
        '</span><br> <span> נקודת התחלה: ' +  sugJson.daily_sections[i].start_pt + 
        '</span><br> <span>  נקודת סיום: ' +  sugJson.daily_sections[i].end_pt + 
        '</span><br> <span> מספר ק"מ: ' +  sugJson.daily_sections[i].total_km +
        '</span><br> <span> רמת קושי: ' +  sugJson.daily_sections[i].difficulty +
        '</span><br> <span> משך: ' +  sugJson.daily_sections[i].duration + ' שעות </span></section><br>';
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
        //var url = "http://localhost:3000/addRoute/" + sugRoute +"/" + tripId + "/" + email;
        /*$http.post(url).success(function(data){
            //if(data == "routeAdded") window.location.assign("http://localhost:8080/userprofile.html");
        });*/
        
        //var url1 = "http://localhost:3000/zibi/", newSug;
        /*$http({
            url1: url,
            method: "POST",
            data: { bla: sugRoute },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
                // success
        }); */
    };
}]);
