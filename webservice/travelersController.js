var mongoose = require('mongoose');
var Traveler = require('./traveler');

// if user doesn't exist, create new user and adding it to the database
exports.createTraveler = function(mail, name, pic, callback){
    console.log("I'm here");
    var newchar = '/';
    pic = pic.split('*').join(newchar);
    var query = Traveler.find({}).select('email');
    query.exec(function(err,mails){
        // checking if user already exists
        for(var i = 0; i<mails.length; i++)
        {
            if(mails[i].email == mail) return callback("userExists");   
        }
        var newUser = new Traveler({
                full_name: name,
                image: pic,
                email: mail,
                current_route_id: "",
                previous_routes: [],
                my_routes: []
        }); 
        newUser.save();
        callback("newUser"); 
    });
}

// adding sugeested route to traveler's 'my routes'
exports.addRouteToTraveler = function(id, mail, callback){   
    //pushing myRoute to traveler's 'my routes'
    var query = Traveler.findOne({email: mail}).select('suggested_route');
    query.exec(function(err,sugRoute){
      if(err) callback("travelerNotFound");
      //console.log(route.suggested_route.area);
      var route = sugRoute.suggested_route;
      var dailySectionsArr = []; //contains trip's daily section
      for(var i = 0; i<route.daily_sections.length; i++){
        var coordArray = []; //contains all of daily section's coords
        var coordArr = route.daily_sections[i].coord_array;
        for(var j = 0; j<coordArr.length; j++){
          var coord ={}; //object representing a coord
          coord.lat = coordArr[j].lat;
          coord.lng = coordArr[j].lng;
          coordArray.push(coord);
        }

        var accommArray = []; //contains all of daily section's accommodation places
        var acoommArr = route.daily_sections[i].accomm_array; 
        for(var j = 0; j<acoommArr.length; j++){
          var accomm = {}; //object representing an accommodation place
          accomm.accomm_name = acoommArr[j].accomm_name;
          accomm.phone = acoommArr[j].phone;
          accommArray.push(accomm);
        }

        //a trip's daily section
        var dailySection = { 
          day_num: route.daily_sections[i].day_num,
          date: route.daily_sections[i].date,
          start_pt: route.daily_sections[i].start_pt,
          end_pt: route.daily_sections[i].end_pt,
          start_coord: route.daily_sections[i].start_coord,
          end_coord: route.daily_sections[i].end_coord,
          coord_array: coordArray,
          total_km: route.daily_sections[i].total_km,
          area: route.daily_sections[i].area,
          duration: route.daily_sections[i].duration,
          difficulty: route.daily_sections[i].difficulty,
          alert: route.daily_sections[i].alert,
          accomm_array: accommArray,
          chosen_accomm: "",
          description: route.daily_sections[i].description,
          sites: route.daily_sections[i].sites,
          type: route.daily_sections[i].type
        };
      dailySectionsArr.push(dailySection);
      }

      //a route to add to 'my routes'
      var myRoute = {
          trip_id: id,
          area: route.area,
          direction: route.direction,
          creation_date: new Date(),
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
          daily_sections: dailySectionsArr
        };

      var query = Traveler.findOneAndUpdate({email: mail}, {$push: {my_routes: myRoute}});
      query.exec(function(err,route){
        if(err) callback("routeNotAdded"); 
        callback(myRoute);
        //callback("routeAdded");
      });
    });
}

// calculate trip end date and daily sections dates and update the trip dates 
exports.updateTripDates = function(mail, tripId, sDate, daysNum, isFri, isSat, callback){	
  //var sDate = new Date(sDate1);
  console.log("first " + sDate);
  //calculate trip's end date
  console.log(sDate.getDate());
  var eDate = new Date(sDate);
  eDate.setDate(eDate.getDate()+parseInt(daysNum-1));
  console.log("start date: " +sDate);
  console.log("end date: "+eDate +"\n");

  var tmpDate = sDate;
  var tripDatesArr = []; //array contains all of the trip's dates
  //calculating trip dates between start date to end date
  for(var i = 0;  i<daysNum; i++){
    tripDatesArr.push(new Date(tmpDate));
    tmpDate.setDate(tmpDate.getDate()+1);
  }
  console.log("after dates array: " + sDate);
  
  console.log("dates array: ");
  for(var i = 0;  i<tripDatesArr.length; i++){
    console.log(tripDatesArr[i]);
  }
	
  //updating trip dates to traveler's trip
  var query = Traveler.findOne().where('email', mail).select('my_routes');
    query.exec(function(err,routes){
      if(err) callback("myRoutesNotFound");
      var myRoutes = routes.my_routes;
      var isRouteFound = false;
      console.log("updating: " + tripDatesArr[0]);
      for(var i = 0; i<myRoutes.length; i++){
        if(myRoutes[i].trip_id == tripId){
          var isRouteFound = true;
          myRoutes[i].end_date = eDate;
          myRoutes[i].start_date = tripDatesArr[0];
          var dailySecs = myRoutes[i].daily_sections;
          for(var j = 0; j<dailySecs.length; j++){
            console.log("daily "+ tripDatesArr[j]);
            dailySecs[j].date = tripDatesArr[j];
          }
          var updatedRoute = myRoutes[i];
          break;
        }
      }
      if(isRouteFound == true){
        routes.set('my_routes', myRoutes);
        routes.save();
      	//callback("datesUpdated");
        callback(updatedRoute);
      }
      else callback("routeNotFound");	
    });
}

// delete a certain trip by trip id
exports.deleteRouteFromTraveler = function(mail, tripId, callback){
   var query = Traveler.findOneAndUpdate({email: mail}, {$pull: {my_routes: {trip_id: tripId}}});
    query.exec(function(err,traveler){
      if(err) callback("routeNotDeleted");
      callback("routeDeleted");
    });
}

// get the current route details
/*exports.getCurrentRoute = function(mail, tripId, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
  query.exec(function(err,routes){
      var myRoutes = routes.my_routes;
      var tmpIndx = -1;
      for(var i = 0; i<myRoutes.length; i++){
        if(myRoutes[i].trip_id == tripId){
          tmpIndx = i;
          break;
        }
      }
      if(tmpIndx == -1) callback("routeNotFound");
      else callback(myRoutes[tmpIndx]); 
    });
} */

// update the chosen accommodation for a daily section in current route 
exports.saveAccommToDay = function(mail, tripId, accomm, dayNum, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
  query.exec(function(err,routes){
  if(err) callback("myRoutesNotFound");
    var isRouteFound = false;
    var myRoutes = routes.my_routes;
    for(var i = 0; i<myRoutes.length; i++){
      if(myRoutes[i].trip_id == tripId){
        isRouteFound = true;
        var dailySecs = myRoutes[i].daily_sections;
        for(var j = 0; j<dailySecs.length; j++){
          if(dailySecs[j].day_num == dayNum){
             dailySecs[j].chosen_accomm = accomm;
          }
        }
        break;
      }
    }
    if(isRouteFound == true){
      routes.set('my_routes', myRoutes);
      routes.save();
      callback("accommUpdated"); 
    }
    else callback("routeNotFound");
  });
}

exports.getAllMyRoutes = function(mail, callback){
  var query = Traveler.findOne().where('email', mail).select('my_routes');
    query.exec(function(err,routes){
      if(err) callback("myRoutesNotFound");
      callback(routes);
    });
}

exports.getAllPreviousRoutes = function(mail, callback){
  var query = Traveler.findOne().where('email', mail).select('previous_routes');
    query.exec(function(err,routes){
      if(err) callback("prevRoutesNotFound");
      callback(routes);
    });
}

exports.addPrevToTraveler = function(mail, callback){
  //a route to add to 'my routes'
  /*var prevRoute = {
    trip_id: 1000,
    area: "ירושלים",
    direction: "north",
    creation_date: new Date(2017,3,15),
    trip_start_pt: "יער בן שמן",
    trip_end_pt: "לטרון",
    start_date: new Date(2017,3,26),
    end_date: new Date(2017,3,27),
    days_num: 2,
    trip_km: 10,
    day_km: "עד 5",
    trip_difficulty: "המסלול ברובו ברמת קושי בינונית",
    trip_sites: ["מבצר לטרון"],
    trip_type: ["מתאים למשפחות"],
    trip_description: ["מסלול ירוק", "נוף מרהיב", "מתאים לכל עונות השנה"],
  };*/

  var prevRoute = {
    trip_id: 1001,
    area: "המכתשים",
    direction: "north",
    creation_date: new Date(2017,1,20),
    trip_start_pt: "מצד תמר",
    trip_end_pt: "מצד צפיר",
    start_date: new Date(2017,2,2),
    end_date: new Date(2017,2,4),
    days_num: 3,
    trip_km: 22,
    day_km: "5-10",
    trip_difficulty: "המסלול ברובו ברמת קושי קשה",
    trip_sites: ["המכתש הקטן"],
    trip_type: ["מאתגר"],
    trip_description: ["מכיל עליות", "נוף מרהיב", "מתאים לכל עונות השנה"],
  };
    
  var query = Traveler.findOneAndUpdate({email: mail}, {$push: {previous_routes: prevRoute}});
  query.exec(function(err,route){
    if(err) callback("routeNotAdded"); 
    callback("prevRouteAdded");
  }); 
}

exports.deletePrevFromTraveler = function(mail, tripId, callback){
  var query = Traveler.findOneAndUpdate({email: mail}, {$pull: {previous_routes: {trip_id: tripId}}});
  query.exec(function(err,traveler){
    if(err) callback("routeNotDeleted");
    callback("routeDeleted");
  });
}

// adding calculated suggested route to traveler
exports.addRouteToSuggested = function(route, mail, callback){
  var dailySectionsArr = []; //contains trip's daily section
  for(var i = 0; i<route.daily_sections.length; i++){
    var coordArray = []; //contains all of daily section's coords
    var coordArr = route.daily_sections[i].coord_array;
    for(var j = 0; j<coordArr.length; j++){
      var coord ={}; //object representing a coord
      coord.lat = coordArr[j].lat;
      coord.lng = coordArr[j].lng;
      coordArray.push(coord);
    }

    var accommArray = []; //contains all of daily section's accommodation places
    var acoommArr = route.daily_sections[i].accomm_array; 
    for(var j = 0; j<acoommArr.length; j++){
      var accomm = {}; //object representing an accommodation place
      accomm.accomm_name = acoommArr[j].accomm_name;
      accomm.phone = acoommArr[j].phone;
      accommArray.push(accomm);
    }

    //a trip's daily section
    var dailySection = { 
      day_num: route.daily_sections[i].day_num,
      date: route.daily_sections[i].date,
      start_pt: route.daily_sections[i].start_pt,
      end_pt: route.daily_sections[i].end_pt,
      start_coord: route.daily_sections[i].start_coord,
      end_coord: route.daily_sections[i].end_coord,
      coord_array: coordArray,
      total_km: route.daily_sections[i].total_km,
      area: route.daily_sections[i].area,
      duration: route.daily_sections[i].duration,
      difficulty: route.daily_sections[i].difficulty,
      alert: route.daily_sections[i].alert,
      accomm_array: accommArray,
      chosen_accomm: "",
      description: route.daily_sections[i].description,
      sites: route.daily_sections[i].sites,
      type: route.daily_sections[i].type
    };
  dailySectionsArr.push(dailySection);
  }

  //a route to add to 'suggested route'
  var sugRoute = {
      trip_id: "",
      area: route.area,
      direction: route.direction,
      creation_date: "",
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
      daily_sections: dailySectionsArr
    };

    console.log("suggested is: " + sugRoute);
    
    //setting suggested route to traveler's 'suggested route' field
    var query = Traveler.findOneAndUpdate({email: mail}, {$set: {suggested_route: sugRoute}});
    query.exec(function(err,traveler){
      if(err) callback("routeNotAddedToSuggested");  
      callback(route);
    });
}