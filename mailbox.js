var conf = require('./conf'),
    db = require('./db'),
    inspect = require('util').inspect,
    async = require('async'),
    Imap = require('imap'),
    xoauth2 = require('xoauth2'),
    request = require('superagent');

exports.listen = function(userId) {
  async.waterfall([
    function(cb){
      db.User.findById(userId, function(err, user){
        if (err) throw err;
        cb(null, user);
      });
    },
    function(user, cb){
      var xoauth2Gen = xoauth2.createXOAuth2Generator({
        user: user.email,
        clientId: conf.google.clientId,
        clientSecret: conf.google.clientSecret,
        refreshToken: user.refreshToken
      });
      xoauth2Gen.getToken(function(err, token){
        if (err) throw err;
        boxListen('INBOX', user, token, {
          mail: function(imap, mailbox, numNewMsgs){
            imap.seq.fetch(mailbox.messages.total + ':*', {struct: false},
            {
              headers: ['from', 'subject'],
              body: true,
              cb: function(fetch) {
                fetch.on('message', function(msg) {
                  var body = '', head = '';
                  // Get headers
                  msg.on('headers', function(headers) {
                    head += 'Subject: ' + headers.subject[0].trim() + '\n';
                    head += 'From: ' + headers.from[0].trim() + '\n';
                  });
                  // Get body
                  msg.on('data', function(chunk) {
                    body += chunk.toString('utf8');
                  });
                  // Send SMS using Firefly
                  msg.on('end', function() {
                    var message = (head + getPlainText(body)).trim();
                    request
                      .get('https://fireflyapi.com/api/sms')
                      .query({
                        api: conf.firefly.apiKey,
                        number: '09175246984',
                        message: message
                      })
                      .end(function(res) {
                        console.log(res.body);
                      });
                  });
                });
              }
            });
          },
          deleted: function(imap, mailbox, seqno){
            console.log('DELETED  MESSAGE: ' + seqno);
          }
        });
      });
    }
  ]);
};

function getPlainText(body) {
  var boundary = body.split('\n')[0],
      foundPlainText = false;
  body.split(boundary).forEach(function(part) {
    if (foundPlainText) return;
    part = part.trim();
    var contentTypeHeader = part.split('\n')[0];
    if (contentTypeHeader.indexOf('text/plain') >= 0) {
      body = part.replace(contentTypeHeader, '');
      foundPlainText = true;
    }
  });
  return body.trim();
}

function boxListen(mailboxName, user, token, callbacks){
  function log(s){
    console.log('[' + user.email + '] ' + s);
  }
  async.waterfall([
    function(cb){
      var imap = new Imap({
        user: user.email,
        xoauth2: token,
        host: 'imap.gmail.com',
        port: 993,
        secure: true
      });
      imap.connect(function(err) {
        if (err) throw err;
        cb(null, imap);
      });
    },
    function(imap, cb){
      log('Connected');
      imap.openBox('INBOX', true, function(err, mailbox){
        log('Opened ' + mailbox.name);
        cb(null, imap, mailbox);
      });
    },
    function(imap, mailbox, cb){
      log('Listening to events...');
      imap.on('mail', function(numNewMsgs){
        return callbacks.mail(imap, mailbox, numNewMsgs);
      });
      imap.on('deleted', function(seqno){
        return callbacks.deleted(imap, mailbox, seqno);
      });
    }
  ]);
}
