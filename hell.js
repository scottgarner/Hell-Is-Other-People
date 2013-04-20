var express = require("express");
var pg = require('pg');

var app = express();
app.use(express.logger());
app.use(express.bodyParser());

client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/ws', function(request, response) {
  response.send('Total webservice!');
  var mod_time = console.log(request.body.checkin.createdAt);
  var user_id = console.log(request.body.checkin.user.id);
  var location_lat = console.log(request.body.checkin.venue.location.lat);
  var location_lng = console.log(request.body.checkin.venue.location.lng);


  client.query('UPDATE people SET mod_time = $2, location_lng = $3, location_lat = $4 WHERE user_id = $1', 
	user_id, mod_time, location_lat, location_lng);
  client.query('INSERT INTO people (user_id, mod_time, location_lat, location_lng) VALUES($1,$2,$3,$4) WHERE NOT EXISTS (SELECT 1 FROM people WHERE user_id = $1)',
  	user_id, mod_time, location_lat, location_lng);


});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
