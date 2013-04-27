var conf = require('./conf'),
    db = require('./db'),
    mailbox = require('./mailbox'),
    mongoose = require('mongoose'),
    zmq = require('zmq'),
    sock = zmq.socket('pull'),
    redis = require('redis'),
    client = redis.createClient();

var processing = [];

db.conn.once('open', function(){
  sock.connect(conf.zmq.addr);
  console.log("emailgogo worker connected to", conf.zmq.addr);
  sock.on('message', function(msg){
    var userId = msg.toString();
    mailbox.listen(userId);
    client.sadd('emailgogo:processing', userId);
    processing.push(userId);
    console.log("Processing ", userId);
  });
});

process.on('SIGINT', function() {
  sock.close();
  processing.forEach(function(userId){
    client.srem('emailgogo:processing', userId);
    console.log("Stopped processing", userId);
  });
  process.exit(0);
});
