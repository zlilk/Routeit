//drawing detailed plan route map
window.initMap = function(){
//function initMap() {
    document.getElementById('map').className = 'miniMap';
    
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

    console.log("hiii" + flagPlan);
    console.log(routeOrigin);
    var tripCoordsArr = []; // all daily sections coords
    var tmpCoordsArr = []; // holds coords temporarily 
    var dailyCoordsArray = []; // holds one daily section's coords
    for(var i=0; i<routeOrigin.daily_sections.length; i++){
        for(var j=0; j<routeOrigin.daily_sections[i].coord_array.length; j++){
            var dailyCoord = {
                lat: Number(routeOrigin.daily_sections[i].coord_array[j].lat),
                lng: Number(routeOrigin.daily_sections[i].coord_array[j].lng)
            }
            dailyCoordsArray.push(dailyCoord);
        }
        tripCoordsArr = tmpCoordsArr.concat(dailyCoordsArray);
        dailyCoordsArray = [];
        tmpCoordsArr = tripCoordsArr;
    }
    console.log(tripCoordsArr);
    //var coords = JSON.parse(localStorage.getItem("suggestedCoords"));
    var centerCoord = tripCoordsArr[parseInt(tripCoordsArr.length/2)];
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: centerCoord, //{lat: 33.240884, lng: 35.575751},
        mapTypeId: google.maps.MapTypeId.ROAD
    });
    var lineCoordinatesPath = new google.maps.Polyline({
        path: tripCoordsArr,
        geodesic: true,
        strokeColor: '#004d00',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });
    lineCoordinatesPath.setMap(map);
}