const mongoose = require('mongoose');

const connect = (nodeEnv) => {
  if (nodeEnv === 'development'){
    mongoose.connect('mongodb://localhost/passportapp', {
      useNewUrlParser: true
    })
    .then(resp => {
      console.log('database set!')
    })
  }
  else if(nodeEnv === 'production'){
    mongoose.connect('mongodb://josephtesla:tesla98@ds151614.mlab.com:51614/passportapp', {
      useNewUrlParser: true
    })
    .then(resp => {
      console.log('database set!')
    }).catch(error => {
      console.log(error)
    })
  }
}

module.exports = connect;