var db = require('../db'),
    async = require('async');

exports.index = function(req, res){
  var user = req.user;
  res.render('index', {
    title: 'emailgogo',
    user: user
  });
};
