var express = require("express");
var pg = require('pg');
var request = require('request');


var app = express();
app.use(express.logger());
app.use(express.bodyParser());

var port = process.env.PORT || 5000;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/hell'

console.log("Connecting to " + connectionString );

var client = new pg.Client(connectionString);
client.connect();

app.get('/', function(request, response) {
  var html = "<a href='https://foursquare.com/oauth2/authenticate?client_id=S1ZJDYD1JVMEP5IET2OMBIJ2RDLZJPZ4QTY3EFHSRVLAI3OX&response_type=code&redirect_uri=https://hellisotherpeople.herokuapp.com/redirect'><img alt='Foursquare' src='https://playfoursquare.s3.amazonaws.com/press/logo/connect-blue.png'></a>";
  response.send(html);
});

app.get('/redirect', function(request, response) {
  var html = "We are friends now.";
  response.send(html);

  var code = req.query["code"];
  var url = "https://foursquare.com/oauth2/access_token"+
    "?client_id=S1ZJDYD1JVMEP5IET2OMBIJ2RDLZJPZ4QTY3EFHSRVLAI3OX"+
    "&client_secret=QWK54ZSA402ONOJBOMXQ3KOJ1L03SUKOFYNN4T1URCJU12JC"+
    "&grant_type=authorization_code"+
    "&redirect_uri=https://hellisotherpeople.herokuapp.com/redirect"+
    "&code=" + code;

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  })

});

app.get('/privacy', function(request, response) {
  var html = "This is an art experiment, so there are risks. That said, I don't store any personally identifying data. I just want to know where people are so I can stay away from them.";
  response.send(html);
});

app.post('/ws', function(request, response) {
  response.send('Total webservice!');
 
  var checkin = JSON.parse(request.body.checkin);
  console.log(checkin.id);

  var mod_time = checkin.createdAt;
  var user_id = checkin.user.id;
  var location_lat = checkin.venue.location.lat;
  var location_lng = checkin.venue.location.lng;


  client.query('UPDATE people SET mod_time = to_timestamp($2), location_lat = $3, location_lng = $4 WHERE (user_id = $1);', 
	[user_id, mod_time, location_lat, location_lng]);

  client.query('INSERT INTO people (user_id, mod_time, location_lat, location_lng) SELECT $1,to_timestamp($2),$3,$4 WHERE NOT EXISTS (SELECT 1 FROM people WHERE user_id = $1);',
  	[user_id, mod_time, location_lat, location_lng]);


});

app.listen(port, function() {
  console.log("Listening on " + port);
});
