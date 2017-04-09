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

        var url = "http://localhost:3000/createTraveler/" + email +"/" + name + "/" + image;
        $http.get(url).success(function(data){
            if(data == "userExists") {}
            else {
                localStorage.setItem("idCounter", 0);
                localStorage.setItem("currentRoute", null);
            }
            window.location.assign("http://localhost:8080/userprofile.html");
        });
    }

    window.onSignIn = onSignIn;
}]);

