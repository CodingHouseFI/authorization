var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/secret', User.isLoggedIn, (req, res) => {
  console.log('req.user:', req.user);
  res.send('SECRET STUFF\n');
});

router.get('/admin', User.isLoggedIn, User.isAdmin, (req, res) => {
  console.log('req.user:', req.user);
  res.send('ADMIN STUFF\n'); 
});

module.exports = router;
