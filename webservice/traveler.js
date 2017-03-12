var mongoose = require('mongoose');
var schema = mongoose.Schema;

var travelerSchema = new schema({
    full_name: String,
    image: String,
    email: {type:String, index:1, required:true, unique:true},
    current_route: {
        trip_start_pt: String,
        trip_end_pt: String,
        start_date: Date,
        end_date: Date,
        days_num: Number,
        trip_km: Number,
        day_km: String,
        daily_sections: [
            { 
                indx: {type:Number, index:1, required:true, unique:true},
                date: Date,
                start_pt: String,
                end_pt: String,
                start_coord: {
                    lat: String,
                    lng: String
                },
                end_coord: {
                    lat: String,
                    lng: String
                },
                coord_Array: [{
                    lat: String,
                    lng: String
                }]
                total_km: {
                    type: SchemaTypes.Double
                },                
                area: String,
                duration: String,
                difficulty: String,
                alert: [String],
                accomm:[{
                    accomm_name: String,
                    phone: String
                }],
                description: [String],
                sites: [String],
                type: [String]
            }
        ]
    },
    previous_routes: [{
        trip_start_pt: String,
        trip_end_pt: String,
        start_date: Date,
        end_date: Date,
        days_num: Number,
        trip_km: Number,
        day_km: String,
        daily_sections: [
            { 
                indx: {type:Number, index:1, required:true, unique:true},
                date: Date,
                start_pt: String,
                end_pt: String,
                start_coord: {
                    lat: String,
                    lng: String
                },
                end_coord: {
                    lat: String,
                    lng: String
                },
                coord_Array: [{
                    lat: String,
                    lng: String
                }]
                total_km: {
                    type: SchemaTypes.Double
                },                
                area: String,
                duration: String,
                difficulty: String,
                alert: [String],
                accomm:[{
                    accomm_name: String,
                    phone: String
                }],
                description: [String],
                sites: [String],
                type: [String]
            }
        ]
    }],
    my_routes: [{
        trip_start_pt: String,
        trip_end_pt: String,
        start_date: Date,
        end_date: Date,
        days_num: Number,
        trip_km: Number,
        day_km: String,
        daily_sections: [
            { 
                indx: {type:Number, index:1, required:true, unique:true},
                date: Date,
                start_pt: String,
                end_pt: String,
                start_coord: {
                    lat: String,
                    lng: String
                },
                end_coord: {
                    lat: String,
                    lng: String
                },
                coord_Array: [{
                    lat: String,
                    lng: String
                }]
                total_km: {
                    type: SchemaTypes.Double
                },                
                area: String,
                duration: String,
                difficulty: String,
                alert: [String],
                accomm:[{
                    accomm_name: String,
                    phone: String
                }],
                description: [String],
                sites: [String],
                type: [String]
            }
        ]
    }]
}, {collection: 'travelers'});

var Traveler = mongoose.model('Traveler', travelerSchema);

module.exports = Traveler;