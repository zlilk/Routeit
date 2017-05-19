var routesHistory = angular.module('routesHistory', []);

var prevRoutesArr = [];
var userMail = localStorage.getItem("email");

routesHistory.run(function($rootScope ,$http) { 
    //getting traveler's routes history
    $http.get("http://localhost:3000/getPrevRoutes/" + userMail).success(function(prevRoutes){
        prevRoutesArr = prevRoutes.previous_routes;
        console.log(prevRoutesArr);
        $rootScope.$broadcast('init');
    });   
});

routesHistory.controller('RoutesHistoryController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var routesContent = angular.element(document.querySelector('#content')); 
    function init(){
        //get user profile details
        $scope.name  = localStorage.getItem("name");
        $scope.img = localStorage.getItem("pic");
        //localStorage.setItem("currentRoute", null);
        $scope.showRoutesHistory();
    }

    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });

    //function that shows traveler's 'previous routes'
    $scope.showRoutesHistory = function(){
        var allPrevRoutes = [];
        for(var i = 0; i<prevRoutesArr.length; i++){
            var route = '<section class = "route"><h3 ng-click="chosenRoute(' + prevRoutesArr[i].trip_id + ')">' + prevRoutesArr[i].trip_start_pt + ' - ' + prevRoutesArr[i].trip_end_pt +
            '</h3>';
            if(prevRoutesArr[i].direction == "north") route+= '<p> צפון -> דרום </p>';
            else route+= '<p> דרום -> צפון </p>';
            var sDate = new Date(prevRoutesArr[i].start_date);
            var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
            var eDate = new Date(prevRoutesArr[i].end_date);
            var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear();  
            if(sDateString == eDateString){
                route += '<p>' + sDateString + '</p>';
            } else {
                route += '<p>' + eDateString + " - " + sDateString +'</p>';   
            }  
            route += '<p> אזור ' + prevRoutesArr[i].area; 
            if(prevRoutesArr[i].days_num == 1) {
                route += '<br> טיול יומי';
            }
            else {
                route += '<br> מספר ימים: ' + prevRoutesArr[i].days_num;
            }
            route += '<br> מספר ק"מ ליום: ' + prevRoutesArr[i].day_km + '<br> מספר ק"מ כולל: ' + prevRoutesArr[i].trip_km + '</p>' +
            '<button class = "deleteBtn" ng-click="deletePrevRoute(' + prevRoutesArr[i].trip_id + ')"> מחק מסלול </button>';
            var cDate = new Date(prevRoutesArr[i].creation_date);
            var cDateString = cDate.getDate() + '/' + (cDate.getMonth()+1) + '/' + cDate.getFullYear(); 
            route+='<p> נוצר ב- '+ cDateString +'</p></section>';
            allPrevRoutes+=route;
        }
        $scope.prevRoutes = allPrevRoutes;
        var routesContent = angular.element(document.querySelector('#content'));
        var linkingFunction = $compile($scope.prevRoutes);
        var elem = linkingFunction($scope);
        routesContent.html(elem);
    }

    //function that deletes a chosen route from traveler's routes
    $scope.deletePrevRoute = function(tripId){
        $http.get("http://localhost:3000/deletePrevRoute/" + userMail + "/" + tripId).success(function(routes){
            //delete the route from myRoutesArr
            for(var i = 0; i<prevRoutesArr.length; i++){
                if(prevRoutesArr[i].trip_id == tripId){
                    console.log("found the route tripId to delete: " + tripId + ", in array position: " + i);
                    prevRoutesArr.splice(i,1);
                    break;
                }
            }
            console.log("deleted");
            $scope.showRoutesHistory();          
        });
    }
}]);