'use strict';

require('dotenv').load();

var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);

sendgrid.send({
  to: 'c@codinghouse.co',
  from: 'coolapp@thefuture.com',
  subject: 'SENDGRID TEST',
  html:`
  <h1>HEY</h1>
  <h3>HEY</h3>
  <a href='http://google.com'>Google</a>
  `
}, (err, result) => {
  console.log('err:', err);
  console.log('result:', result);
})


