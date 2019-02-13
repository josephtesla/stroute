const nodemailer = require('nodemailer')

const credentials = {
  user: 'twoexpress247@gmail.com',
  pass: process.env.G_PASS
}

const sendEmailMessage = (to, subject, body) => {
  console.log(credentials);
  const mailTransport = nodemailer.createTransport({
    service:'Gmail',
    auth: {
      user: credentials.user,
      pass: credentials.pass
    }
  });
  const from = credentials.user;
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