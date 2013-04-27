var db = require('../db'),
    async = require('async');

exports.index = function(req, res){
  var user = req.user;
  res.render('index', {
    title: 'emailgogo',
    user: user
  });
};

exports.updateUser = function(req, res){
  var user = req.user;
  user.number = req.body.number;
  user.save(function(err) {
    // FIXME: Error handling
  });
  res.render('index', {
    title: 'emailgogo',
    user: user
  });
};
