var detailedPlan = angular.module('detailedPlan', []);

detailedPlan.controller('planController', ['$scope', '$http',function($scope, $http){
    var currentRoute = JSON.parse(localStorage.getItem("currentRoute")); //getting the current route

    //if there isn't any routes
    if(currentRoute==null){
        var mainElement = angular.element(document.querySelector('#planMain'));
        var headerElement = angular.element(document.querySelector('#planHeader'));
        headerElement.html('<h1> הטיול שלך </h1>');
        mainElement.html('<p>לא קיימים טיולים</p>');
    //if there is a current route
    }else {
        //if there are no dates chosen for the trip
        if(currentRoute.start_date == null){
            $scope.sDate = "";
            $scope.eDate = "";
        } else {
            var startDate = new Date(currentRoute.start_date);
            var endDate = new Date(currentRoute.end_date);
            var sDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear();
            var eDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear();
            if(sDateStr == eDateStr) {
                $scope.date = sDateStr;
            } else {
                $scope.date = sDateStr + " - " + eDateStr;
            }
        }
        $scope.start = currentRoute.trip_start_pt;
        $scope.end = currentRoute.trip_end_pt;
        
        var dailySections = []; //details of all daily sections
        //getting all details for each daily section
        for(var i = 0; i< currentRoute.daily_sections.length; i++){
            var accommArr = [];
            if(currentRoute.daily_sections[i].accomm_array.length == 0){
                accommArr.push("אין מקומות לינה עבור יום זה");
            } else {
                accommArr.push("בחר מקום לינה");  
                for(var j=0; j<currentRoute.daily_sections[i].accomm_array.length; j++){
                    var tmpAccomm = currentRoute.daily_sections[i].accomm_array[j];
                    var accommStr = tmpAccomm.accomm_name + ", " + tmpAccomm.phone; 
                    accommArr.push(accommStr);
                }
            }
            //if there are no dates
            if(currentRoute.start_date == null) {
                var dailySection = {
                    dayNum: currentRoute.daily_sections[i].day_num,
                    model: "accomm" + currentRoute.daily_sections[i].day_num,
                    dayDate: "",
                    weekDay: "",
                    startPt: currentRoute.daily_sections[i].start_pt,
                    endPt: currentRoute.daily_sections[i].end_pt,
                    duration: currentRoute.daily_sections[i].duration,
                    km: currentRoute.daily_sections[i].total_km,
                    diff: currentRoute.daily_sections[i].difficulty,
                    accommArr: accommArr
                };
            }else {
                var tmpDate = new Date(currentRoute.daily_sections[i].date);
                var dateStr = tmpDate.getDate() + "/" + (tmpDate.getMonth()+1);
                var dateDay = tmpDate.getDay();
                var daysArr = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "יום ש'"];
                
                //details for a certain daily section
                var dailySection = {
                    dayNum: currentRoute.daily_sections[i].day_num,
                    model: "accomm" + currentRoute.daily_sections[i].day_num,
                    dayDate: dateStr,
                    weekDay: daysArr[dateDay],
                    startPt: currentRoute.daily_sections[i].start_pt,
                    endPt: currentRoute.daily_sections[i].end_pt,
                    duration: currentRoute.daily_sections[i].duration,
                    km: currentRoute.daily_sections[i].total_km,
                    diff: currentRoute.daily_sections[i].difficulty,
                    accommArr: accommArr
                };
            }
            dailySections.push(dailySection);
        }
        $scope.dailySections = dailySections;
    }

    //function to save the chosen accomm of a certain day to the traveler
    $scope.saveAccomm = function(accomm, dayNum){
        var userMail = localStorage.getItem("email");
        var currentRoute = JSON.parse(localStorage.getItem("currentRoute")); 
        console.log(accomm +" " + currentRoute.trip_id);
        var accommArr = accomm.split(",");
        var accommObj = {
          accomm_name: accommArr[0],
          phone: accommArr[1]
        };
        $http.get("http://localhost:3000/saveAccomm/" + userMail + "/" + currentRoute.trip_id + "/" + accomm + "/" + dayNum).success(function(route){
            var changedDay;
            //updating the chosen accomm of local current route
            for(var i = 0; i<currentRoute.daily_sections.length; i++){
                if(currentRoute.daily_sections[i].day_num == dayNum){
                    console.log("found the updated route!");
                    changedDay = i; 
                    currentRoute.daily_sections[i].chosen_accomm = accommObj;
                    break;
                }
            }
            console.log(currentRoute.daily_sections[changedDay].chosen_accomm);
            localStorage.setItem("currentRoute", JSON.stringify(currentRoute)); 
        });
    }
}]);