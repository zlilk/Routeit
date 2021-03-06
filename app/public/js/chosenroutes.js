var chosenRoutes = angular.module('chosenRoutes', []);

var dailyRoutes = {}; //contains traveler's 'my routes' html
var myRoutesArr = {}; //contains traveler's 'my routes' array localy
var dailyRoutesArr = {}; 

chosenRoutes.controller('chosenRoutesController', ['$scope', '$http', '$compile', function($scope, $http, $compile){
    var userMail = localStorage.getItem("email");
    var routesContent = angular.element(document.querySelector('#content')); 
    $scope.name  = localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");

    //set the traveler's chosen route
    $scope.chosenRoute = function(tripId){
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        var currentDailyRoute = JSON.parse(localStorage.getItem("currentDailyRoute"));
        
        //if chosen cuurentRoute equal to previous chosen currentRoute
        if(currentDailyRoute.trip_id == tripId){
            /*console.log("the same chosen route");
            var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
            chosenRouteElement.css('background','yellow');*/
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == tripId){
                    console.log("found the chosen route: " + tripId);
                    localStorage.setItem("currentDailyRoute", JSON.stringify(dailyRoutesArr[i]));
                    break;
                }
            }
        }
        //if chosen currentRoute is different from previous chosen currentRoute
        else {
            /*console.log("different route chosen! old route: " + currentDailyRoute.trip_id);
            var oldChosenRouteElement = angular.element(document.querySelector('#route'+currentDailyRoute.trip_id));
            oldChosenRouteElement.css('background','white'); 
            var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
            chosenRouteElement.css('background','yellow');*/
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == tripId){
                    console.log("found the chosen route: " + tripId);
                    localStorage.setItem("currentDailyRoute", JSON.stringify(dailyRoutesArr[i]));
                    break;
                }
            }
        }
        var updatedCurrentDailyRoute = JSON.parse(localStorage.getItem("currentDailyRoute"));
        console.log("chosen tripId: " + updatedCurrentDailyRoute.trip_id + "\n\n");
    }

    //function that shows traveler's 'my routes'
    $scope.showMyRoutes = function(){
        console.log(JSON.parse(localStorage.getItem("currentDailyRoute")));
        var allMyRoutes = [];
        //myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        //building my routes html
        for(var i = 0; i<dailyRoutesArr.length; i++){
            var route = '<section class = "route" ng-click="chosenRoute(' + dailyRoutesArr[i].trip_id + ')" id="route' + dailyRoutesArr[i].trip_id +'"><img class="routePic" src="images/PIC_TRIP_'+i%6+'.jpg">';
            var cDate = new Date(dailyRoutesArr[i].creation_date);
            var cDateString = cDate.getDate() + '/' + (cDate.getMonth()+1) + '/' + cDate.getFullYear(); 
            route+='<p class="creationDate"> נוצר ב- '+ cDateString +'</p>'
            //+'<button class="detailedBtn" ng-click="showDetailedPlan()"></button>'
            + '<button class = "dailyShareBtn"></button>';
            if(dailyRoutesArr[i].disabled_flag == true){
                route+='<img id="chosenDisabledIcon" src="../images/DISABLED.png">';
            }
            route+='<section class="dailyPtsDate"><h3 class = "tripPts">' + dailyRoutesArr[i].trip_start_pt + ' - ' + dailyRoutesArr[i].trip_end_pt + '</h3>';
            console.log(dailyRoutesArr[i]);
            if(dailyRoutesArr[i].start_date){
                var sDate = new Date(dailyRoutesArr[i].start_date);
                var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                var eDate = new Date(dailyRoutesArr[i].end_date);
                var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                console.log(dailyRoutesArr[i].start_date + " " + dailyRoutesArr[i].end_date); 
                if(sDateString == eDateString){
                    console.log("start and end dates are equal!");
                    route += '<p id="tripDates'+i+'" class="tripDates">' + sDateString + '</section>';
                } else {
                    route += '<p class="tripDates" id="tripDates'+i+'">' + eDateString + " - " + sDateString + '</section>';  
                }
            }
            route += '<div class = "tripDetails"><p class = "tripDetail"> אזור: <br> <b class="detail">' + dailyRoutesArr[i].area +'</b></p>';
            if(dailyRoutesArr[i].direction == "north") 
                route+= '<p class = "tripDetail"> כיוון כללי: <br> <b class="detail"> מצפון<br> לדרום </b> </p>';
            else route+= '<p class = "tripDetail">  כיוון כללי: <br> <b class="detail"> מדרום<br> לצפון </b> </p>'; 
            if(dailyRoutesArr[i].days_num == 1) {
                route += '<p class = "tripDetail"><b class="detail"><br> טיול יומי </b></p>';
            }
            else {
                route += '<p class = "tripDetail">מס'+"'"+' ימים: <br><b class="biggerFont">' + dailyRoutesArr[i].days_num +'</b></p>';
            }
            route += '<p class = "tripDetail biggerWidth"> מס'+"'"+' ק"מ ליום: <br><b class="biggerFont">' + dailyRoutesArr[i].day_km + '</b></p><p id="withoutBorder" class = "tripDetail biggerWidth"> מס'+"'"+' ק"מ כולל: <br><b class="biggerFont">' + dailyRoutesArr[i].trip_km + '</b></p></div>'
            +'<button class = "dailyEditBtn"></button> <button class = "dailyDeleteBtn" ng-click="deleteRoute(' + dailyRoutesArr[i].trip_id + ')"></button>'
            +'<div class="detailedTripIt"><button id="chosenTripIt" class="tripIt borderLeft" ng-click="tripIt(' + dailyRoutesArr[i].trip_id + ')"><span class="planImg"></span>&nbsp; צא לטיול </button><button  id="chosenDetailed" class="tripIt" ng-click="showDetailedPlan()"> לתכנית הטיול </button></div>'
            +'<br></section>';
            allMyRoutes+=route;

          /*  var route = '<section class = "route" ng-click="chosenRoute(' + dailyRoutesArr[i].trip_id + ')" id="route' + dailyRoutesArr[i].trip_id +'"><h3>' + dailyRoutesArr[i].trip_start_pt + ' - ' + dailyRoutesArr[i].trip_end_pt +
            '</h3>';
            if(dailyRoutesArr[i].direction == "north") route+= '<p> צפון -> דרום </p>';
            else route+= '<p> דרום -> צפון </p>';
            if(dailyRoutesArr[i].start_date){ 
                var sDate = new Date(dailyRoutesArr[i].start_date);
                var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                var eDate = new Date(dailyRoutesArr[i].end_date);
                var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                if(sDateString == eDateString){
                    console.log("start and end dates are equal!");
                    route += '<p>' + sDateString + '</p>';
                } else {
                    route += '<p>' + eDateString + " - " + sDateString +'</p>';   
                }
            }
            route += '<p> אזור ' + dailyRoutesArr[i].area; 
            if(dailyRoutesArr[i].days_num == 1) {
                route += '<br> טיול יומי';
            }
            else {
                route += '<br> מספר ימים: ' + dailyRoutesArr[i].days_num;
            }
            route += '<br> מספר ק"מ ליום: ' + dailyRoutesArr[i].day_km + '<br> מספר ק"מ כולל: ' + dailyRoutesArr[i].trip_km + '</p>' +
            '<input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + dailyRoutesArr[i].trip_id + ',date' + i + ',' + dailyRoutesArr[i].days_num + ')"> עדכן תאריך </button><br>'+
            '<button class = "editBtn"> ערוך מסלול </button> <button class = "deleteBtn" ng-click="deleteRoute(' + dailyRoutesArr[i].trip_id + ')"> מחק מסלול </button> <button class = "shareBtn"> שתף מסלול </button><br>' +
            '<button class="detailedBtn" ng-click="showDetailedPlan()"> לתכנית הטיול </button><button class="tripIt" ng-click="tripIt(' + dailyRoutesArr[i].trip_id + ')"> טייל! </button>';
            var cDate = new Date(dailyRoutesArr[i].creation_date);
            var cDateString = cDate.getDate() + '/' + (cDate.getMonth()+1) + '/' + cDate.getFullYear(); 
            route+='<p> נוצר ב- '+ cDateString +'</p></section>';
            allMyRoutes+=route;*/
        }
        dailyRoutes = allMyRoutes;
        var routesContent = angular.element(document.querySelector('#content'));
        var linkingFunction = $compile(dailyRoutes);
        var elem = linkingFunction($scope);
        routesContent.html(elem);

        //show the current route if there is one
        var currentDailyRoute = JSON.parse(localStorage.getItem("currentDailyRoute"));
        console.log("current route is: "+ currentDailyRoute);
        if(currentDailyRoute!=null){
            console.log("calling chosenRoute with current tripId: " + currentDailyRoute.trip_id);
            $scope.chosenRoute(currentDailyRoute.trip_id);
        }
    }
    $scope.showMyRoutes();

    //function that deletes a chosen route from traveler's routes
    $scope.deleteRoute = function(tripId){
        console.log("enter delete!");
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        $http.get("https://routeit-ws.herokuapp.com/deleteRoute/" + userMail + "/" + tripId).success(function(routes){
            //delete the route from myRoutesArr
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the route tripId to delete: " + tripId + ", in array position: " + i);
                    myRoutesArr.splice(i,1);
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == tripId){
                    console.log("found the route tripId to delete: " + tripId + ", in array position: " + i);
                    dailyRoutesArr.splice(i,1);
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
            console.log("deleted");
            //console.log(JSON.parse(localStorage.getItem("myRoutes")));
            //if the route to delete is the current route
            currentDailyRoute = JSON.parse(localStorage.getItem("currentDailyRoute"));
            if(currentDailyRoute!=null){
                if(currentDailyRoute.trip_id == tripId){
                    if(dailyRoutesArr.length != 0){
                        localStorage.setItem("currentDailyRoute", JSON.stringify(dailyRoutesArr[0]));   
                    } else localStorage.setItem("currentDailyRoute", null);
                }
            }
            console.log("my routes: " + myRoutesArr);
            $scope.showMyRoutes();          
        });
    }
/*
    //function that updates a certain trip dates
    $scope.updateDate = function(tripId, date, daysNum){
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        //update the dates in database and in local variable myRoutesArr
        if(date == null) {}
        else {
            $http.get("http://localhost:3000/updateDates/" + userMail + "/" + tripId + "/" + date + "/" + daysNum + "/no/no").success(function(route){
                var updatedTripId;
                for(var i = 0; i<myRoutesArr.length; i++){
                    if(myRoutesArr[i].trip_id == tripId){
                        console.log("found the updated route!");
                        updatedTripId = i;
                        myRoutesArr[i] = route;
                        localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                        break;
                    }
                }
                for(var i = 0; i<dailyRoutesArr.length; i++){
                    if(dailyRoutesArr[i].trip_id == tripId){
                        console.log("found the updated route!");
                        dailyRoutesArr.splice(i,1);
                        localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                        break;
                    }
                }
                currentDailyRoute = JSON.parse(localStorage.getItem("currentDailyRoute"));
                if(currentDailyRoute!=null){
                    if(currentDailyRoute.trip_id == tripId){
                        if(dailyRoutesArr.length != 0){
                            localStorage.setItem("currentDailyRoute", JSON.stringify(dailyRoutesArr[0]));   
                        } else localStorage.setItem("currentDailyRoute", null);
                    }
                }
                $scope.showMyRoutes();          
            });
        }
    }*/

   /* $scope.deleteDates = function(tripId){
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        //update the dates in database and in local variable myRoutesArr
        $http.get("http://localhost:3000/deleteDates/" + userMail + "/" + tripId).success(function(route){
            var updatedTripId;
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the updated route!");
                    updatedTripId = i;
                    myRoutesArr[i] = route;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == tripId){
                    console.log("found the updated route!");
                    dailyRoutesArr.splice(i,1);
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
            $scope.showMyRoutes();          
        });
    }*/

    //function that saves the chosen trip and redirect to daily route page
    $scope.tripIt = function(tripId){
        $http.get("https://routeit-ws.herokuapp.com/setChosen/" + userMail + "/" + tripId + "/true").success(function(isUpdated){
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == tripId){
                    localStorage.setItem("chosenRoute", JSON.stringify(dailyRoutesArr[i]));
                    dailyRoutesArr[i].isChosen = true;
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
            myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    myRoutesArr[i].isChosen = true;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            window.location.assign("https://routeit-app.herokuapp.com/dailyroute.html");
        });
    }

    $scope.showDetailedPlan = function(){
        localStorage.setItem("planFlag", "currentDaily");
        window.location.assign("https://routeit-app.herokuapp.com/detailedplan.html");
    }
/*
    $scope.addDateInput = function(id, i){
        console.log(id);
        console.log(i);
        var datesElement;
        if(id==1) datesElement = angular.element(document.querySelector('#tripDates'+i));
        else datesElement = angular.element(document.querySelector('#dates'+i));
        var updateaDatesElement = angular.element(document.querySelector('#updateDate'+i));
        datesElement.css('display', 'none');
        updateaDatesElement.css('display', 'block');
    }*/
}]);