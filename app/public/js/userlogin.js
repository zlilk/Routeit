var login = angular.module('login', []);

login.controller('UserController', ['$scope','$http', function($scope, $http){
    var name, image, email;

    //function that gets the current registered user information from google+
    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        name = profile.getName();
        localStorage.setItem("name", name); //saving the user's name
        image = profile.getImageUrl();
        localStorage.setItem("pic", image); //saving the user's picture
        var newchar = '*';
        image = image.split('/').join(newchar);
        email = profile.getEmail();
        localStorage.setItem("email", email); //saving the user's email 

        var url = "https://routeit-ws.herokuapp.com/createTraveler/" + email +"/" + name + "/" + image;
        $http.get(url).success(function(data){
            if(data == "userExists") {
                 $http.get("https://routeit-ws.herokuapp.com/getIdCounter/" + email).success(function(idc){
                    localStorage.setItem("idCounter", idc.id_counter);
                    console.log(idc.id_counter);
                    $http.get("https://routeit-ws.herokuapp.com/getMyRoutes/" + email).success(function(routes){
                        console.log(routes.my_routes.length);
                        localStorage.setItem("myRoutes", JSON.stringify(routes.my_routes));
                        var isThereChosen = false;
                        for(var j=0; j<routes.my_routes.length; j++){
                            console.log("inside");
                            if(routes.my_routes[j].isChosen == true){
                                console.log(routes.my_routes[j].isChosen);
                                localStorage.setItem("chosenRoute", JSON.stringify(routes.my_routes[j]));
                                isThereChosen = true;
                                break;
                            }
                        }
                        if(isThereChosen == false){
                            localStorage.setItem("chosenRoute", null);
                        }
                        window.location.assign("https://routeit-app.herokuapp.com/dailyroute.html");
                    });
                });
            }
            else {
                localStorage.setItem("idCounter", 0);
                localStorage.setItem("currentRoute", null);
                localStorage.setItem("chosenRoute", null);
                localStorage.setItem("myRoutes", null);
                localStorage.setItem("dailyRoutes", null);
                localStorage.setItem("currentDailyRoute", null);
                window.location.assign("https://routeit-app.herokuapp.com/dailyroute.html");
            } 
        });
    }

    window.onSignIn = onSignIn;
}]);

