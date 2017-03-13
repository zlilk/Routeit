var mongoose = require('mongoose');
var Segment = require('./segment');

exports.calculateRoute = function(area, kmDay, dir, totalDays, startPt, diff, type, callback){
    var numOfDailySections, maxTripTotalKm, numOfSegs;
    var maxSegmentKm = 5;
    maxTripTotalKm = totalDays * kmDay; 
    numOfSegs = maxTripTotalKm / maxSegmentKm;
    numOfDailySections = maxTripTotalKm / kmDay;
    console.log(numOfSegs);
    console.log(area + " " + kmDay + " " +  dir  + " " +  totalDays  + " " +  startPt  + " " + diff  + " " +  type);
    ///////////// too much days ? less segments ?
            
    var start;
    var firstSegIndx, lastSegIndx, segsArr, accommArr;
    
    // if the trip's diresction is from north to south
    if(dir == "north"){
        console.log("hi");
        start = getFirstSegIndex(callback);

        // getting the index of the first segment of the trip
        function getFirstSegIndex(callback){
            var firstSeg = Segment.find({'start_pt':startPt}).select('indx');
            firstSeg.exec(function(err,segment){
            firstSegIndx = segment[0].indx;
            console.log("first segment i: " + firstSegIndx);
            getLastSegIndx(firstSegIndx, callback);
            });
        }

        // getting the index of the last segment of the trip
        function getLastSegIndx(firstSegIndx, callback){
            console.log("blabla");
            lastSegIndx = firstSegIndx + (numOfSegs - 1);
            console.log("last segment i: " + lastSegIndx);
            ////////getAccomm(startPt, totalDays);
            getSegs(firstSegIndx, lastSegIndx, callback);
        }

        // getting the trip relevant segments and building the trip daily sections 
        function getSegs(firstSegIndx, lastSegIndx, callback){
            segsArr = Segment.find({}).where('indx').gt(firstSegIndx-1).lt(lastSegIndx+1);
            segsArr.exec(function(err,segments){
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalKm = 0; 
                var totalType = []; 
                var endPt;
                var easyDiff= 0, medDiff = 0, hardDiff = 0;
                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    for(var i = 0; i<totalDays; i++){
                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[i].start_pt,
                            "end_pt": segments[i].end_pt,
                            "start_coord": segments[i].start_coord,
                            "end_coord": segments[i].end_coord,
                            "coord_Array": segments[i].coord_Array,
                            "total_km": segments[i].total_km,
                            "area": segments[i].area,
                            "duration": segments[i].duration,
                            "difficulty": segments[i].difficulty,
                            "alert": segments[i].alert,
                            "accomm":[],
                            "description": segments[i].description,
                            "sites": segments[i].sites,
                            "type": segments[i].type
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(segments[i].type);
                        totalKm+=segments[i].total_km;
                        if(segments[i].difficulty == "קל") easyDiff+=1;
                        else if(segments[i].difficulty == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[(segments.length)-1].end_pt;
                    //buildRoute(endPT, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    console.log("total KM: " + totalKm);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
                    callback(dailySectionsArr);
                }
                
                // if the trip's km per day is 5-10 km
                if(kmDay == 10){
                    for(var i = 0, j = 0; i<totalDays; i++, j+=2){
                        // create new daily section coords array
                        var newCoordArr = (segments[j].coord_Array).concat(segments[j+1].coord_Array);
                        
                        //calculate new daily section duration
                        var durationArr1 = (segments[j].duration).split("-");
                        var durationArr2 = (segments[j+1].duration).split("-");
                        var minDuration = parseFloat(durationArr1[0]) + parseFloat(durationArr2[0]);
                        var maxDuration = parseFloat(durationArr1[1]) + parseFloat(durationArr2[1]);
                        var newDuration = minDuration + "-" + maxDuration;
                        
                        //create new daily section difficulty
                        var newDiff;
                        var diffArr = [segments[j].difficulty, segments[j+1].difficulty]; 
                        if(diffArr[0]=="קשה" || diffArr[1]=="קשה"){ 
                            newDiff = "קשה"; 
                        }
                        else if(diffArr[0]=="בינוני" || diffArr[1]=="בינוני"){ 
                                newDiff = "בינוני";
                        }
                        else newDiff = "קל"; 

                        // function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };
            
                        // create new daily section alerts
                        var newAlertsArr = (segments[j].alert).concat(segments[j+1].alert);

                        // create new daily section description
                        var newDescArr = (segments[j].description).concat(segments[j+1].description).unique();
                        console.log(newDescArr); 
                        
                        // create new daily section sites
                        var newSitesArr = (segments[j].sites).concat(segments[j+1].sites);

                        // create new daily section sites
                        var newTypeArr = (segments[j].type).concat(segments[j+1].type).unique();

                        // create new daily section total km
                        var newTotalKm = (segments[j].total_km + segments[j+1].total_km).toFixed(1);
                        
                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[j].start_pt,
                            "end_pt": segments[j+1].end_pt,
                            "start_coord": segments[j].start_coord,
                            "end_coord": segments[j+1].end_coord,
                            "coord_Array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm":[],
                            "description": newDescArr,
                            "sites": newSitesArr,
                            "type": newTypeArr
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(newTypeArr);
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[(segments.length)-1].end_pt;
                    //buildRoute(endPT,  dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    callback(dailySectionsArr);                    
                }
                
                // if the trip's km per day is 10-15 km
                if(kmDay == 15){
                    for(var i = 0, j = 0; i<totalDays; i++, j+=3){
                        // create new daily section coords array
                        var tmpCoordArr = (segments[j].coord_Array).concat(segments[j+1].coord_Array);
                        var newCoordArr = tmpCoordArr.concat(segments[j+2].coord_Array);

                        //calculate new daily section duration
                        var durationArr1 = (segments[j].duration).split("-");
                        var durationArr2 = (segments[j+1].duration).split("-");
                        var durationArr3 = (segments[j+2].duration).split("-");
                        var minDuration = parseFloat(durationArr1[0]) + parseFloat(durationArr2[0]) + parseFloat(durationArr3[0]);
                        var maxDuration = parseFloat(durationArr1[1]) + parseFloat(durationArr2[1]) + parseFloat(durationArr3[1]);
                        var newDuration = minDuration + "-" + maxDuration;
                        
                        //create new daily section difficulty
                        var newDiff;
                        var diffArr = [segments[j].difficulty, segments[j+1].difficulty, segments[j+2].difficulty]; 
                        if(diffArr[0]=="קשה" || diffArr[1]=="קשה" || diffArr[2]=="קשה"){ 
                            newDiff = "קשה"; 
                        }
                        else if(diffArr[0]=="בינוני" || diffArr[1]=="בינוני" || diffArr[2]=="בינוני"){ 
                                newDiff = "בינוני";
                        }
                        else newDiff = "קל"; 

                        // function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };
            
                        // create new daily section alerts
                        var tmpAlertsArr = (segments[j].alert).concat(segments[j+1].alert);
                        var newAlertsArr = tmpAlertsArr.concat(segments[j+2].alert);
                        
                        // create new daily section description
                        var tmpDescArr = (segments[j].description).concat(segments[j+1].description).unique();
                        var newDescArr = tmpDescArr.concat(segments[j+2].description).unique(); 
                        
                        // create new daily section sites
                        var tmpSitesArr = (segments[j].sites).concat(segments[j+1].sites);
                        var newSitesArr = tmpSitesArr.concat(segments[j+2].sites);

                        // create new daily section sites
                        var tmpTypeArr = (segments[j].type).concat(segments[j+1].type).unique();
                        var newTypeArr = tmpTypeArr.concat(segments[j+2].type).unique();

                        // create new daily section total km
                        var newTotalKm = (segments[j].total_km + segments[j+1].total_km + segments[j+2].total_km).toFixed(1);

                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[j].start_pt,
                            "end_pt": segments[j+2].end_pt,
                            "start_coord": segments[j].start_coord,
                            "end_coord": segments[j+2].end_coord,
                            "coord_Array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm":[],
                            "description": newDescArr,
                            "sites": newSitesArr,
                            "type": newTypeArr
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(newTypeArr);
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[(segments.length)-1].end_pt;
                    //buildRoute(endPT,  dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    callback(dailySectionsArr);                    
                }        
            });
        }
    }
    // if the trip's diresction is from north to south
    else if(dir=="south") {
        start = getFirstSegIndexSouth(callback);

        // getting the index of the first segment of the trip
        function getFirstSegIndexSouth(callback){
            var firstSeg = Segment.find({'end_pt':startPt}).select('indx');
            firstSeg.exec(function(err,segment){
            firstSegIndx = segment[0].indx;
            console.log("first segment i: " + firstSegIndx);
            getLastSegIndxSouth(firstSegIndx, callback);
            });
        }

        // getting the index of the last segment of the trip
        function getLastSegIndxSouth(firstSegIndx, callback){
            lastSegIndx = firstSegIndx - (numOfSegs - 1);
            console.log("last segment i: " + lastSegIndx);
            ////////getAccomm(startPt, totalDays);
            getSegsSouth(firstSegIndx, lastSegIndx, callback);
        }

        // getting the trip relevant segments and building the trip daily sections 
        function getSegsSouth(firstSegIndx, lastSegIndx, callback){
            segsArr = Segment.find({}).where('indx').gt(lastSegIndx-1).lt(firstSegIndx+1);
            segsArr.exec(function(err,segments){
                console.log("south: " + segments);
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalKm = 0; 
                var totalType = []; 
                var endPt;
                var easyDiff= 0, medDiff = 0, hardDiff = 0;

                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    for(var i = 0, j = (segments.length)-1; i < totalDays; i++, j--){
                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[j].end_pt,
                            "end_pt": segments[j].start_pt,
                            "start_coord": segments[j].end_coord,
                            "end_coord": segments[j].start_coord,
                            "coord_Array": segments[j].coord_Array,
                            "total_km": segments[j].total_km,
                            "area": segments[j].area,
                            "duration": segments[j].duration,
                            "difficulty": segments[j].difficulty,
                            "alert": segments[j].alert,
                            "accomm":[],
                            "description": segments[j].description,
                            "sites": segments[j].sites,
                            "type": segments[j].type
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(segments[j].type);
                        totalKm+=segments[j].total_km;
                        if(segments[j].difficulty == "קל") easyDiff+=1;
                        else if(segments[j].difficulty == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    console.log("endPt: " + endPt);
                    //buildRouteSouth(endPT, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    callback(dailySectionsArr);
                }
                
                // if the trip's km per day is 5-10 km
                if(kmDay == 10){
                    for(var i = 0, j = (segments.length)-1; i<totalDays; i++, j-=2){
                        // create new daily section coords array
                        var newCoordArr = (segments[j].coord_Array).concat(segments[j-1].coord_Array);
                        
                        //calculate new daily section duration
                        var durationArr1 = (segments[j].duration).split("-");
                        var durationArr2 = (segments[j-1].duration).split("-");
                        var minDuration = parseFloat(durationArr1[0]) + parseFloat(durationArr2[0]);
                        var maxDuration = parseFloat(durationArr1[1]) + parseFloat(durationArr2[1]);
                        var newDuration = minDuration + "-" + maxDuration;
                        
                        //create new daily section difficulty
                        var newDiff;
                        var diffArr = [segments[j].difficulty, segments[j-1].difficulty]; 
                        if(diffArr[0]=="קשה" || diffArr[1]=="קשה"){ 
                            newDiff = "קשה"; 
                        }
                        else if(diffArr[0]=="בינוני" || diffArr[1]=="בינוני"){ 
                                newDiff = "בינוני";
                        }
                        else newDiff = "קל"; 
                        
                        /*if(diffArr[0]=="קשה" || diffArr[1]=="קשה"){ 
                            newDiff = "קשה"; 
                        }
                        else if(diffArr[0]=="בינוני"){ 
                            if(diffArr[1] == "קל" || diffArr[1] == "בינוני")
                                newDiff = "בינוני";
                        }
                        else if(diffArr[0]=="קל"){ 
                            if(diffArr[1] == "קל")
                                newDiff = "קל"; 
                            else if(diffArr[1] == "בינוני")
                                newDiff = "בינוני";
                        }*/

                        // function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };
            
                        // create new daily section alerts
                        var newAlertsArr = (segments[j].alert).concat(segments[j-1].alert);

                        // create new daily section description
                        var newDescArr = (segments[j].description).concat(segments[j-1].description).unique();
                        console.log(newDescArr); 
                        
                        // create new daily section sites
                        var newSitesArr = (segments[j].sites).concat(segments[j-1].sites);

                        // create new daily section sites
                        var newTypeArr = (segments[j].type).concat(segments[j-1].type).unique();

                        // create new daily section total km
                        var newTotalKm = (segments[j].total_km + segments[j-1].total_km).toFixed(1);

                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[j].end_pt,
                            "end_pt": segments[j-1].start_pt,
                            "start_coord": segments[j].end_coord,
                            "end_coord": segments[j-1].start_coord,
                            "coord_Array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm":[],
                            "description": newDescArr,
                            "sites": newSitesArr,
                            "type": newTypeArr
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(newTypeArr);
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    //buildRouteSouth(endPT, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    callback(dailySectionsArr);                    
                }
                
                // if the trip's km per day is 10-15 km
                if(kmDay == 15){
                    for(var i = 0, j = (segments.length)-1; i<totalDays; i++, j-=3){
                        // create new daily section coords array
                        var tmpCoordArr = (segments[j].coord_Array).concat(segments[j-1].coord_Array);
                        var newCoordArr = tmpCoordArr.concat(segments[j-2].coord_Array);

                        //calculate new daily section duration
                        var durationArr1 = (segments[j].duration).split("-");
                        var durationArr2 = (segments[j-1].duration).split("-");
                        var durationArr3 = (segments[j-2].duration).split("-");
                        var minDuration = parseFloat(durationArr1[0]) + parseFloat(durationArr2[0]) + parseFloat(durationArr3[0]);
                        var maxDuration = parseFloat(durationArr1[1]) + parseFloat(durationArr2[1]) + parseFloat(durationArr3[1]);
                        var newDuration = minDuration + "-" + maxDuration;
                        
                        //create new daily section difficulty
                        var newDiff;
                        var diffArr = [segments[j].difficulty, segments[j-1].difficulty, segments[j-2].difficulty]; 
                        if(diffArr[0]=="קשה" || diffArr[1]=="קשה" || diffArr[2]=="קשה"){ 
                            newDiff = "קשה"; 
                        }
                        else if(diffArr[0]=="בינוני" || diffArr[1]=="בינוני" || diffArr[2]=="בינוני"){ 
                                newDiff = "בינוני";
                        }
                        else newDiff = "קל"; 

                        // function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };
            
                        // create new daily section alerts
                        var tmpAlertsArr = (segments[j].alert).concat(segments[j-1].alert);
                        var newAlertsArr = tmpAlertsArr.concat(segments[j-2].alert);
                        
                        // create new daily section description
                        var tmpDescArr = (segments[j].description).concat(segments[j-1].description).unique();
                        var newDescArr = tmpDescArr.concat(segments[j-2].description).unique(); 
                        
                        // create new daily section sites
                        var tmpSitesArr = (segments[j].sites).concat(segments[j-1].sites);
                        var newSitesArr = tmpSitesArr.concat(segments[j-2].sites);

                        // create new daily section sites
                        var tmpTypeArr = (segments[j].type).concat(segments[j-1].type).unique();
                        var newTypeArr = tmpTypeArr.concat(segments[j-2].type).unique();

                        // create new daily section total km
                        var newTotalKm = (segments[j].total_km + segments[j-1].total_km + segments[j-2].total_km).toFixed(1);

                        dailySection = 
                        { 
                            "indx": i+1,
                            "date": "",
                            "start_pt": segments[j].end_pt,
                            "end_pt": segments[j-2].start_pt,
                            "start_coord": segments[j].end_coord,
                            "end_coord": segments[j-2].start_coord,
                            "coord_Array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm":[],
                            "description": newDescArr,
                            "sites": newSitesArr,
                            "type": newTypeArr
                        }
                        dailySectionsArr.push(dailySection);
                        totalType.push(newTypeArr);
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    //buildRouteSouth(endPT, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, callback);
                    callback(dailySectionsArr);                    
                }        
            });
        }        
    }
}