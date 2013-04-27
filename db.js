var conf = require('./conf'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var conn = exports.conn = mongoose.connection;

conn.once('open', function callback(){

  exports.User = mongoose.model('User', mongoose.Schema({
    name: String,
    email: String,
    googleId: String,
    refreshToken: String,
    active: {'type': Boolean, 'default': false}
  }));

});

mongoose.connect(conf.db.uri);