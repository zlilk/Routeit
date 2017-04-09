var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

var schema = mongoose.Schema;
var segmentSchema = new schema({
    indx: {type:Number, index:1, required:true, unique:true},
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
    }],
    total_km: {
        type: SchemaTypes.Double
    },
    area: String,
    duration: String,
    difficulty: String,
    alert: [String],
    description: [String],
    sites: [String],
    type: [String]
}, {collection: 'segments'});

var Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
