'use strict';

var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);

exports.sendVerify = (user, cb) => {

  var html = `<p>Thanks for signing up for AuthApp!
  Please verify your account by clicking this link:</p>
  <a href="${user.makeVerifyLink()}">Verify</a>`;

  sendgrid.send({
    to: user.email,
    from: 'authapp@whatever.com',
    subject: 'Verify your AuthApp account',
    html: html
  }, cb);

};
