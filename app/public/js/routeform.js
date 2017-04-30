var routeForm = angular.module('routeForm', []);

var startPts = {};

routeForm.run(function($rootScope, $http) {
    $http.get("http://localhost:3000/getStartPts").success(function(points){
        //create an array of all areas and their start points options
        points[0].area_id = 0;
        points[1].area_id = 1;
        var areasArr = ["הגליל התחתון", "רכס הכרמל", "השרון", "ירושלים", "השפלה", "המכתשים", "הערבה", "הרי אילת"];
        for(var i = 0; i<areasArr.length; i++){
            var newArea = {
                "area": areasArr[i],
                "area_id": i+2,
                "points": []
            }
            points.push(newArea); 
        }
        startPts = points;
        $rootScope.$broadcast('init');
    });
});

routeForm.controller('FormController', ['$scope', '$rootScope', '$http',function($rootScope, $scope, $http){
    function init() {
        $scope.name =  localStorage.getItem("name");
        $scope.img = localStorage.getItem("pic");
        $scope.startPts = startPts; //an array contains all of the areas and their start points options
    }

    var unbindHandler = $rootScope.$on('init', function($scope){
        init();
        unbindHandler();
    });

    
    $scope.south = false; //flag that points weather the traveler chose south to north direction

    //function that orders the start points of the chosen area by the chosen direction
    $scope.dirValue = function(dir, area){
        var tmpPointsArr = [];
        if(dir == 'north'){
            if($scope.south == false){}
            else {
                startPts[area.area_id].points.reverse();               
                $scope.south = false;
            }
        }
        else if(dir == 'south'){
            $scope.south = true;
            startPts[area.area_id].points.reverse();
        }
    };

    //function that checks if the chosen route is all of the route, and disable relevant fields
    $scope.checkArea = function(area){
        if(area == "כל השביל"){
            var elements = angular.element(document.querySelectorAll('.disable'));
            elements.attr('disabled', 'disabled');    
        }
        else {
            var elements = angular.element(document.querySelectorAll('.disable'));
            elements.removeAttr('disabled');   
        }
    };

    //sendind the chosen criteria in order to calculate the route
    $scope.calcRoute = function(area, dir, sPoint, km, daysNum, diff, type){
        console.log(area + "," + dir + "," + sPoint + "," + km + "," + daysNum  + "," + diff  + "," + type);
        var email = localStorage.getItem("email");
        $http.get("http://localhost:3000/calculate/" + area+ "/" + km + "/" + dir + "/" + daysNum + "/" + sPoint + "/" + diff + "/" + type + "/" + email).success(function(route){
            var routeStr = JSON.stringify(route);
            localStorage.setItem("suggestedRoute", routeStr);
            var sugRoute = JSON.parse(localStorage.getItem("suggestedRoute"));
            var popupElement = angular.element(document.querySelector('#myPopup'));
            console.log(sugRoute);
            if(sugRoute == "segmentsErr"){
                popupElement.append('אין מספיק ימי טיול עבור נקודת ההתחלה שנבחרה. <br> נסה להוריד את ימי הטיול/את מספר הק"מ ליום'); 
                popupElement.addClass("show");
            } else if(sugRoute == "typeErr"){
                popupElement.append('המסלול אינו תואם את אופי הטיול שבחרת'); 
                popupElement.addClass("show"); 
            } else if(sugRoute == "diffErr"){
                popupElement.append('המסלול אינו תואם את רמת הקושי שבחרת'); 
                popupElement.addClass("show");  
            } else if(sugRoute == "typeDiffErr"){
                popupElement.append('המסלול אינו תואם את אופי הטיול ואת רמת הקושי שבחרת'); 
                popupElement.addClass("show"); 
            } else window.location.assign("http://localhost:8080/suggested.html");
        });
    };

    $scope.closePopup =function(){
        var popupElement = angular.element(document.querySelector('#myPopup'));
        popupElement.removeClass("show");
    }
}]);