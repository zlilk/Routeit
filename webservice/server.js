var express = require('express');
var app = express();
var Segment = require('./routeController');
var Traveler = require('./travelersController');
var port = process.env.PORT || 3000;

app.set('port', port);
app.use('/',express.static('./public'));
app.use(function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    app.set('json spaces', 4);
    res.set("Content-Type", "application/json");
    next();
});

// routeController functions
app.get('/calculate/:ar/:km/:dr/:td/:sp/:df/:tp', function(req,res){
    Segment.calculateRoute(req.params.ar,req.params.km,req.params.dr,req.params.td,req.params.sp,req.params.df,req.params.tp,function(data){
        var id = 3;
        Traveler.addRouteToTraveler(data, id, "zlil@gmail.com",function(data){
              res.json(data);
        });
    });
});

app.get('/calculateFull/:ar/:km/:dr', function(req,res){
    Segment.calculateFullRoute(req.params.ar,req.params.km,req.params.dr,function(data){
      res.json(data);
    });
});

// travelerController functions
app.get('/createTraveler/:ml/:fn/:pi', function(req,res){
    Traveler.createTraveler(req.params.ml, req.params.fn, req.params.pi,function(data){
      res.json(data); 
    });
}); 

app.get('/addRoute/:rt/:ml', function(req,res){
    Traveler.addRouteToTraveler(req.params.rt, req.params.ml, callback);
});

app.get('/updateCurrent/:ml/:id', function(req,res){
    Traveler.updateCurrentRoute(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
}); 

app.get('/updateDates/:ml/:id/:sd/:dn/:fr/:st', function(req,res){
    var d1 = new Date("March 29, 2017 11:13:00");
    Traveler.updateTripDates(req.params.ml, req.params.id, d1, req.params.dn, req.params.fr, req.params.st, function(data){
      res.json(data); 
    });
});

app.get('/deleteRoute/:ml/:id', function(req,res){
    Traveler.deleteRouteFromTraveler(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
}); 

app.get('/getRoute/:ml/:id', function(req,res){
    Traveler.getCurrentRoute(req.params.ml, req.params.id, function(data){
      res.json(data); 
    });
});

app.get('/saveAccomm/:ml/:id/:ac/:dn', function(req,res){
    var accomm = {accomm_name: "אכסניית צליל",
    phone: "213434534"};
    Traveler.saveAccommToDay(req.params.ml, req.params.id, accomm, req.params.dn, function(data){
      res.json(data); 
    });
});

app.get('/getMyRoutes/:ml', function(req,res){
    Traveler.getAllMyRoutes(req.params.ml, function(data){
      res.json(data); 
    });
});

app.get('/getpreRoutes/:ml', function(req,res){
    Traveler.getAllPreviousRoutes(req.params.ml, function(data){
      res.json(data); 
    });
});

app.listen(port);
console.log("service is lstening on port " + port);
