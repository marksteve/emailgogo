var conf = require('./conf'),
    db = require('./db'),
    mailbox = require('./mailbox'),
    mongoose = require('mongoose'),
    zmq = require('zmq'),
    sock = zmq.socket('pull'),
    redis = require('redis'),
    client = redis.createClient();

var processing = [],
    procSetKey = 'emailgogo:processing';

db.conn.once('open', function(){
  sock.connect(conf.zmq.addr);
  // Clear processing queue
  client.del(procSetKey);
  console.log("emailgogo worker connected to", conf.zmq.addr);
  sock.on('message', function(msg){
    var userId = msg.toString();
    client.sismember(procSetKey, userId, function(err, rep) {
      if (!rep) {
        console.log("Processing ", userId);
        client.sadd(procSetKey, userId);
        processing.push(userId);
        mailbox.listen(userId);
      }
    });
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
