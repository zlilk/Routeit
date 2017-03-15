var mongoose = require('mongoose');
var Segment = require('./segment');

exports.calculateRoute = function(area, kmDay, dir, totalDays, startPt, diff, type, callback){
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

    var numOfDailySections, maxTripTotalKm, numOfSegs;
    var maxSegmentKm = 5;
    maxTripTotalKm = totalDays * kmDay; 
    numOfSegs = maxTripTotalKm / maxSegmentKm;
    numOfDailySections = maxTripTotalKm / kmDay;
    //console.log(numOfSegs);
    //console.log(area + " " + kmDay + " " +  dir  + " " +  totalDays  + " " +  startPt  + " " + diff  + " " +  type);
    ///////////// too much days ? less segments ?
            
    var start;
    var firstSegIndx, lastSegIndx, segsArr, accommArr;
    
    // if the trip's diresction is from north to south
    if(dir == "north"){
        start = getFirstSegIndex(callback);

        // getting the index of the first segment of the trip
        function getFirstSegIndex(callback){
            var firstSeg = Segment.find({'start_pt':startPt}).select('indx');
            firstSeg.exec(function(err,segment){
            firstSegIndx = segment[0].indx;
            //console.log("first segment i: " + firstSegIndx);
            getLastSegIndx(firstSegIndx, callback);
            });
        }

        // getting the index of the last segment of the trip
        function getLastSegIndx(firstSegIndx, callback){
            lastSegIndx = firstSegIndx + (numOfSegs - 1);
            //console.log("last segment i: " + lastSegIndx);
            ////////getAccomm(startPt, totalDays);
            getSegs(firstSegIndx, lastSegIndx, callback);
        }

        // getting the trip relevant segments and building the trip daily sections 
        function getSegs(firstSegIndx, lastSegIndx, callback){
            segsArr = Segment.find({}).where('indx').gt(firstSegIndx-1).lt(lastSegIndx+1);
            segsArr.exec(function(err,segments){
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalKm = 0; // trip's total km 
                var totalType = [], tmpTotalType = []; // trip's total type
                var totalSites = [], tmpTotalSites = []; // trip's total sites
                var totalDescription = [], tmpTotalDescription = []; // trip's total desccription
                var endPt; // trip's end point
                var easyDiff= 0, medDiff = 0, hardDiff = 0; // trip's difficulty division 
                
                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    
                   /* Array.prototype.unique = function() {
                        var a = this.concat();
                        for(var i=0; i<a.length; ++i) {
                            for(var j=i+1; j<a.length; ++j) {
                                if(a[i] === a[j])
                                    a.splice(j--, 1);
                            }
                        }
                        return a;
                    };*/

                    for(var i = 0; i<totalDays; i++){
                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(segments[i].type);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(segments[i].sites);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(segments[i].description);
                        tmpTotalDescription = totalDescription;
                        totalKm+=segments[i].total_km;
                        if(segments[i].difficulty == "קל") easyDiff+=1;
                        else if(segments[i].difficulty == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    endPt = segments[(segments.length)-1].end_pt;
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
                    //var suggestedRoute = buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites);
                    buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    //callback(suggestedRoute);
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

                        /*// function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };*/
            
                        // create new daily section alerts
                        var newAlertsArr = (segments[j].alert).concat(segments[j+1].alert);

                        // create new daily section description
                        var newDescArr = (segments[j].description).concat(segments[j+1].description).unique(); 
                        
                        // create new daily section sites
                        var newSitesArr = (segments[j].sites).concat(segments[j+1].sites);

                        // create new daily section sites
                        var newTypeArr = (segments[j].type).concat(segments[j+1].type).unique();

                        // create new daily section total km
                        var newTotalKm = (segments[j].total_km + segments[j+1].total_km);
                        
                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(newTypeArr);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(newDescArr);
                        tmpTotalDescription = totalDescription;
                        totalKm+=newTotalKm;
                        console.log("km "+ i + ": " + totalKm);
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    totalKm.toFixed(1);
                    endPt = segments[(segments.length)-1].end_pt;
                    //buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
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

                        /*// function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };*/
            
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
                        var newTotalKm = (segments[j].total_km + segments[j+1].total_km + segments[j+2].total_km);

                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(newTypeArr);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(newDescArr);
                        tmpTotalDescription = totalDescription;
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    totalKm.toFixed(1);
                    endPt = segments[(segments.length)-1].end_pt;
                    //buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
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
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalKm = 0; // trip's total km 
                var totalType = [], tmpTotalType = []; // trip's total type
                var totalSites = [], tmpTotalSites = []; // trip's total sites
                var totalDescription = [], tmpTotalDescription = []; // trip's total desccription
                var endPt; // trip's end point
                var easyDiff= 0, medDiff = 0, hardDiff = 0; // trip's difficulty division 

                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    
                    /*Array.prototype.unique = function() {
                        var a = this.concat();
                        for(var i=0; i<a.length; ++i) {
                            for(var j=i+1; j<a.length; ++j) {
                                if(a[i] === a[j])
                                    a.splice(j--, 1);
                            }
                        }
                        return a;
                    };*/

                    for(var i = 0, j = (segments.length)-1; i < totalDays; i++, j--){
                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(segments[j].type);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(segments[j].sites);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(segments[j].description);
                        tmpTotalDescription = totalDescription;
                        totalKm+=segments[j].total_km;
                        if(segments[j].difficulty == "קל") easyDiff+=1;
                        else if(segments[j].difficulty == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    totalKm.toFixed(1);
                    //buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt); 
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

                        /*// function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };*/
            
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
                        var newTotalKm = (segments[j].total_km + segments[j-1].total_km);

                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(newTypeArr);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(newDescArr);
                        tmpTotalDescription = totalDescription;
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    totalKm.toFixed(1);
                    //buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
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

                       /* // function that removes duplicates from an array
                        Array.prototype.unique = function() {
                            var a = this.concat();
                            for(var i=0; i<a.length; ++i) {
                                for(var j=i+1; j<a.length; ++j) {
                                    if(a[i] === a[j])
                                        a.splice(j--, 1);
                                }
                            }
                            return a;
                        };*/
            
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
                        var newTotalKm = (segments[j].total_km + segments[j-1].total_km + segments[j-2].total_km);

                        dailySection = 
                        { 
                            "day_num": i+1,
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
                        totalType = tmpTotalType.concat(newTypeArr);
                        tmpTotalType = totalType;
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                        totalDescription = tmpTotalDescription.concat(newDescArr);
                        tmpTotalDescription = totalDescription;
                        totalKm+=newTotalKm;
                        if(newDiff == "קל") easyDiff+=1;
                        else if(newDiff == "בינוני") medDiff+=1;
                        else hardDiff+=1;
                    }
                    endPt = segments[0].start_pt;
                    totalType = totalType.unique();
                    totalDescription = totalDescription.unique();
                    totalKm.toFixed(1);
                    //buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);
                    callback(dailySectionsArr);                    
                }        
            });
        }        
    }
    
    function buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback){
        var isTypeRight = true; //flag to check if the chosen type matches the trip type
        var isDiffRight = true; //flag to check if the chosen difficulty matches the trip difficulty
        var totalDiff = ""; //trip's total difficulty
        var currentRoute; //the suggested route
        
        //checking if the chosen difficulty matches the trip difficulty
        //if the chosen difficulty is easy
        if (diff == "קל"){
            if(easyDiff > medDiff && easyDiff > hardDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברובו ברמת קושי קלה";
            }
            else if(easyDiff > hardDiff && easyDiff == medDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי קלה ובינונית";
            }
            else if(easyDiff > medDiff && easyDiff == hardDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי קלה וקשה";
            }
            else {
                isDiffRight = false;
                totalDiff = "המסלול אינו ברמת קושי קלה";
            }
        }
        //if the chosen difficulty is medium
        else if (diff == "בינוני"){
            if(medDiff > easyDiff && medDiff > hardDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברובו ברמת קושי בינונית";
            }
            else if(medDiff > hardDiff && medDiff == easyDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי בינונית וקלה";
            }
            else if(medDiff > easyDiff && medDiff == hardDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי בינונית וקשה";
            }
            else {
                isDiffRight = false;
                totalDiff = "המסלול אינו ברמת קושי בינונית";
            }
        }
        //if the chosen difficulty is hard
        else if (diff == "קשה"){
            if(hardDiff > easyDiff && hardDiff > medDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברובו ברמת קושי קשה";
            }
            else if(hardDiff > medDiff && hardDiff == easyDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי קשה וקלה";
            }
            else if(hardDiff > easyDiff && hardDiff == medDiff){
                isDiffRight = true;
                var totalDiff = "המסלול ברמת קושי קשה ובינונית";
            }
            else {
                isDiffRight = false;
                totalDiff = "המסלול אינו ברמת קושי קשה";
            }
        }

        console.log("easyDiff, medDiff, hardDiff " + easyDiff + medDiff + hardDiff)
        console.log("totalDiff " + totalDiff); 


        //checking if the chosen type matches the trip type
        /*if(type == "מתאים למשפחות"){
            console.log("family");
            for(t in totalType){
                if(t == "מאתגר" || t == "מיטיבי לכת"){
                    isTypeRight = false;
                    break;   
                } 
                else isTypeRight = true;
            }
        } else if(type == "מתאים למבוגרים"){
            console.log("old");
            for(t in totalType){
                if(t == "מאתגר" || t == "מיטיבי לכת"){
                    isTypeRight = false;
                    break;   
                }
                else if(t == "מתאים למבוגרים"){
                    isTypeRight = true;
                } 
                else isTypeRight = false;
            }
        } else if(type == "מאתגר"){
            console.log("hard");
            for(t in totalType){
                if(t == "מיטיבי לכת"){
                    isTypeRight = false;
                    break;   
                }
                else if(t == "מאתגר"){
                    isTypeRight = true;
                } 
                else isTypeRight = false;
            }
        } else if(type == "מיטיבי לכת"){
            console.log("very hard");
            for(t in totalType){
                if(t == "מיטיבי לכת"){
                    isTypeRight = true;
                }
                else isTypeRight = false;
            }
        }*/

        console.log("totalType: " + totalType);
        console.log("type is: " + isTypeRight);


        //if the chosen difficulty and type matches the trip difficulty and type
        if(isTypeRight == true && isDiffRight == true){
            currentRoute = {
                "area": area,
                "trip_start_pt": startPt,
                "trip_end_pt": endPt,
                "start_date": "",
                "end_date": "",
                "days_num": totalDays,
                "trip_km": totalKm,
                "day_km": kmDay,
                "trip_difficulty": totalDiff,
                "trip_sites": totalSites,
                "trip_type": "tmp",
                "trip_description": totalDescription,
                "daily_sections": dailySectionsArr
            }
        //if the chosen difficulty and type don't match the trip difficulty and type 
        } else {
            currentRoute = "המסלול אינו תואם לחיפוש שלך";
        }

        //return currentRoute;
        callback(currentRoute);
    }
}