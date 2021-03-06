'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var jwt = require('jsonwebtoken');

var Mail = require('../config/mail');

var JWT_SECRET = process.env.JWT_SECRET;

var userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }

});

/// Model methods
// User.register  -  create a new user, hash their password
// User.authenticate  -  log in a user, and give them a token

/// Middleware
// User.isLoggedIn  -  verify user is authenticated
// User.isAdmin   -  verify user is admin  

/// Instance methods
// user.generateToken  -  generate a JWT token
// user.makeAdmin

userSchema.statics.auth = roleRequired => {
  return (req, res, next) => {
    var token = req.cookies.accessToken;

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if(err) return res.status(401).send({error: 'Authentication required.'});

      User.findById(payload._id, (err, user) => {
        if(err || !user) return res.status(401).send({error: 'User not found.'});
        req.user = user;

        if(roleRequired === 'admin' && !req.user.admin) {
          // they don't have admin privilages
          return res.status(403).send({error: 'Not authorized.'});
        }
        
        next(); // they have the required privilages
      }).select('-password');
    });
  };
};


// userSchema.statics.isLoggedIn = (req, res, next) => {
//   var token = req.cookies.accessToken;

//   jwt.verify(token, JWT_SECRET, (err, payload) => {
//     if(err) return res.status(401).send({error: 'Authentication required.'});

//     User.findById(payload._id, (err, user) => {
//       if(err || !user) return res.status(401).send({error: 'User not found.'});

//       req.user = user;
//       next();

//     }).select('-password');
//   });
// };

// userSchema.statics.isAdmin = (req, res, next) => {
//   if(!req.user.admin) {
//     return res.status(403).send({error: 'Not authorized.'});
//   }
//   next();
// };

userSchema.statics.register = (userObj, cb) => {
  User.findOne({email: userObj.email}, (err, dbUser) => {
    if(err || dbUser) return cb(err || {error: 'Email not available.'});

    bcrypt.hash(userObj.password, 12, (err, hash) => {
      if(err) return cb(err);

      var user = new User({
        email: userObj.email,
        password: hash
      });

      user.save((err, savedUser) => {
        if(err) return cb(err);

        Mail.sendVerify(savedUser, err => {
          savedUser.password = null;
          cb(err, savedUser);
        });
      });
    });
  });
};

userSchema.statics.authenticate = (userObj, cb) => {
  User.findOne({email: userObj.email}, (err, dbUser) => {
    if(err || !dbUser) return cb(err || { error: 'Authentication failed.  Invalid email or password.' });

    bcrypt.compare(userObj.password, dbUser.password, (err, isGood) => {
      if(err || !isGood) return cb(err || { error: 'Authentication failed.  Invalid email or password.' });

      var token = dbUser.generateToken();

      cb(null, token);
    });
  });
};

userSchema.methods.generateToken = function() {
  var payload = {
    _id: this._id,
    exp: moment().add(1, 'day').unix()
  };

  return jwt.sign(payload, JWT_SECRET);
};

userSchema.methods.makeVerifyLink = function() {
  var payload = {
    _id: this._id,
    exp: moment().add(1, 'week').unix()
  };

  var token = jwt.sign(payload, JWT_SECRET);

  return `http://localhost:3000/api/users/verify/${token}`;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
