var dailyRoute = angular.module('dailyRoute', []);

dailyRoute.controller('dailyController', ['$scope', '$http', '$compile', function($scope, $http, $compile){    
    var userMail = localStorage.getItem("email");
    var myRoutes = localStorage.getItem("myRoutes");
    var chosenRoute = localStorage.getItem("chosenRoute");
    $scope.name =  localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");
    var currentDate = new Date(); //today's trip date
    var currentDateStr = currentDate.getDate() + "/" + (currentDate.getMonth()+1) + "/" + currentDate.getFullYear();
    var currentWeekDay = currentDate.getDay();
    var daysArr = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "יום ש'"];
    var currentDayStr = daysArr[currentWeekDay];
    var noRoutesContent = '<div id = "map"></div><h1>' + currentDayStr + ' ' + currentDateStr + '</h1><p> אין מסלול מתוכנן עבור יום זה </p><a href="http://localhost:8080/routeform.html">תכנן מסלול חדש</a>';
    var htmlContent;
    var dailyContent = angular.element(document.querySelector('#dailyContent'));
    
    //if the user has no routes
    if(myRoutes == "[]" || myRoutes == null){
        console.log("there are no routes");
        dailyContent.html(noRoutesContent);
    }
    //if the user has routes
    else {
        chosenRoute = localStorage.getItem("chosenRoute");
        console.log(chosenRoute);
        //if there is a chosen route for the day 
        if(chosenRoute != "null"){
            console.log("there is a chosen route planned for today");
            chosenRoute = JSON.parse(localStorage.getItem("chosenRoute")); //getting the current route
            htmlContent = '<h1 id="dailyDayDate">' + currentDayStr + ' ' + currentDateStr + '</h1>';
            console.log(chosenRoute.daily_sections.length);
            //serching the current day
            for(var i = 0; i< chosenRoute.daily_sections.length; i++){
                var tmpDate = new Date(chosenRoute.daily_sections[i].date);
                if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                    && (currentDate.getFullYear() == tmpDate.getFullYear())){
                    var start = chosenRoute.daily_sections[i].start_pt;
                    var end = chosenRoute.daily_sections[i].end_pt;
                    var duration = chosenRoute.daily_sections[i].duration;
                    var diff = chosenRoute.daily_sections[i].difficulty;
                    var dayNum = chosenRoute.daily_sections[i].day_num;
                    var daysNum = chosenRoute.days_num;
                    //if the traveler didn't choose accommodation
                    if(chosenRoute.daily_sections[i].chosen_accomm.accomm_name == null) {
                        var accommName = "לא נבחר מקום לינה ליום זה";
                        var accommPhone = "";
                        //if the traveler chose accommodation
                    } else {
                        var accommName = chosenRoute.daily_sections[i].chosen_accomm.accomm_name;
                        var accommPhone = chosenRoute.daily_sections[i].chosen_accomm.phone;
                    }
                    var descriptionArr = [];
                    var sitesArr = [];
                    var alertsArr = [];
                            
                    htmlContent += '<h3 id="dailyStartEnd">' + start + ' - ' + end + '</h3><div id="map"></div><br><section id = "dailyDetails">';
                    if(daysNum > 1) {
                        htmlContent += '<p> יום ' + dayNum + ' מתוך ' + daysNum + '<button class="detailedBtn" ng-click="showDetailedPlan()"> לתכנית הטיול </button></p>'; 
                    }
                    else {
                        htmlContent += '<p> טיול יומי </p>'; 
                    }
                    htmlContent += '<p> <b> משך המסלול: </b>' + duration + ' שעות</p><p> <b> רמת קושי המסלול: </b>' + diff + '</p><p><b> מאפייני המסלול:</b><br>';
                    for(var j=0; j<chosenRoute.daily_sections[i].description.length; j++){
                        htmlContent += chosenRoute.daily_sections[i].description[j] + '<br>';
                    }
                    htmlContent += '</p><button class="endTrip" ng-click="endTrip()"> הפסק טיול </button></section>';
                    var linkingFunction = $compile(htmlContent);
                    var elem = linkingFunction($scope);
                    dailyContent.html(elem);
                }
            }
        } else {
            //check if there are trips for the current day  
            var myRoutes = JSON.parse(localStorage.getItem("myRoutes"));
            var dailyRoutesArr = [];
            for(var i = 0; i<myRoutes.length; i++){
                var tmpDate = new Date(myRoutes[i].start_date);
                if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                    && (currentDate.getFullYear() == tmpDate.getFullYear())){
                    dailyRoutesArr.push(myRoutes[i]);
                }
            }
            localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
            //if the user has no routes starts on the current day
            if(dailyRoutesArr.length == 0){
                console.log("there are no routes starts on this date");
                dailyContent.html(noRoutesContent);
            }
            //if the user has rouetes for the curret day that weren't chosen yet
            else {
                //localStorage.setItem("currentDailyRoute", JSON.stringify(dailyRoutesArr[0]));
                console.log("there are routes planned for today");
                htmlContent = '<div id = "map"></div><h1>' + currentDayStr + ' ' + currentDateStr + '</h1>' +
                '<p> קיימ/ים מסלול/ים מתוכנן/ים עבור יום זה </p><a href="http://localhost:8080/chosenroutes.html"> <- </a>';
                dailyContent.html(htmlContent);
            }
        }
    }

    $scope.showDetailedPlan = function(){
        localStorage.setItem("planFlag", "chosen");
        window.location.assign("http://localhost:8080/detailedplan.html");
    }

    $scope.endTrip = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.addClass("show");   
    }

    $scope.stay = function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.removeClass("show");
    }

    $scope.stop = function(){
        localStorage.setItem("chosenRoute", null);
        location.reload();
    }
}]);