var express = require("express");
var pg = require('pg');
var passport = require('passport')
var FoursquareStrategy = require('passport-foursquare').Strategy;

var FOURSQUARE_CLIENT_ID = "S1ZJDYD1JVMEP5IET2OMBIJ2RDLZJPZ4QTY3EFHSRVLAI3OX";
var FOURSQUARE_CLIENT_SECRET = "QWK54ZSA402ONOJBOMXQ3KOJ1L03SUKOFYNN4T1URCJU12JC";

var port = process.env.PORT || 5000;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/hell'
var callbackURL = process.env.REDIRECT_URL || "http://localhost:5000/redirect/";

// Passport
///////////

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new FoursquareStrategy({
    clientID: FOURSQUARE_CLIENT_ID,
    clientSecret: FOURSQUARE_CLIENT_SECRET,
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Foursquare profile is returned
      // to represent the logged-in user.  In a typical application, you would
      // want to associate the Foursquare account with a user record in your
      // database, and return that user instead.
      return done(null, accessToken);
    });
  }
));



// App
///////////

var app = express();

app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');

  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({secret: "s4cr3t4g3nt"}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  app.engine('.html', require('ejs').__express);

});


// DB
/////

var client = new pg.Client(connectionString);
client.connect();


// Routes
/////////

app.get('/', function(req, res){
  console.log(req)
  res.render('index');
});

app.get('/privacy', function(request, response) {
  response.render('privacy');
});

app.get('/about', function(request, response) {
  response.render('about');
});

app.get('/friends', ensureAuthenticated, function(req, response) {
  response.render('friends', { 'access_token' : req.user});
});

app.get('/status', function(request, response) {
  response.send("Everything appears nominal.");
});

app.get('/map', function(request, response) {
  response.render('map');
});

// Data
///////

app.get('/json',function(req, res) {
console.log('wat');
  client.query(
    "SELECT mod_time, location_lat, location_lng FROM people ORDER BY mod_time DESC LIMIT 10;",
    function selectCb(err, results, fields){
      if(err) { throw err; }
    
      var json = JSON.stringify(results.rows);
      res.writeHead(200, {'content-type':'application/json', 'content-length':json.length}); 
      res.end(json);
    }
  );   

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

// Auth
///////

app.get('/auth',
  passport.authorize('foursquare'),
  function(req, res){
    // The request will be redirected to Foursquare for authentication, so this
    // function will not be called.
  });

app.get('/redirect', 
  passport.authenticate('foursquare', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/friends/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth')
}

// Listener
///////////

app.listen(port, function() {
  console.log("Listening on " + port);
});

