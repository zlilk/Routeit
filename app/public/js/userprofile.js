var userProfile = angular.module('userProfile', []);

var myRoutes = {};

userProfile.run(function($rootScope ,$http) {
    var userMail = localStorage.getItem("email");
    //getting traveler's routes
    $http.get("http://localhost:3000/getMyRoutes/" + userMail).success(function(routes){
        myRoutes = routes;
        var allMyRoutes = [];
        //building my routes html
        for(var i = 0; i<routes.my_routes.length; i++){
            var route = '<h3 ng-click="chosenRoute(' + routes.my_routes[i].trip_id + ')">' + routes.my_routes[i].trip_start_pt + ' - ' + routes.my_routes[i].trip_end_pt +
            '</h3>';
            if(routes.my_routes[i].start_date){ 
                var sDate = new Date(routes.my_routes[i].start_date);
                var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                var eDate = new Date(routes.my_routes[i].end_date);
                var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                route += '<p>' + sDateString + " - " + eDateString +'</p>';   
            }
            route += '<p> אזור ' + routes.my_routes[i].area + '<br> מספר ימים: ' + routes.my_routes[i].days_num +
            '<br> מספר ק"מ ליום: ' + routes.my_routes[i].day_km + '<br> מספר ק"מ כולל: ' + routes.my_routes[i].trip_km + '</p>' +
            '<button class = "editBtn"> ערוך מסלול </button> <button class = "deleteBtn" ng-click="deleteRoute(' + routes.my_routes[i].trip_id + ')"> מחק מסלול </button> <button class = "shareBtn"> שתף מסלול </button>' +
            '<button class = "dateBtn" ng-click="updateDate()"> הוסף תאריך </button>';
            allMyRoutes+=route;
        }
        myRoutes = allMyRoutes;
        $rootScope.$broadcast('init');
    });   
});

userProfile.controller('ProfileController', ['$rootScope', '$scope', '$http', '$compile', function($rootScope, $scope, $http, $compile){
    var userMail = localStorage.getItem("email");
    var routesContent = angular.element(document.querySelector('#content')); 

    function init(){
        //get user profile details
        $scope.name  = localStorage.getItem("name");
        $scope.img = localStorage.getItem("pic");
        $scope.showMyRoutes();
    }
    
    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });

    //function that shows traveler's 'my routes'
    $scope.showMyRoutes = function(){
        $http.get("http://localhost:3000/getMyRoutes/" + userMail).success(function(routes){
            myRoutes = routes;
            var allMyRoutes = [];
            for(var i = 0; i<routes.my_routes.length; i++){
                var route = '<h3 ng-click="chosenRoute(' + routes.my_routes[i].trip_id + ')">' + routes.my_routes[i].trip_start_pt + ' - ' + routes.my_routes[i].trip_end_pt +
                '</h3>';
                if(routes.my_routes[i].start_date){ 
                    var sDate = new Date(routes.my_routes[i].start_date);
                    var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                    var eDate = new Date(routes.my_routes[i].end_date);
                    var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                    route += '<p>' + sDateString + " - " + eDateString +'</p>';   
                }
                route += '<p> אזור ' + routes.my_routes[i].area + '<br> מספר ימים: ' + routes.my_routes[i].days_num +
                '<br> מספר ק"מ ליום: ' + routes.my_routes[i].day_km + '<br> מספר ק"מ כולל: ' + routes.my_routes[i].trip_km + '</p>' +
                '<button class = "editBtn"> ערוך מסלול </button> <button class = "deleteBtn" ng-click="deleteRoute(' + routes.my_routes[i].trip_id + ')"> מחק מסלול </button> <button class = "shareBtn"> שתף מסלול </button>' +
                '<button class = "dateBtn" ng-click="updateDate()"> הוסף תאריך </button>';
                allMyRoutes+=route;
            }
            myRoutes = allMyRoutes;
        });   
        $scope.myRoutes = myRoutes;
        var routesContent = angular.element(document.querySelector('#content'));
        var linkingFunction = $compile($scope.myRoutes);
        var elem = linkingFunction($scope);
        routesContent.html(elem);
    }

    //function that shows traveler's 'previous routes'
    $scope.showRoutesHistory = function(){
        $http.get("http://localhost:3000/getPreRoutes/" + userMail).success(function(routes){
            var allPrevRoutes = [];
            for(var i = 0; i<routes.previous_routes.length; i++){
                var route = '<h3 ng-click="chosenRoute(' + routes.previous_routes[i].trip_id + ')">' + routes.previous_routes[i].trip_start_pt + ' - ' + routes.previous_routes[i].trip_end_pt +
                '</h3>';
                if(routes.previous_routes[i].start_date){ 
                    var sDate = new Date(routes.previous_routes[i].start_date);
                    var sDateString = sDate.getDate() + '/' + (sDate.getMonth()+1) + '/' + sDate.getFullYear(); 
                    var eDate = new Date(routes.previous_routes[i].end_date);
                    var eDateString = eDate.getDate() + '/' + (eDate.getMonth()+1) + '/' + eDate.getFullYear(); 
                    route += '<p>' + sDateString + " - " + eDateString +'</p>';   
                }
                route += '<p> אזור ' + routes.previous_routes[i].area + '<br> מספר ימים: ' + routes.previous_routes[i].days_num +
                '<br> מספר ק"מ ליום: ' + routes.previous_routes[i].day_km + '<br> מספר ק"מ כולל: ' + routes.previous_routes[i].trip_km + '</p>' +
                '<button class = "deleteBtn" ng-click="angular.bind(this, deleteRoute, routes.previous_routes[i].trip_id)"> מחק מסלול </button>';
                allPrevRoutes+=route;
            }
            $scope.prevRoutes = allPrevRoutes;
            var routesContent = angular.element(document.querySelector('#content'));
            var linkingFunction = $compile($scope.prevRoutes);
            var elem = linkingFunction($scope);
            routesContent.html(elem);
        });
    }

    //function that deletes a chosen route from traveler's routes
    $scope.deleteRoute = function(tripId){
        $http.get("http://localhost:3000/deleteRoute/" + userMail + "/" + tripId).success(function(routes){
            $scope.showMyRoutes();           
        });
    }

    /*$scope.updateDate = function(tripId){
        $http.get("http://localhost:3000/updateDates/:sd/:dn/:fr/:st/" + userMail + "/" + tripId).success(function(routes){
            console.log("Hi");
            //location.reload();
            $scope.showMyRoutes();           
        });
    }*/
}]);