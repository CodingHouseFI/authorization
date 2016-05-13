'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var jwt = require('jsonwebtoken');

var JWT_SECRET = process.env.JWT_SECRET;

var userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false }
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
        savedUser.password = null;
        cb(err, savedUser);
      });
    });
  });
};

// user.generateToken()

userSchema.methods.generateToken = function() {
  var payload = {
    _id: this._id,
    exp: moment().add(1, 'day').unix()
  };
  
  return jwt.sign(payload, JWT_SECRET);
};


// // route
// User.register(req.body, (err, user) => {

// });




var User = mongoose.model('User', userSchema);

module.exports = User;
