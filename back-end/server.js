var express = require('express');
var app = express();
var router = require('./config/routes.js');

// from tutorial
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

//CORS setup to allow other ports from this host

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// app.use(router);

///// FROM TUTORIAL ////////////////////////////////////////
// require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
  app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'pandaexpressishorrible'} )); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persisten login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
router(app, passport); // load our routes and pass in our app and fully configured passport
////////////////////////////////////////////////////////////

let port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});