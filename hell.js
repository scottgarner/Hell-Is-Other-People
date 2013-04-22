var express = require("express");
var pg = require('pg');
var request = require('request');


var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


var port = process.env.PORT || 5000;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/hell'

var client = new pg.Client(connectionString);
client.connect();


// Routes
/////////

app.get('/', function(request, response) {

  response.render('index');

});

app.get('/privacy', function(request, response) {
  response.render('privacy');
});

app.get('/about', function(request, response) {
  response.render('about');
});

app.get('/redirect', function(request, response) {
  
  response.render('redirect');

  var code = request.query["code"];
  authRequest(code);

});

app.get('/status', function(request, response) {
  response.send("Everything appears nominal.");
});

app.get('/map', function(request, response) {
  response.render('map');
});

app.get('/json/',function(request, response) {

  client.query(
    "SELECT location_lat, location_lng FROM people ORDER BY mod_time DESC LIMIT 12;",
    function selectCb(err, results, fields){
      if(err) { throw err; }
    
      response.setHeader('Content-Type', 'application/json');
      response.send( results.rows );
      
      response.end();
  });   

});


app.post('/ws', function(request, response) {
  response.send('Total webservice!');

  var checkin = JSON.parse(request.body.checkin);

  var mod_time = checkin.createdAt;
  var user_id = checkin.user.id;
  var location_lat = checkin.venue.location.lat;
  var location_lng = checkin.venue.location.lng;


  client.query('UPDATE people SET mod_time = to_timestamp($2), location_lat = $3, location_lng = $4 WHERE (user_id = md5($1));', 
   [user_id, mod_time, location_lat, location_lng]);

  client.query('INSERT INTO people (user_id, mod_time, location_lat, location_lng) SELECT md5($1),to_timestamp($2),$3,$4 WHERE NOT EXISTS (SELECT 1 FROM people WHERE user_id = md5($1));',
  	[user_id, mod_time, location_lat, location_lng]);


});

function authRequest(code) {

  var url = "https://foursquare.com/oauth2/access_token"+
  "?client_id=S1ZJDYD1JVMEP5IET2OMBIJ2RDLZJPZ4QTY3EFHSRVLAI3OX"+
  "&client_secret=QWK54ZSA402ONOJBOMXQ3KOJ1L03SUKOFYNN4T1URCJU12JC"+
  "&grant_type=authorization_code"+
  "&redirect_uri=https://hellisotherpeople.herokuapp.com/redirect/"+
  "&code=" + code;

  request(url,function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
}


// Listener
///////////

app.listen(port, function() {
  console.log("Listening on " + port);
});

