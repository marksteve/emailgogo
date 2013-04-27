module.exports = {
  db: {
    uri: 'mongodb://localhost/emailgogo'
  },
  session: {
    secret: '98d7s89dsahknsdkjalkdha89jk'
  },
  google: {
    clientId: '706695231444.apps.googleusercontent.com',
    clientSecret: 'lsvC7G4Mul4zcvCVgZSL4zJD',
    callbackUrl: 'http://localhost:3000/auth/google/callback',
    scope: [
      // Google profile
      'https://www.googleapis.com/auth/userinfo.profile',
      // Email address
      'https://www.googleapis.com/auth/userinfo.email',
      // Gmail
      'https://mail.google.com/'
    ]
  },
  zmq: {
    addr: 'tcp://127.0.0.1:5000'
  }
};
