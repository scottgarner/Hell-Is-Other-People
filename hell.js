var express = require("express");
var pg = require('pg');

var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/ws', function(request, response) {
  response.send('Total webservice!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
