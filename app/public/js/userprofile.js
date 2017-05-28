var userProfile = angular.module('userProfile', []);

var prevRoutesArr = [];

userProfile.run(function($rootScope ,$http) {
    var userMail = localStorage.getItem("email");
    //getting traveler's previus routes
    $http.get("http://localhost:3000/getPrevRoutes/" + userMail).success(function(prevRoutes){
        prevRoutesArr = prevRoutes.previous_routes;
        $rootScope.$broadcast('init');
    });   
});

userProfile.controller('ProfileController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
    function init(){
       	//get user profile details
       	$scope.name  = localStorage.getItem("name");
       	$scope.img = localStorage.getItem("pic");
       	//get user's trips statistics
       	$scope.trips = prevRoutesArr.length;
       	$scope.tripsKm = 0;
       	for(var i=0; i<prevRoutesArr.length; i++){
       		$scope.tripsKm+=prevRoutesArr[i].trip_km; 	
       	}

    }
    
    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });
}]);