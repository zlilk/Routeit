var dailyRoute = angular.module('dailyRoute', []);

dailyRoute.controller('dailyController', ['$scope', '$http',function($scope, $http){
    var currentRoute = JSON.parse(localStorage.getItem("currentRoute")); //getting the current route
    var currentDate = new Date(); //today's trip
    $scope.currentDate = currentDate.getDate() + "/" + (currentDate.getMonth()+1) + "/" + currentDate.getFullYear();
    //if the route has no dates or there isn't any routes
    if(currentRoute==null || currentRoute.start_date == null){
        var mainElement = angular.element(document.querySelector('#dailyMain'));
        mainElement.html('<p>לא קיים יום טיול עבור תאריך זה</p>');
    //if the route has dates
    } else{
        //serching the current day
        for(var i = 0; i< currentRoute.daily_sections.length; i++){
            var tmpDate = new Date(currentRoute.daily_sections[i].date);
            if((currentDate.getDate() == tmpDate.getDate()) && (currentDate.getMonth() == tmpDate.getMonth()) 
                && (currentDate.getFullYear() == tmpDate.getFullYear())){
                $scope.start = currentRoute.daily_sections[i].start_pt;
                $scope.end = currentRoute.daily_sections[i].end_pt;
                $scope.duration = currentRoute.daily_sections[i].duration;
                $scope.diff = currentRoute.daily_sections[i].difficulty;
                //if the traveler didn't choose accommodation
                if(currentRoute.daily_sections[i].chosen_accomm.accomm_name == null) {
                    $scope.accommName = "לא נבחר מקום לינה ליום זה";
                    $scope.accommPhone = "";
                //if the traveler chose accommodation
                }else{
                    $scope.accommName = currentRoute.daily_sections[i].chosen_accomm.accomm_name;
                    $scope.accommPhone = currentRoute.daily_sections[i].chosen_accomm.phone;
                }
                var descriptionArr = [];
                var sitesArr = [];
                var alertsArr = [];
                for(var j=0; j<currentRoute.daily_sections[i].description.length; j++){
                    descriptionArr.push(currentRoute.daily_sections[i].description[j]);
                }
                for(var j=0; j<currentRoute.daily_sections[i].sites.length; j++){
                    sitesArr.push(currentRoute.daily_sections[i].sites[j]);
                }
                for(var j=0; j<currentRoute.daily_sections[i].alert.length; j++){
                    alertsArr.push(currentRoute.daily_sections[i].alert[j]);
                }
                $scope.descArr = descriptionArr;
                $scope.sitesArr = sitesArr;
                $scope.alertsArr = alertsArr;
            }
        }
    }
}]);