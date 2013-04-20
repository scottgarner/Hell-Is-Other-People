var express = require("express");
var pg = require('pg');

var app = express();
app.use(express.logger());
app.use(express.bodyParser());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/ws', function(request, response) {
  response.send('Total webservice!');
  console.log(request.body.checkin.createdAt);
  console.log(request.body.checkin.user.id);
  console.log(request.body.checkin.venue.location.lat);
  console.log(request.body.checkin.venue.location.lng);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
