'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', (req, res) => {
  User.find({}, (err, users) => {
    res.status(err ? 400 : 200).send(err || users);
  });
});

router.post('/register', (req, res) => {
  User.register(req.body, (err, user) => {
    res.status(err ? 400 : 200).send(err || user);
  });
});

router.post('/authenticate', (req, res) => {
  User.authenticate(req.body, (err, token) => {
    if(err) {
      res.status(400).send(err);
    } else {
      res.cookie('accessToken', token).send();
    }
  });
});

router.delete('/logout', (req, res) => {
  res.clearCookie('accessToken').send();
});


router.get('/verify/:token', (req, res) => {

  console.log('token:', req.params.token);

  res.send('OK!');

  // verify the token
  // get the user id from the payload
  // verify that user


});


module.exports = router;
