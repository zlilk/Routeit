var userRoutes = angular.module('userRoutes', []);

var myRoutes = {}; //contains traveler's 'my routes' html
var myRoutesArr = {}; //contains traveler's 'my routes' array localy
var dailyRoutesArr = {};

userRoutes.controller('RoutesController', ['$scope', '$http', '$compile', function($scope, $http, $compile){
    var userMail = localStorage.getItem("email");
    var routesContent = angular.element(document.querySelector('#content')); 
    $scope.name  = localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");

    //set the traveler's chosen route
    $scope.chosenRoute = function(tripId){
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
        
        //if chosen cuurentRoute equal to previous chosen currentRoute
        if(currentRoute.trip_id == tripId){
            console.log("the same chosen route");
           /* var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
            chosenRouteElement.css('background','yellow');*/
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the chosen route: " + tripId);
                    localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[i]));
                    break;
                }
            }
        }
        //if chosen currentRoute is different from previous chosen currentRoute
        else {
            console.log("different route chosen! old route: " + currentRoute.trip_id);
            /*var oldChosenRouteElement = angular.element(document.querySelector('#route'+currentRoute.trip_id));
            console.log(oldChosenRouteElement);
            oldChosenRouteElement.css('background','white');
            var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
            chosenRouteElement.css('background','yellow');*/
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the chosen route: " + tripId);
                    localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[i]));
                    break;
                }
            }
        }
        var updatedCurrentRoute = JSON.parse(localStorage.getItem("currentRoute"));
        console.log("chosen tripId: " + updatedCurrentRoute.trip_id + "\n\n");
    }

    //function that shows traveler's 'my routes'
    $scope.showMyRoutes = function(){
        //console.log(document.getElementById("zibi"));
        var allMyRoutes = [];
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        console.log(myRoutesArr);
        //set current route to null if there are no routes in 'my routes'
        if(myRoutesArr == null || myRoutesArr == "[]" || myRoutesArr.length == 0) {
            console.log("my routes is empty!");
            angular.element(document.querySelector('#content')).html('<h2 class="noRoutesHead"> לא קיימים מסלולים</h2>');
            localStorage.setItem("currentRoute", null);
        }

        else{
            //building my routes html
            var currentDate = new Date();
            for(var i = 0; i<myRoutesArr.length; i++){
                var route = '<section class = "route" ng-click="chosenRoute(' + myRoutesArr[i].trip_id + ')" id="route' + myRoutesArr[i].trip_id +'"><img class="routePic" src="images/PIC_TRIP_'+i%6+'.jpg">';
                var cDate = new Date(myRoutesArr[i].creation_date);
                var cDateString = cDate.getDate() + '/' + (cDate.getMonth()+1) + '/' + cDate.getFullYear(); 
                route+='<p class="creationDate"> נוצר ב- '+ cDateString +'</p>'
                +'<button class="detailedBtn" ng-click="showDetailedPlan()">לתכנית <br> הטיול</button>';
                if(myRoutesArr[i].disabled_flag == true){
                    route+='<img id="myRoutesDisabledIcon" src="../images/DISABLED.png">';
                }
                route+='<img class="dots" src="../images/DOTS.png" ng-click="openIcons()"><div class="iconsWrap hidden"><button class = "editBtn"></button> <button class = "deleteBtn" ng-click="deleteRoute(' + myRoutesArr[i].trip_id + ')"></button><button class = "shareBtn"></button></div>'
                + '<section class="ptsDate"><h3 class = "tripPts">' + myRoutesArr[i].trip_start_pt + ' - ' + myRoutesArr[i].trip_end_pt + '</h3>';
                console.log(myRoutesArr[i]);
                if(myRoutesArr[i].start_date){
                    var sDate = new Date(myRoutesArr[i].start_date);
                    var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                    var eDate = new Date(myRoutesArr[i].end_date);
                    var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                    console.log(myRoutesArr[i].start_date + " " + myRoutesArr[i].end_date); 
                    if(sDateString == eDateString){
                        console.log("start and end dates are equal!");
                        route += '<p id="tripDates'+i+'" class="tripDates">' + sDateString;
                        if(localStorage.getItem("chosenRoute") != "null"){
                            if(myRoutesArr[i].trip_id == JSON.parse(localStorage.getItem("chosenRoute")).trip_id) {
                               route+='</p><section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';
                            } else {
                                route+='<span id ="closeDates" ng-click="deleteDates('+ myRoutesArr[i].trip_id +')"></span></p>'
                                +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';
                            }
                        } else {
                           route+='<span id ="closeDates" ng-click="deleteDates('+ myRoutesArr[i].trip_id +')"></span></p>'
                            +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';
                        }    
                    } else {
                        if(localStorage.getItem("chosenRoute") != "null"){
                            if(myRoutesArr[i].trip_id == JSON.parse(localStorage.getItem("chosenRoute")).trip_id) {
                                route += '<p class="tripDates" id="tripDates'+i+'">' + eDateString + " - " + sDateString+'</p>'
                                +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';  
                            } else {
                                route += '<p class="tripDates" id="tripDates'+i+'">' + eDateString + " - " + sDateString+'<span id ="closeDates" ng-click="deleteDates('+ myRoutesArr[i].trip_id +')"></span></p>'
                                +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';  
                            }
                        } else {
                            route += '<p class="tripDates" id="tripDates'+i+'">' + eDateString + " - " + sDateString+'<span id ="closeDates" ng-click="deleteDates('+ myRoutesArr[i].trip_id +')"></span></p>'
                            +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';  
                        } 
                    }
                } else {
                    route+='<p id="dates'+i+'" class="tripDates underline" ng-click="addDateInput(2,'+i+')"> עדכן תאריך לטיול </p>'
                    +'<section class="updateDate" id="updateDate'+i+'"><input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> &#10004; </button></section></section>';
                }
                //check if the route date is the current date
                var tmpDate = new Date(myRoutesArr[i].start_date);
                if(localStorage.getItem("chosenRoute") != "null"){
                    if(myRoutesArr[i].trip_id == JSON.parse(localStorage.getItem("chosenRoute")).trip_id) {
                        route+='<a href="https://routeit-app.herokuapp.com/dailyroute.html" id="myRoutesTripIt"> בזמן <br> טיול </a>';  
                    } else if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                    && (currentDate.getFullYear() == tmpDate.getFullYear())){
                        route+='<button id="myRoutesTripIt" ng-click="tripIt(' + myRoutesArr[i].trip_id + ')"> צא <br> לטיול </button>';
                    }
                } else {
                    if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                    && (currentDate.getFullYear() == tmpDate.getFullYear())){
                        route+='<button id="myRoutesTripIt" ng-click="tripIt(' + myRoutesArr[i].trip_id + ')"> צא <br> לטיול </button>';
                    }
                }

                /*
                var tmpDate = new Date(myRoutesArr[i].start_date);
                if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                    && (currentDate.getFullYear() == tmpDate.getFullYear())){
                    if(localStorage.getItem("chosenRoute") != "null"){
                        if(myRoutesArr[i].trip_id == JSON.parse(localStorage.getItem("chosenRoute")).trip_id) {
                            route+='<a href="https://routeit-app.herokuapp.com/dailyroute.html" id="myRoutesTripIt"> בזמן <br> טיול </a>';
                        } else {
                            route+='<button id="myRoutesTripIt" ng-click="tripIt(' + myRoutesArr[i].trip_id + ')"> צא <br> לטיול </button>';
                        }
                    } else {
                        route+='<button id="myRoutesTripIt" ng-click="tripIt(' + myRoutesArr[i].trip_id + ')"> צא <br> לטיול </button>';
                    }
                }*/
                route += '<div class = "tripDetails"><p id="biggerWidth" class = "tripDetail"> אזור: <br> <b class="detail">' + myRoutesArr[i].area +'</b></p>';
                if(myRoutesArr[i].direction == "north") 
                    route+= '<p class = "tripDetail"> כיוון כללי: <br> <b class="detail"> מצפון<br> לדרום </b> </p>';
                else route+= '<p class = "tripDetail">  כיוון כללי: <br> <b class="detail"> מדרום<br> לצפון </b> </p>'; 
                if(myRoutesArr[i].days_num == 1) {
                    route += '<p class = "tripDetail"><b class="detail"><br> טיול יומי </b></p>';
                }
                else {
                    route += '<p class = "tripDetail">מס'+"'"+' ימים: <br><b class="biggerFont">' + myRoutesArr[i].days_num +'</b></p>';
                }
                route += '<p class = "tripDetail biggerWidth"> מס'+"'"+' ק"מ ליום: <br><b class="biggerFont">' + myRoutesArr[i].day_km + '</b></p><p class = "tripDetail biggerWidth" id="withoutBorder"> מס'+"'"+' ק"מ כולל: <br><b class="biggerFont">' + myRoutesArr[i].trip_km + '</b></p></div>'
                +'<br></section>';

                /*var route = '<section class = "route" ng-click="chosenRoute(' + myRoutesArr[i].trip_id + ')" id="route' + myRoutesArr[i].trip_id +'"><img class="routePic" src="images/tmpPic.jpg">'
                +'<h3>' + myRoutesArr[i].trip_start_pt + ' - ' + myRoutesArr[i].trip_end_pt + '</h3>';
                if(myRoutesArr[i].direction == "north") route+= '<p> צפון -> דרום </p>';
                else route+= '<p> דרום -> צפון </p>';
                if(myRoutesArr[i].start_date){
                    var sDate = new Date(myRoutesArr[i].start_date);
                    var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                    var eDate = new Date(myRoutesArr[i].end_date);
                    var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                    console.log(myRoutesArr[i].start_date + " " + myRoutesArr[i].end_date); 
                    if(sDateString == eDateString){
                        console.log("start and end dates are equal!");
                        route += '<p>' + sDateString + '</p>';
                    } else {
                        route += '<p>' + eDateString + " - " + sDateString+'</p>';   
                    }
                }
                route += '<p> אזור ' + myRoutesArr[i].area; 
                if(myRoutesArr[i].days_num == 1) {
                    route += '<br> טיול יומי';
                }
                else {
                    route += '<br> מספר ימים: ' + myRoutesArr[i].days_num;
                }
                route += '<br> מספר ק"מ ליום: ' + myRoutesArr[i].day_km + '<br> מספר ק"מ כולל: ' + myRoutesArr[i].trip_km + '</p>' +
                '<input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> עדכן תאריך </button><br>'+
                '<button class = "editBtn"> ערוך מסלול </button> <button class = "deleteBtn" ng-click="deleteRoute(' + myRoutesArr[i].trip_id + ')"> מחק מסלול </button> <button class = "shareBtn"> שתף מסלול </button><br>' +
                '<button class="detailedBtn" ng-click="showDetailedPlan()"> לתכנית הטיול </button><br>';
                var cDate = new Date(myRoutesArr[i].creation_date);
                var cDateString = cDate.getDate() + '/' + (cDate.getMonth()+1) + '/' + cDate.getFullYear(); 
                route+='<p> נוצר ב- '+ cDateString +'</p></section>';*/
                allMyRoutes+=route;
            }
            myRoutes = allMyRoutes;
            var routesContent = angular.element(document.querySelector('#content'));
            var linkingFunction = $compile(myRoutes);
            var elem = linkingFunction($scope);
            routesContent.html(elem);

            //show the current route if there is one
            var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
            console.log("current route is: "+ currentRoute);
            if(currentRoute!=null){
                console.log("calling chosenRoute with current tripId: " + currentRoute.trip_id);
                $scope.chosenRoute(currentRoute.trip_id);
            }
        }
    }
    $scope.showMyRoutes();

    //function that deletes a chosen route from traveler's routes
    $scope.deleteRoute = function(tripId){
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
            console.log(JSON.parse(localStorage.getItem("myRoutes")));
            //if the route to delete is the current route
            var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
            if(currentRoute!=null){
                if(currentRoute.trip_id == tripId){
                    if(myRoutesArr.length != 0){
                        localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[0]));   
                    } else localStorage.setItem("currentRoute", null);
                }
            }
            $scope.showMyRoutes();          
        });
    }

    //function that updates a certain trip dates
    $scope.updateDate = function(tripId, date, daysNum){
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        //update the dates in database and in local variable myRoutesArr
        if(date == null) {}
        else {
            console.log("date: " + date);
            $http.get("https://routeit-ws.herokuapp.com/updateDates/" + userMail + "/" + tripId + "/" + date + "/" + daysNum + "/no/no").success(function(route){
                console.log(route);
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
                if(dailyRoutesArr.length!=0){
                    for(var i = 0; i<dailyRoutesArr.length; i++){
                        if(dailyRoutesArr[i].trip_id == tripId){
                            console.log("found the updated route!");
                            dailyRoutesArr.splice(i,1);
                            localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                            break;
                        }
                    }
                }
                $scope.showMyRoutes();          
            });
        }
    }

    $scope.deleteDates = function(tripId){
        myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
        dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
        //update the dates in database and in local variable myRoutesArr
        $http.get("https://routeit-ws.herokuapp.com/deleteDates/" + userMail + "/" + tripId).success(function(route){
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
            if(dailyRoutesArr.length!=0){
                for(var i = 0; i<dailyRoutesArr.length; i++){
                    if(dailyRoutesArr[i].trip_id == tripId){
                        console.log("found the updated route!");
                        dailyRoutesArr.splice(i,1);
                        localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                        break;
                    }
                }
            }
            $scope.showMyRoutes();          
        });
    }

    $scope.showDetailedPlan = function(){
        localStorage.setItem("planFlag", "current");
        window.location.assign("https://routeit-app.herokuapp.com/detailedplan.html");
    }

    $scope.addDateInput = function(id, i){
        console.log(id);
        console.log(i);
        var datesElement;
        if(id==1) datesElement = angular.element(document.querySelector('#tripDates'+i));
        else datesElement = angular.element(document.querySelector('#dates'+i));
        var updateaDatesElement = angular.element(document.querySelector('#updateDate'+i));
        datesElement.css('display', 'none');
        updateaDatesElement.css('display', 'block');
    }

    $scope.tripIt = function(tripId){
        $http.get("https://routeit-ws.herokuapp.com/setChosen/" + userMail + "/" + tripId + "/true").success(function(isUpdated){
            myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    localStorage.setItem("chosenRoute", JSON.stringify(myRoutesArr[i]));
                    myRoutesArr[i].isChosen = true;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            window.location.assign("https://routeit-app.herokuapp.com/dailyroute.html");
        });
    }

    $scope.isIconsOpen = false;
    $scope.openIcons = function(){
        console.log("inside");
        var iconsWrap = angular.element(document.querySelector('.iconsWrap'));
        //if the overview is is closed
        if($scope.isIconsOpen == false){
            iconsWrap.removeClass('hidden');
            iconsWrap.addClass('visible');
            $scope.isIconsOpen = true;
        } 
        //if the overview is open
        else {
            iconsWrap.removeClass('visible');
            iconsWrap.addClass('hidden');
            $scope.isIconsOpen = false;
        } 
    }
}]);