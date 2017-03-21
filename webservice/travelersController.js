var mongoose = require('mongoose');
var Traveler = require('./traveler');

// if user doesn't exist, create new user and adding it to the database
exports.createTraveler = function(mail, name, pic, callback){
    var newchar = '/';
    pic = pic.split('*').join(newchar);
    var query = Traveler.find({}).select('email');
    query.exec(function(err,mails){
        // checking if user already exists
        for(var i = 0; i<mails.length; i++)
        {
            if(mails[i].email == mail) return callback("exists");   
        }
        var newUser = new Traveler({
                full_name: name,
                image: pic,
                email: mail,
                current_route:[],
                previous_routes: [],
                my_routes: []
        }); 
        newUser.save();
        callback("newuser"); 
    });
}

// adding sugeested route to traveler's 'my routes'
exports.addRouteToTraveler = function(route, mail, callback){ 
   	var dailySectionsArr = [];
   	var dailySection;
   	//console.log(route.daily_sections);
   	//console.log(route.daily_sections[0].coord_Array);
   	for(var i = 0; i<route.daily_sections.length; i++){
   		//console.log(route.daily_sections[i].day_num);
   		//var coordArray = [];
   		var coordArray = {"coords": []};
   		var coord = {};
   		var sections = route.daily_sections[i];
   		var coordArr = sections.coord_Array;
   		//console.log("coord array for daily section: " + coordArr);
   		for(var j = 0; j<coordArr.length; j++){
   			 coord = {
   			 	"lat": coordArr[j].lat,
   			 	"lng": coordArr[j].lng 
   			 };
   			 //coord.lat = coordArr[j].lat;
   			 //coord.lng = coordArr[j].lng;
   			 coordArray.coords.push(coord);
   			 console.log(coordArray[j]);
   		}
   		/*for(var k = 0; k<coordArray.coords.length; k++){
   			console.log("coord array: " + coordArray.coords[k].lat + "\n" + coordArray.coords[k].lng);
   		}*/
   		//coordArray2 = route.daily_sections[i].coord_Array;

      console.log("coords new: " + coordArray.coords);
   		dailySection = {
   			day_num: route.daily_sections[i].day_num,
   			date: route.daily_sections[i].date,
   			start_pt: route.daily_sections[i].start_pt,
   			end_pt: route.daily_sections[i].end_pt,
   			start_coord: route.daily_sections[i].start_coord,
   			end_coord: route.daily_sections[i].end_coord,
   			coord_Array: coordArray.coords,
   			total_km: route.daily_sections[i].total_km,
   			area: route.daily_sections[i].area,
   			duration: route.daily_sections[i].duration,
   			difficulty: route.daily_sections[i].difficulty,
   			alert: route.daily_sections[i].alert,
   			//accomm: route.daily_sections[i].accomm,
   			description: route.daily_sections[i].description,
   			sites: route.daily_sections[i].sites,
   			type: route.daily_sections[i].type
   		}
   		dailySectionsArr.push(dailySection);
   	}
   	//console.log(dailySectionsArr);
    var myRoute = {
    	area: route.area,
        trip_start_pt: route.trip_start_pt,
        trip_end_pt: route.trip_end_pt,
        start_date: route.start_date,
        end_date: route.end_date,
        days_num: route.days_num,
        trip_km: route.trip_km,
        day_km: route.day_km,
        trip_difficulty: route.trip_difficulty,
        trip_sites: route.trip_sites,
        trip_type: route.trip_type,
        trip_description: route.trip_description,
        //daily_sections: dailySectionsArr
    };
    var query = Traveler.findOneAndUpdate({email: mail}, {$push: {my_routes: myRoute}});
    query.exec(function(err,traveler){
        //traveler.set('my_routes', route);
        //traveler.my_routes.push(route);
        //traveler.save();
        callback("updated");
    });
}