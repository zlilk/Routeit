var detailedPlan = angular.module('detailedPlan', []);

detailedPlan.controller('planController', ['$scope', '$http',function($scope, $http){
    $scope.name  = localStorage.getItem("name");
    $scope.img = localStorage.getItem("pic");
    var flagPlan =  localStorage.getItem("planFlag");
    var routeOrigin;
    //if the route is from 'my routes'
    if(flagPlan == "current"){
        routeOrigin = JSON.parse(localStorage.getItem("currentRoute"));
    //if the route is from 'chosen routes'
    } else if(flagPlan == "currentDaily") {
        routeOrigin = JSON.parse(localStorage.getItem("currentDailyRoute"));
    //if the route is from 'daily route'
    } else routeOrigin = JSON.parse(localStorage.getItem("chosenRoute"));
    
    console.log(JSON.parse(localStorage.getItem("myRoutes")));
    console.log(routeOrigin);
    //if there are no dates chosen for the trip
    if(routeOrigin.start_date == null){
        $scope.sDate = "";
        $scope.eDate = "";
    } else {
        var startDate = new Date(routeOrigin.start_date);
        var endDate = new Date(routeOrigin.end_date);
        var sDateStr = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getFullYear();
        var eDateStr = endDate.getDate() + "/" + (endDate.getMonth()+1) + "/" + endDate.getFullYear();
        if(sDateStr == eDateStr) {
            $scope.date = sDateStr;
        } else {
            $scope.date = sDateStr + " - " + eDateStr;
        }
    }
    $scope.start = routeOrigin.trip_start_pt;
    $scope.end = routeOrigin.trip_end_pt;
        
    var dailySections = []; //details of all daily sections
    //getting all details for each daily section
    for(var i = 0; i< routeOrigin.daily_sections.length; i++){
        var accommArr = [];
        if(routeOrigin.daily_sections[i].accomm_array.length == 0){
            accommArr.push("אין מקומות לינה עבור יום זה");
        } else {
            accommArr.push("בחר מקום לינה");  
            for(var j=0; j<routeOrigin.daily_sections[i].accomm_array.length; j++){
                var tmpAccomm = routeOrigin.daily_sections[i].accomm_array[j];
                var accommStr = tmpAccomm.accomm_name + ", " + tmpAccomm.phone; 
                accommArr.push(accommStr);
            }
        }
        //if there are no dates
        if(routeOrigin.start_date == null) {
            var dailySection = {
                dayNum: routeOrigin.daily_sections[i].day_num,
                model: "accomm" + routeOrigin.daily_sections[i].day_num,
                dayDate: "",
                weekDay: "",
                startPt: routeOrigin.daily_sections[i].start_pt,
                endPt: routeOrigin.daily_sections[i].end_pt,
                duration: routeOrigin.daily_sections[i].duration,
                km: routeOrigin.daily_sections[i].total_km,
                diff: routeOrigin.daily_sections[i].difficulty,
                accommArr: accommArr
            };
        }else {
            var tmpDate = new Date(routeOrigin.daily_sections[i].date);
            var dateStr = tmpDate.getDate() + "/" + (tmpDate.getMonth()+1);
            var dateDay = tmpDate.getDay();
            var daysArr = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "יום ש'"];
                
            //details for a certain daily section
            var dailySection = {
                dayNum: routeOrigin.daily_sections[i].day_num,
                model: "accomm" + routeOrigin.daily_sections[i].day_num,
                dayDate: dateStr,
                weekDay: daysArr[dateDay],
                startPt: routeOrigin.daily_sections[i].start_pt,
                endPt: routeOrigin.daily_sections[i].end_pt,
                duration: routeOrigin.daily_sections[i].duration,
                km: routeOrigin.daily_sections[i].total_km,
                diff: routeOrigin.daily_sections[i].difficulty,
                accommArr: accommArr
            };
        }
        dailySections.push(dailySection);
    }
    $scope.dailySections = dailySections;
    
    //function to save the chosen accomm of a certain day to the traveler
    $scope.saveAccomm = function(accomm, dayNum){
        var userMail = localStorage.getItem("email");
        //var currentRoute = JSON.parse(localStorage.getItem("currentRoute")); 
        //console.log(accomm +" " + currentRoute.trip_id);
        var accommArr = accomm.split(",");
        var accommObj = {
          accomm_name: accommArr[0],
          phone: accommArr[1]
        };
        $http.get("http://localhost:3000/saveAccomm/" + userMail + "/" + routeOrigin.trip_id + "/" + accomm + "/" + dayNum).success(function(route){
            //var changedDay;
            //updating the chosen accomm of local current route
            for(var i = 0; i<routeOrigin.daily_sections.length; i++){
                if(routeOrigin.daily_sections[i].day_num == dayNum){
                    console.log("found the updated route!");
                    //changedDay = i; 
                    console.log(accommObj);
                    routeOrigin.daily_sections[i].chosen_accomm = accommObj;
                    break;
                }
            }
            //console.log(routeOrigin.daily_sections[changedDay].chosen_accomm);
            //if the route is from 'my routes'
            if(flagPlan == "current"){
                localStorage.setItem("currentRoute", JSON.stringify(routeOrigin));
            //if the route is from 'chosen routes'
            } else if(flagPlan == "currentDaily") {
                localStorage.setItem("currentDailyRoute", JSON.stringify(routeOrigin));
            //if the route is from 'daily route'
            } else localStorage.setItem("chosenRoute", JSON.stringify(routeOrigin));
            //updating the route in my routes, and in daily routes if exists
            var myRoutesArr = JSON.parse(localStorage.getItem("myRoutes"));
            var dailyRoutesArr = JSON.parse(localStorage.getItem("dailyRoutes"));
            //var updatedTripId;
            for(var i = 0; i<myRoutesArr.length; i++){
                if(myRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    //updatedTripId = i;
                    myRoutesArr[i] = routeOrigin;
                    localStorage.setItem("myRoutes", JSON.stringify(myRoutesArr));
                    break;
                }
            }
            for(var i = 0; i<dailyRoutesArr.length; i++){
                if(dailyRoutesArr[i].trip_id == routeOrigin.trip_id){
                    console.log("found the updated route!");
                    //updatedTripId = i;
                    dailyRoutesArr[i] = routeOrigin;
                    localStorage.setItem("dailyRoutes", JSON.stringify(dailyRoutesArr));
                    break;
                }
            }
        });
    }

    $scope.goBack = function(){
        if(flagPlan == "current"){
            window.location.assign("http://localhost:8080/myroutes.html");
        //if the route is from 'chosen routes'
        } else if(flagPlan == "currentDaily") {
            window.location.assign("http://localhost:8080/chosenroutes.html");
        //if the route is from 'daily route'
        } else window.location.assign("http://localhost:8080/dailyroute1.html");
    }
}]);