var db = require('../db'),
    async = require('async');

exports.index = function(req, res){
  async.waterfall([
    function(cb){
      db.User.find({}, function(err, users){
        cb(null, users);
      });
    },
    function(users, cb){
      res.render('admin', {
        title: 'emailgogo / Admin',
        users: users
      });
      cb(null);
    }
  ]);
};

exports.loadUser = function(req, res, next){
  db.User.findById(req.params.uid, function(err, user){
    if (err) {
      next(err);
    } else if (user) {
      req.currUser = user;
      next();
    } else {
      next(new Error('Failed to load user'));
    }
  });
};

exports.makeActive = function(req, res){
  req.currUser.update({active: true}, function(err){
    if (err) throw err;
    req.sock.send(String(req.currUser.id));
    res.redirect('/admin');
  });
};

exports.removeUser = function(req, res){
  req.currUser.remove(function(err){
    if (err) throw err;
    res.redirect('/admin');
  });
};
