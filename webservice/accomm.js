var mongoose = require('mongoose');
var schema = mongoose.Schema;

var accommSchema = new schema({
    point_name: String,
    accomm_list: [{
        accomm_name: String,
        phone: String
    }]
}, {collection: 'accommodation'});

var Accomm = mongoose.model('Accomm', accommSchema);

module.exports = Accomm;
