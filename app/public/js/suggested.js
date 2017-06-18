var suggestedRoute = angular.module('suggestedRoute', []);

suggestedRoute.controller('SuggestedController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var sugRoute = localStorage.getItem("suggestedRoute"); //getting the suggested route
    $scope.name =  localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");
    var sugJson = JSON.parse(sugRoute);
    console.log(sugJson.disabled_flag);
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
    if(sugJson.direction == "north") $scope.direction = "מצפון לדרום";
    else $scope.direction = "מדרום לצפון";
    $scope.tripStartPt = sugJson.trip_start_pt;
    $scope.tripEndPt = sugJson.trip_end_pt;
    $scope.tripDaysNum = sugJson.days_num;
    $scope.tripDayKm = sugJson.day_km;
    $scope.tripKm = sugJson.trip_km;
    $scope.tripDiff = sugJson.trip_difficulty;
    $scope.tripType = newTripType;

    if(sugJson.disabled_flag == true){
        var disabledElement = angular.element(document.querySelector('#sugDisabled'));
        disabledElement.html('<img id="disabledIcon" src="../images/DISABLED.png">');
    }
    
    //building all daily sections overview
    var routeDailySecs = ""; //holds all daily sections html
    for(var i=0; i<sugJson.daily_sections.length; i++){
        var dailySec = '<section class="suggesteDailySec"><h4 id="sugDayNum"> יום ' +  sugJson.daily_sections[i].day_num +
        ':</h4><div id="descTypeDiv"> <span class="dayDescType" id="dayDesc"> <b> מאפייני המסלול: </b> <br>';
        for(var j = 0; j<sugJson.daily_sections[i].description.length; j++){
            console.log(sugJson.daily_sections[i].description[j]);
            if(j == (sugJson.daily_sections[i].description.length)-1) {
                 dailySec += sugJson.daily_sections[i].description[j] +'</span>';
            }
            else {
                dailySec += sugJson.daily_sections[i].description[j] + ', ';
            }
        }
        dailySec+='<span class="dayDescType"> <b> אופי המסלול: </b><br>';
        for(var j = 0; j<sugJson.daily_sections[i].type.length; j++){
            console.log(sugJson.daily_sections[i].type[j]);
            if(j == (sugJson.daily_sections[i].type.length)-1) {
                 dailySec += sugJson.daily_sections[i].type[j] +'</span><div class="clear"></div></div>';
            }
            else {
                dailySec += sugJson.daily_sections[i].type[j] + ', ';
            }
        }
        dailySec+='<div class="sugDailyDetails"><div class="sugDayIcons"> <p class="sugDayDetail"> <img src="images/FROM_WHERE_TO.png"></p>'
        +'<p class="sugDayDetail"><img src="images/KM.png"></p> <p class="sugDayDetail"><img src="images/TIME.png"></p>'
        +'<p class="sugDayDetail"><img src="images/DIFFICULTY.png"></p></div>'
        +'<div class = "sugDayDetails"> <p class="sugDayDetail1"><span class="detailContent"> מ'+  sugJson.daily_sections[i].start_pt +' <br> ל'+  sugJson.daily_sections[i].end_pt +'</span></p>'
        +'<p class="sugDayDetail1"><span class="detailContent">'+  sugJson.daily_sections[i].total_km +'<br> ק"מ </span></p>'
        +'<p class="sugDayDetail1">'+ sugJson.daily_sections[i].duration +'<br> שעות </p> <p class="sugDayDetail1">'+  sugJson.daily_sections[i].difficulty +'</p></div></div></section>';
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
        var showBtn = angular.element(document.querySelector('#showDays'));
        //if the overview is is closed
        if($scope.isOpen == false){
            dailySecsContent.removeClass('hidden');
            dailySecsContent.addClass('visible');
            $scope.isOpen = true;
            showBtn.css('background', "url('../images/MORE1.png') no-repeat center");   
        } 
        //if the overview is open
        else {
            dailySecsContent.removeClass('visible');
            dailySecsContent.addClass('hidden');
            $scope.isOpen = false;
            showBtn.css('background', "url('../images/MORE.png') no-repeat center");
        }
    };

    //function to add the route to the traveler
    $scope.addRoute = function(){
        var tripId = parseInt(localStorage.getItem("idCounter"));
        console.log(tripId);
        var email = localStorage.getItem("email");
        var newIdCounter = tripId + 1;
        localStorage.setItem("idCounter", newIdCounter);
        var url = "https://routeit-ws.herokuapp.com/addRoute/" + tripId + "/" + email;
        $http.get(url).success(function(route){
            if(route != "routeNotAdded"){ 
                var routeStr = JSON.stringify(route); 
                localStorage.setItem("currentRoute", routeStr);
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
                window.location.assign("https://routeit-app.herokuapp.com/myroutes.html");
            }
        });
    };

    $scope.goBack = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.addClass("show");
        var maskElement = angular.element(document.querySelector('#pageMask'));
        maskElement.addClass("pageMask");
    }

    $scope.stay = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.removeClass("show");
        var maskElement = angular.element(document.querySelector('#pageMask'));
        maskElement.removeClass("pageMask");
    }

    $scope.back = function(){
        localStorage.setItem("suggestedBack", true);
        window.location.assign("https://routeit-app.herokuapp.com/routeform.html");
    }
}]);
