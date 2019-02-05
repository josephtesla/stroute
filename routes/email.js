const nodemailer = require('nodemailer')
const xoauth2 = require('xoauth2');

const credentials = {
  user: 'godwinjoseph693@gmail.com',
  pass: process.env.EMAIL_PASSWORD
}

const sendEmailMessage = (to, subject, body) => {
  const mailTransport = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: credentials.user,
      pass: credentials.pass
    }
  });
  const from = `${credentials.user}`;
  mailTransport.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: body,
    generateTextFromHtml: true
  }, (error, info) => {
    if (error) console.error(`Unable to send requested email message: ${error}`);
    else{
      console.log('Email message successfully sent:', info);
    }
  })
}

module.exports = sendEmailMessage;