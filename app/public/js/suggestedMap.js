//drawing suggested route map
function initMap() {
    document.getElementById('map').className = 'miniMap';
    var coords = JSON.parse(localStorage.getItem("suggestedCoords"));
    var centerCoord = coords[parseInt(coords.length/2)];
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: centerCoord, //{lat: 33.240884, lng: 35.575751},
        mapTypeId: google.maps.MapTypeId.ROAD
    });
    var lineCoordinatesPath = new google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: '#004d00',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });
    lineCoordinatesPath.setMap(map);
}