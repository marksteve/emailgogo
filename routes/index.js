var db = require('../db'),
    async = require('async'),
    inspect = require('util').inspect;

exports.index = function(req, res){
  var user = req.user,
      filters = [];
  if (user && user.filters) {
    filters = JSON.parse(user.filters);
  }
  res.render('index', {
    title: 'emailgogo',
    user: user,
    filters: filters
  });
};

exports.updateUser = function(req, res){
  var user = req.user;
  user.number = req.body.number;
  console.log(req.body.filters);
  user.filters = req.body.filters;
  user.save(function(err) {
    // FIXME: Error handling
  });
  res.redirect('/');
};
