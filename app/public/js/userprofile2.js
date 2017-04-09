var userProfile = angular.module('userProfile', []);

var myRoutes = {}; //contains traveler's 'my routes' html
var myRoutesArr = {}; //contains traveler's 'my routes' array
var prevRoutes = {}; //contains traveler's 'previous routes' html
var prevRoutesArr = {}; //contains traveler's 'previous routes' array

userProfile.run(function($rootScope ,$http) {
    var userMail = localStorage.getItem("email");
    //getting traveler's routes
    $http.get("http://localhost:3000/getMyRoutes/" + userMail).success(function(routes){
        myRoutesArr = routes.my_routes;
        $http.get("http://localhost:3000/getPrevRoutes/" + userMail).success(function(prevRoutes){
            prevRoutesArr = prevRoutes.previous_routes;
            $rootScope.$broadcast('init');
        });   
    });
});

userProfile.controller('ProfileController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var userMail = localStorage.getItem("email");
    var routesContent = angular.element(document.querySelector('#content')); 

    function init(){
        //get user profile details
        $scope.name  = localStorage.getItem("name");
        $scope.img = localStorage.getItem("pic");
        //localStorage.setItem("currentRoute", null);
        $scope.showMyRoutes();
    }
    
    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });

    //function that shows traveler's 'my routes'
    $scope.showMyRoutes = function(){
        var allMyRoutes = [];
        //building my routes html
        for(var i = 0; i<myRoutesArr.length; i++){
            var route = '<section class = "route" id="route' + myRoutesArr[i].trip_id +'"><h3 ng-click="chosenRoute(' + myRoutesArr[i].trip_id + ')">' + myRoutesArr[i].trip_start_pt + ' - ' + myRoutesArr[i].trip_end_pt +
            '</h3>';
            if(myRoutesArr[i].start_date){ 
                var sDate = new Date(myRoutesArr[i].start_date);
                var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                var eDate = new Date(myRoutesArr[i].end_date);
                var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                if(sDateString == eDateString){
                    console.log("start and end dates are equal!");
                    route += '<p>' + sDateString + '</p>';
                } else {
                    route += '<p>' + sDateString + " - " + eDateString +'</p>';   
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
            '<button class = "editBtn"> ערוך מסלול </button> <button class = "deleteBtn" ng-click="deleteRoute(' + myRoutesArr[i].trip_id + ')"> מחק מסלול </button> <button class = "shareBtn"> שתף מסלול </button>' +
            '<input type="date" ng-model = "date'+i+'" class = "date"> <button class = "dateBtn" ng-click="updateDate(' + myRoutesArr[i].trip_id + ',date' + i + ',' + myRoutesArr[i].days_num + ')"> הוסף תאריך </button></section>';
            allMyRoutes+=route;
        }
        myRoutes = allMyRoutes;
        var routesContent = angular.element(document.querySelector('#content'));
        var linkingFunction = $compile(myRoutes);
        var elem = linkingFunction($scope);
        routesContent.html(elem);

        //set current route to null if there are no routes in 'my routes'
        if(myRoutes == "") {
            console.log("my routes is empty!");
            localStorage.setItem("currentRoute", null);
        }

        //show the current route if there is one
        var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
        console.log("current route is: "+ currentRoute);
        if(currentRoute!=null){
            console.log("calling chosenRoute with current tripId: " + currentRoute.trip_id);
            $scope.chosenRoute(currentRoute.trip_id);
        }
    }

    //function that shows traveler's 'previous routes'
    $scope.showRoutesHistory = function(){
        var allPrevRoutes = [];
        for(var i = 0; i<prevRoutesArr.length; i++){
            var route = '<section class = "route"><h3 ng-click="chosenRoute(' + prevRoutesArr[i].trip_id + ')">' + prevRoutesArr[i].trip_start_pt + ' - ' + prevRoutesArr[i].trip_end_pt +
            '</h3>';
            var sDate = new Date(prevRoutesArr[i].start_date);
            var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
            var eDate = new Date(prevRoutesArr[i].end_date);
            var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear();  
            if(sDateString == eDateString){
                route += '<p>' + sDateString + '</p>';
            } else {
                route += '<p>' + sDateString + " - " + eDateString +'</p>';   
            }  
            route += '<p> אזור ' + prevRoutesArr[i].area; 
            if(prevRoutesArr[i].days_num == 1) {
                route += '<br> טיול יומי';
            }
            else {
                route += '<br> מספר ימים: ' + prevRoutesArr[i].days_num;
            }
            route += '<br> מספר ק"מ ליום: ' + prevRoutesArr[i].day_km + '<br> מספר ק"מ כולל: ' + prevRoutesArr[i].trip_km + '</p>' +
            '<button class = "deleteBtn" ng-click="deletePrevRoute(' + prevRoutesArr[i].trip_id + ')"> מחק מסלול </button></section>';
            allPrevRoutes+=route;
        }
        $scope.prevRoutes = allPrevRoutes;
        var routesContent = angular.element(document.querySelector('#content'));
        var linkingFunction = $compile($scope.prevRoutes);
        var elem = linkingFunction($scope);
        routesContent.html(elem);
    }

    //function that deletes a chosen route from traveler's routes
    $scope.deleteRoute = function(tripId){
        $http.get("http://localhost:3000/deleteRoute/" + userMail + "/" + tripId).success(function(routes){
            //if the route to delete is the current route
            var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
            if(currentRoute!=null){
                if(currentRoute.trip_id == tripId){
                    localStorage.setItem("currentRoute", null);
                }
            }
            //delete the route from myRoutesArr
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the route tripId to delete: " + tripId + ", in array position: " + i);
                    myRoutesArr.splice(i,1);
                    break;
                }
            }
            $scope.showMyRoutes();          
        });
    }

    //function that updates a certain trip dates
    $scope.updateDate = function(tripId, date, daysNum){
        //console.log(date + " " + daysNum + " " + tripId);
        //update the dates in database and in local variable myRoutesArr
        $http.get("http://localhost:3000/updateDates/" + userMail + "/" + tripId + "/" + date + "/" + daysNum + "/no/no").success(function(route){
            //console.log(route);
            var updatedTripId;
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the updated route!");
                    updatedTripId = i;
                    myRoutesArr[i] = route;
                    break;
                }
            }
            //console.log(myRoutesArr[updatedTripId].daily_sections[0].date);
            $scope.showMyRoutes();          
        });
    }

    //set the traveler's chosen route
    $scope.chosenRoute = function(tripId){
        var currentRoute = JSON.parse(localStorage.getItem("currentRoute"));
        //if there's no currentRoute chosen yet
        if(currentRoute == null){
            var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
            chosenRouteElement.css('background','yellow');
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == tripId){
                    console.log("found the chosen route: " + tripId);
                    localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[i])); //'currentRoute' contains the chosen route json  
                    break;
                }
            }
        } else {
            //if chosen cuurentRoute equal to previous chosen currentRoute
            if(currentRoute.trip_id == tripId){
                console.log("the same chosen route");
                var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
                chosenRouteElement.css('background','yellow');
                for(var i = 0; i<myRoutesArr.length; i++){
                    if(myRoutesArr[i].trip_id == tripId){
                        console.log("found the chosen route: " + tripId);
                        localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[i]));
                        break;
                    }
                }
            }
            //if chosen currentRoute is different fron previous chosen currentRoute
            else {
                console.log("different route chosen! old route: " + currentRoute.trip_id);
                var oldChosenRouteElement = angular.element(document.querySelector('#route'+currentRoute.trip_id));
                oldChosenRouteElement.css('background','white'); 
                var chosenRouteElement = angular.element(document.querySelector('#route'+tripId));
                chosenRouteElement.css('background','yellow');
                for(var i = 0; i<myRoutesArr.length; i++){
                    if(myRoutesArr[i].trip_id == tripId){
                        console.log("found the chosen route: " + tripId);
                        localStorage.setItem("currentRoute", JSON.stringify(myRoutesArr[i]));
                        break;
                    }
                }
            }
        }
        var updatedCurrentRoute = JSON.parse(localStorage.getItem("currentRoute"));
        console.log("chosen tripId: " + updatedCurrentRoute.trip_id + "\n\n");
    }

    $scope.deletePrevRoute = function(tripId){

    }
}]);