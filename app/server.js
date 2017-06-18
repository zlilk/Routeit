var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
app.use('/',express.static('./public')).listen(port);
console.log("listening on port");