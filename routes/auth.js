var conf = require('../conf'),
    passport = require('passport');

exports.google = passport.authenticate('google', {
  accessType: 'offline',
  approvalPrompt: 'force',
  scope: conf.google.scope
});

exports.googleCallback = [
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res){
    res.redirect('/');
  }
];

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};
