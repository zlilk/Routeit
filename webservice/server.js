var express = require('express');
var app = express();
var Segment = require('./routeController');
//var Traveler = require('./travelersController');
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

/*app.get('/calculate/:sd/:ed/:sp/:dir/:km/:ml', function(req,res){
    Segment.calculateRoute(req.params.sd,req.params.ed,req.params.sp,req.params.dir,req.params.km,function(segs){
         if(segs == "error") {res.json("error"); }
         else { 
          Traveler.updateUserData(req.params.sd,req.params.ed,req.params.sp,req.params.dir, req.params.km,req.params.ml,segs,function(data){
            res.json(data);
          });  
        }
    });
});*/

app.get('/calculate/:ar/:km/:dr/:td/:sp/:df/:tp', function(req,res){
    Segment.calculateRoute(req.params.ar,req.params.km,req.params.dr,req.params.td,req.params.sp,req.params.df,req.params.tp,function(data){
            res.json(data);          
    });
});

app.listen(port);
console.log("service is lstening on port " + port);
