
var express = require('express'),
    conf = require('./conf'),
    db = require('./db'),
    routes = require('./routes'),
    admin = require('./routes/admin'),
    auth = require('./routes/auth'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    zmq = require('zmq'),
    sock = zmq.socket('push');

// Setup pasport

passport.serializeUser(function(user, done){
  done(null, {googleId: user.googleId});
});

passport.deserializeUser(function(obj, done){
  db.User.findOne({googleId: obj.googleId}, function(err, user){
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: conf.google.clientId,
  clientSecret: conf.google.clientSecret,
  callbackURL: conf.google.callbackUrl
}, function(accessToken, refreshToken, profile, done){
  db.User.findOneAndUpdate({
    googleId: profile.id
  }, {
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
    refreshToken: refreshToken
  }, {
    upsert: true
  }, function(err, user){
    return done(err, user);
  });
}));

// 0MQ

sock.bindSync(conf.zmq.addr);
console.log("emailgogo producer connected to ", conf.zmq.addr);
function useSock(req, res, next){
  req.sock = sock;
  next();
}

// App

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express['static'](path.join(__dirname, 'public')));
  app.use(express.session({secret: conf.session.secret}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function(){
  // mongoose.set('debug', true);
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.post('/', routes.updateUser);
app.all('*', useSock);

app.get('/admin', admin.index);
app.all('/admin/users/:uid/*', admin.loadUser);
app.get('/admin/users/:uid/process', admin.process);
app.get('/admin/users/:uid/remove', admin.removeUser);

app.get('/auth/google', auth.google);
app.get('/auth/google/callback', auth.googleCallback);
app.get('/auth/logout', auth.logout);

// Run server

http.createServer(app).listen(app.get('port'), function(){
  console.log("emailgogo web app listening on port " + app.get('port'));
});
