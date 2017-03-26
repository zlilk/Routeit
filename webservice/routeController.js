var mongoose = require('mongoose');
var Segment = require('./segment');
var Accomm = require('./accomm');

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

// calculate suggested route according to traveler's crtieria  
exports.calculateRoute = function(area, kmDay, dir, totalDays, startPt, diff, type, callback){
    var numOfDailySections, maxTripTotalKm, numOfSegs;
    var maxSegmentKm = 5;
    maxTripTotalKm = totalDays * kmDay; 
    numOfSegs = maxTripTotalKm / maxSegmentKm;
    numOfDailySections = maxTripTotalKm / kmDay;
            
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
                getLastSegIndx(firstSegIndx, callback);
            });
        }

        // getting the index of the last segment of the trip
        function getLastSegIndx(firstSegIndx, callback){
            lastSegIndx = firstSegIndx + (numOfSegs - 1);
            var checkLastIndx = Segment.find({'indx':lastSegIndx});
            checkLastIndx.exec(function(err,segment){
                //console.log("last segment: " + segment);
                if(segment == ""){ 
                    callback("segmentsErr");
                }
                else getSegs(firstSegIndx, lastSegIndx, callback);
            });
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
                    for(var i = 0; i<totalDays; i++){
                        dailySection = 
                        { 
                            "day_num": i+1,
                            "date": "",
                            "start_pt": segments[i].start_pt,
                            "end_pt": segments[i].end_pt,
                            "start_coord": segments[i].start_coord,
                            "end_coord": segments[i].end_coord,
                            "coord_array": segments[i].coord_Array,
                            "total_km": segments[i].total_km,
                            "area": segments[i].area,
                            "duration": segments[i].duration,
                            "difficulty": segments[i].difficulty,
                            "alert": segments[i].alert,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                    /*console.log("total KM: " + totalKm);
                    console.log("totalDescription: " + totalDescription);
                    console.log("totalSites: " + totalSites);
                    console.log("easyDiff: " + easyDiff + " medDiff: " +medDiff+ " hardDiff: "+ hardDiff);
                    console.log("totalType: " + totalType);
                    console.log("endPt: " + endPt);*/
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
                            "coord_array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
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
                            "coord_array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);              
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
                getLastSegIndxSouth(firstSegIndx, callback);
            });
        }

        // getting the index of the last segment of the trip
        function getLastSegIndxSouth(firstSegIndx, callback){
            lastSegIndx = firstSegIndx - (numOfSegs - 1);
            var checkLastIndx = Segment.find({'indx':lastSegIndx});
            checkLastIndx.exec(function(err,segment){
                //console.log("last segment: " + segment);
                if(segment == ""){ 
                    callback("segmentsErr");
                }
                else getSegsSouth(firstSegIndx, lastSegIndx, callback);
            });
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
                    for(var i = 0, j = (segments.length)-1; i < totalDays; i++, j--){
                        dailySection = 
                        { 
                            "day_num": i+1,
                            "date": "",
                            "start_pt": segments[j].end_pt,
                            "end_pt": segments[j].start_pt,
                            "start_coord": segments[j].end_coord,
                            "end_coord": segments[j].start_coord,
                            "coord_array": segments[j].coord_Array,
                            "total_km": segments[j].total_km,
                            "area": segments[j].area,
                            "duration": segments[j].duration,
                            "difficulty": segments[j].difficulty,
                            "alert": segments[j].alert,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
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

                        // create new daily section alerts
                        var newAlertsArr = (segments[j].alert).concat(segments[j-1].alert);

                        // create new daily section description
                        var newDescArr = (segments[j].description).concat(segments[j-1].description).unique();
                        
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
                            "coord_array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
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
                            "coord_array": newCoordArr,
                            "total_km": newTotalKm,
                            "area": segments[j].area,
                            "duration": newDuration,
                            "difficulty": newDiff,
                            "alert": newAlertsArr,
                            "accomm_array":[],
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
                    addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
                }        
            });
        }        
    }

    //function that adds the accommodation lists for all of the daily sections
    function addAccomToDailySections(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback){
        var accommPointsArr = [];
        for(i = 0; i<dailySectionsArr.length; i++){
            accommPointsArr.push(dailySectionsArr[i].end_pt);
        }
        // get all of the accommodation lists for all of daily section's end points
        var getAccom = Accomm.find({'point_name':{'$in' : accommPointsArr}});
        getAccom.exec(function(err,accommArr){
            addToDaily(accommArr, endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
        });  

        // adding the accommodation lists to daily sections array
        function addToDaily(accommArr, endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback){
            for(j = 0; j<dailySectionsArr.length; j++){
                for(k = 0; k<accommArr.length; k++){
                    if(dailySectionsArr[j].end_pt == accommArr[k].point_name){
                        dailySectionsArr[j].accomm_array = accommArr[k].accomm_list;
                    }
                }
            }
            buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback);
        }
    }
    
    // function that builds the suggested route
    function buildRoute(endPt, dailySectionsArr, totalKm, easyDiff, medDiff, hardDiff, totalType, totalDescription, totalSites, callback){
        var isTypeRight = false; //flag to check if the chosen type matches the trip type
        var isDiffRight = true; //flag to check if the chosen difficulty matches the trip difficulty
        var totalDiff = ""; //trip's total difficulty
        var currentRoute; //the suggested route
        var isTypeRightOld = false; //flag to check if the type is for old people
        var isTypeRightFamily = false; //flag to check if the type is for families
        var isTypeRightChallenge = false; //flag to check if the type is challenging
        var isTypeRightHard = false; //flag to check if the type is hard
        
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

        //checking if the chosen type matches the trip type
        // if the chosen type is for families
        if(type == "מתאים למשפחות"){
            for(t in totalType){
                if(totalType[t] == "מאתגר" || totalType[t] == "מיטיבי לכת"){ 
                    isTypeRightChallenge=true;
                    isTypeRightHard=true;
                    break;
                } else if(totalType[t]=="מתאים למשפחות") isTypeRightFamily=true;
            }
            if(isTypeRightFamily==true && isTypeRightChallenge==false && isTypeRightHard==false)
                isTypeRight = true;
        }
        // if the chosen type is for old people
        else if(type == "מתאים למבוגרים"){
            for(t in totalType){
                if(totalType[t] == "מאתגר" || totalType[t] == "מיטיבי לכת"){ 
                    isTypeRightChallenge=true;
                    isTypeRightHard=true;
                    break;
                } else if(totalType[t]=="מתאים למבוגרים") isTypeRightOld=true;
            }
            if(isTypeRightOld==true && isTypeRightChallenge==false && isTypeRightHard==false)
                isTypeRight = true;
        } 
        // if the chosen type is challenging  
        else if(type == "מאתגר"){
            for(t in totalType){
                if(totalType[t] == "מיטיבי לכת"){ 
                    isTypeRightHard=true;
                    break;
                } else if(totalType[t]=="מאתגר") isTypeRightChallenge=true;
            }
            if(isTypeRightChallenge==true && isTypeRightHard==false)
                isTypeRight = true;
        }
        // if the chosen type is hard
        else if(type == "מיטיבי לכת"){
            for(t in totalType){
                if(totalType[t] == "מיטיבי לכת"){
                    isTypeRightHard=true;
                    break;
                } 
            }
            if(isTypeRightHard==true){
                isTypeRight = true;
            }
        }
        else if(type == "ללא"){
            isTypeRight = true;
        }
       
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
                "trip_type": totalType,
                "trip_description": totalDescription,
                "daily_sections": dailySectionsArr
            }
        callback(currentRoute);
        //if the chosen difficulty and type don't match the trip difficulty and type 
        } else {
            if (isTypeRight == false && isDiffRight == true) {
                //currentRoute = "המסלול אינו תואם את אופי הטיול שבחרת";
                callback("typeErr");
            }
            else if(isDiffRight == false && isTypeRight == true) {
                //currentRoute = "המסלול אינו תואם את רמת הקושי שבחרת";
                callback("diffErr");
            } else {
                //currentRoute = "המסלול אינו תואם את אופי הטיול ואת רמת הקושי שבחרת";
                callback("typeDiffErr");
            }   
        }
    }
}

// calculate the full route according to traveler's criteria
exports.calculateFullRoute = function(area, kmDay, dir, callback){
    var start;
    var startPt, endPt, segsArr, accommArr, totalDays;

    // if the trip's diresction is from north to south
    if(dir == "north"){
        start = getSegs(callback);
        // getting the full trip segments and building the trip daily sections
        function getSegs(callback){
            segsArr = Segment.find({});
            segsArr.exec(function(err,segments){
                var totalKm = 0;
                for(var i = 0; i<segments.length; i++){
                    if(segments[i].indx==1) startPt = segments[i].start_pt;
                    if(segments[i].indx==segments.length) endPt = segments[i].end_pt;                
                    totalKm += segments[i].total_km;
                }
                /*console.log("startPt is: " + startPt);
                console.log("endPt is: " + endPt);
                console.log("totalKm: " + totalKm);*/
                
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalSites = [], tmpTotalSites = []; // trip's total sites
                
                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    totalDays = segments.length;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0; i<totalDays; i++){
                        dailySection = 
                        { 
                            "day_num": i+1,
                            "date": "",
                            "start_pt": segments[i].start_pt,
                            "end_pt": segments[i].end_pt,
                            "start_coord": segments[i].start_coord,
                            "end_coord": segments[i].end_coord,
                            "coord_array": segments[i].coord_Array,
                            "total_km": segments[i].total_km,
                            "area": segments[i].area,
                            "duration": segments[i].duration,
                            "difficulty": segments[i].difficulty,
                            "alert": segments[i].alert,
                            "accomm_array":[],
                            "description": segments[i].description,
                            "sites": segments[i].sites,
                            "type": segments[i].type
                        }
                        dailySectionsArr.push(dailySection); 
                        totalSites = tmpTotalSites.concat(segments[i].sites);
                        tmpTotalSites = totalSites;
                    }  
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }

                // if the trip's km per day is 5-10 km
                if(kmDay == 10){
                    totalDays = (segments.length)/2;
                    if(totalDays % 1 != 0) totalDays = parseInt(totalDays) + 1;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0, j = 0; i<totalDays; i++, j+=2){
                        //console.log("inside the " + j + " iteration");
                        if((segments[j+1]) ==  null) {
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].start_pt,
                                "end_pt": segments[j].end_pt,
                                "start_coord": segments[j].start_coord,
                                "end_coord": segments[j].end_coord,
                                "coord_array": segments[j].coord_Array,
                                "total_km": segments[j].total_km,
                                "area": segments[j].area,
                                "duration": segments[j].duration,
                                "difficulty": segments[j].difficulty,
                                "alert": segments[j].alert,
                                "accomm_array":[],
                                "description": segments[j].description,
                                "sites": segments[j].sites,
                                "type": segments[j].type
                            }
                        } else { 
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

                            // create new daily section alerts
                            var newAlertsArr = (segments[j].alert).concat(segments[j+1].alert);

                            // create new daily section description
                            var newDescArr = (segments[j].description).concat(segments[j+1].description).unique(); 
                            
                            // create new daily section sites
                            var newSitesArr = (segments[j].sites).concat(segments[j+1].sites);

                            // create new daily section sites
                            var newTypeArr = (segments[j].type).concat(segments[j+1].type).unique();

                            // create new daily section total km
                            var newTotalKm = (segments[j].total_km + segments[j+1].total_km).toFixed(1);
                            
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].start_pt,
                                "end_pt": segments[j+1].end_pt,
                                "start_coord": segments[j].start_coord,
                                "end_coord": segments[j+1].end_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        }
                        dailySectionsArr.push(dailySection);
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                    }
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }

                // if the trip's km per day is 10-15 km
                if(kmDay == 15){
                    totalDays = (segments.length)/3;
                    if(totalDays % 1 != 0) totalDays = parseInt(totalDays) + 1;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0, j = 0; i<totalDays; i++, j+=3){
                        if(segments[j+1] == null) {
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].start_pt,
                                "end_pt": segments[j].end_pt,
                                "start_coord": segments[j].start_coord,
                                "end_coord": segments[j].end_coord,
                                "coord_array": segments[j].coord_Array,
                                "total_km": segments[j].total_km,
                                "area": segments[j].area,
                                "duration": segments[j].duration,
                                "difficulty": segments[j].difficulty,
                                "alert": segments[j].alert,
                                "accomm_array":[],
                                "description": segments[j].description,
                                "sites": segments[j].sites,
                                "type": segments[j].type
                            }
                        } else if(segments[j+2] == null){
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

                            // create new daily section alerts
                            var newAlertsArr = (segments[j].alert).concat(segments[j+1].alert);

                            // create new daily section description
                            var newDescArr = (segments[j].description).concat(segments[j+1].description).unique(); 
                            
                            // create new daily section sites
                            var newSitesArr = (segments[j].sites).concat(segments[j+1].sites);

                            // create new daily section sites
                            var newTypeArr = (segments[j].type).concat(segments[j+1].type).unique();

                            // create new daily section total km
                            var newTotalKm = (segments[j].total_km + segments[j+1].total_km).toFixed(1);
                            
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].start_pt,
                                "end_pt": segments[j+1].end_pt,
                                "start_coord": segments[j].start_coord,
                                "end_coord": segments[j+1].end_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        } else {
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
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].start_pt,
                                "end_pt": segments[j+2].end_pt,
                                "start_coord": segments[j].start_coord,
                                "end_coord": segments[j+2].end_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        }
                        dailySectionsArr.push(dailySection);
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                    }
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }
            });
        } 
    } 
    // if the trip's diresction is from north to south
    else if(dir == "south"){
        start = getSegsSouth(callback);
        // getting the full trip segments and building the trip daily sections
        function getSegsSouth(callback){
            segsArr = Segment.find({});
            segsArr.exec(function(err,segments){
                var totalKm = 0;
                for(var i = 0; i<segments.length; i++){
                    if(segments[i].indx==1) endPt = segments[i].start_pt;
                    if(segments[i].indx==segments.length) startPt = segments[i].end_pt;                
                    totalKm += segments[i].total_km;
                }
                /*console.log("startPt is: " + startPt);
                console.log("endPt is: " + endPt);
                console.log("totalKm: " + totalKm);*/
                
                var dailySectionsArr = []; // array of all trip's daily sections
                var dailySection; // daily section for one day 
                var totalSites = [], tmpTotalSites = []; // trip's total sites
                
                // if the trip's km per day is up to 5 km
                if(kmDay == 5){
                    totalDays = segments.length;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0, j = (segments.length)-1; i < totalDays; i++, j--){
                        dailySection = 
                        { 
                            "day_num": i+1,
                            "date": "",
                            "start_pt": segments[j].end_pt,
                            "end_pt": segments[j].start_pt,
                            "start_coord": segments[j].end_coord,
                            "end_coord": segments[j].start_coord,
                            "coord_array": segments[j].coord_Array,
                            "total_km": segments[j].total_km,
                            "area": segments[j].area,
                            "duration": segments[j].duration,
                            "difficulty": segments[j].difficulty,
                            "alert": segments[j].alert,
                            "accomm_array":[],
                            "description": segments[j].description,
                            "sites": segments[j].sites,
                            "type": segments[j].type
                        }
                        dailySectionsArr.push(dailySection); 
                        totalSites = tmpTotalSites.concat(segments[j].sites);
                        tmpTotalSites = totalSites;
                    }  
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }

                // if the trip's km per day is 5-10 km
                if(kmDay == 10){
                    totalDays = (segments.length)/2;
                    if(totalDays % 1 != 0) totalDays = parseInt(totalDays) + 1;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0, j = (segments.length)-1; i<totalDays; i++, j-=2){
                        if((segments[j-1]) ==  null) {
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].end_pt,
                                "end_pt": segments[j].start_pt,
                                "start_coord": segments[j].end_coord,
                                "end_coord": segments[j].start_coord,
                                "coord_array": segments[j].coord_Array,
                                "total_km": segments[j].total_km,
                                "area": segments[j].area,
                                "duration": segments[j].duration,
                                "difficulty": segments[j].difficulty,
                                "alert": segments[j].alert,
                                "accomm_array":[],
                                "description": segments[j].description,
                                "sites": segments[j].sites,
                                "type": segments[j].type
                            }
                        } else {
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

                            // create new daily section alerts
                            var newAlertsArr = (segments[j].alert).concat(segments[j-1].alert);

                            // create new daily section description
                            var newDescArr = (segments[j].description).concat(segments[j-1].description).unique();
                            
                            // create new daily section sites
                            var newSitesArr = (segments[j].sites).concat(segments[j-1].sites);

                            // create new daily section sites
                            var newTypeArr = (segments[j].type).concat(segments[j-1].type).unique();

                            // create new daily section total km
                            var newTotalKm = (segments[j].total_km + segments[j-1].total_km).toFixed(1);

                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].end_pt,
                                "end_pt": segments[j-1].start_pt,
                                "start_coord": segments[j].end_coord,
                                "end_coord": segments[j-1].start_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        }
                        dailySectionsArr.push(dailySection);
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                    }
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }

                // if the trip's km per day is 10-15 km
                if(kmDay == 15){
                    totalDays = (segments.length)/3;
                    if(totalDays % 1 != 0) totalDays = parseInt(totalDays) + 1;
                    //console.log("total days is: " + totalDays);
                    for(var i = 0, j = (segments.length)-1; i<totalDays; i++, j-=3){
                        if((segments[j-1]) ==  null) {
                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].end_pt,
                                "end_pt": segments[j].start_pt,
                                "start_coord": segments[j].end_coord,
                                "end_coord": segments[j].start_coord,
                                "coord_array": segments[j].coord_Array,
                                "total_km": segments[j].total_km,
                                "area": segments[j].area,
                                "duration": segments[j].duration,
                                "difficulty": segments[j].difficulty,
                                "alert": segments[j].alert,
                                "accomm_array":[],
                                "description": segments[j].description,
                                "sites": segments[j].sites,
                                "type": segments[j].type
                            }
                        } else if((segments[j-2]) ==  null){
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

                            // create new daily section alerts
                            var newAlertsArr = (segments[j].alert).concat(segments[j-1].alert);

                            // create new daily section description
                            var newDescArr = (segments[j].description).concat(segments[j-1].description).unique();
                            
                            // create new daily section sites
                            var newSitesArr = (segments[j].sites).concat(segments[j-1].sites);

                            // create new daily section sites
                            var newTypeArr = (segments[j].type).concat(segments[j-1].type).unique();

                            // create new daily section total km
                            var newTotalKm = (segments[j].total_km + segments[j-1].total_km).toFixed(1);

                            dailySection = 
                            { 
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].end_pt,
                                "end_pt": segments[j-1].start_pt,
                                "start_coord": segments[j].end_coord,
                                "end_coord": segments[j-1].start_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        } else {
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
                                "day_num": i+1,
                                "date": "",
                                "start_pt": segments[j].end_pt,
                                "end_pt": segments[j-2].start_pt,
                                "start_coord": segments[j].end_coord,
                                "end_coord": segments[j-2].start_coord,
                                "coord_array": newCoordArr,
                                "total_km": newTotalKm,
                                "area": segments[j].area,
                                "duration": newDuration,
                                "difficulty": newDiff,
                                "alert": newAlertsArr,
                                "accomm_array":[],
                                "description": newDescArr,
                                "sites": newSitesArr,
                                "type": newTypeArr
                            }
                        }
                        dailySectionsArr.push(dailySection);
                        totalSites = tmpTotalSites.concat(newSitesArr);
                        tmpTotalSites = totalSites;
                    }
                    addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
                }
            });
        }
    }

    function addAccomToDailySections(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback){
        var accommPointsArr = [];
        for(i = 0; i<dailySectionsArr.length; i++){
            accommPointsArr.push(dailySectionsArr[i].end_pt);
        }
        // get all of the accommodation lists for all of daily section's end points
        var getAccom = Accomm.find({'point_name':{'$in' : accommPointsArr}});
        getAccom.exec(function(err,accommArr){
            addToDaily(accommArr,startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
        });  

        // adding the accommodation lists to daily sections array
        function addToDaily(accommArr,startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback){
            for(j = 0; j<dailySectionsArr.length; j++){
                for(k = 0; k<accommArr.length; k++){
                    if(dailySectionsArr[j].end_pt == accommArr[k].point_name){
                        dailySectionsArr[j].accomm = accommArr[k].accomm_list;
                    }
                    //console.log("for daily section end point " + dailySectionsArr[j].end_pt + " the accomm list is: " + dailySectionsArr[j].accomm);
                }
            }
            //callback(dailySectionsArr);
            buildRoute(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback);
        }
    }

    function buildRoute(startPt, endPt, dailySectionsArr, totalKm, totalDays, totalSites, callback){
        var totalDescription = "שביל ישראל הוא הטרק של המדינה, שביל המזמין אתכם לחוות את הארץ דרך כל הגוף וכל החושים. מסע אלף הקילומטרים של שביל ישראל יוביל אתכם מדן ועד אילת, ובדרך תטעמו מכל טוב הארץ: מהירוק והמים של מקורות הירדן, הרי הגליל, הכנרת, הכרמל ומרכז הארץ, השקט של המדבר ועד הצבעים של הרי אילת וים סוף."
        var currentRoute = {
            "area": area,
            "trip_start_pt": startPt,
            "trip_end_pt": endPt,
            "start_date": "",
            "end_date": "",
            "days_num": totalDays,
            "trip_km": totalKm,
            "day_km": kmDay,
            "trip_difficulty": "",
            "trip_sites": totalSites,
            "trip_type": "",
            "trip_description": totalDescription,
            "daily_sections": dailySectionsArr
        }  
        callback(currentRoute);
    }
}