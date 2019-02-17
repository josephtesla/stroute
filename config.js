const mongoose = require('mongoose');

const Config = (nodeEnv) => {
  if (nodeEnv === 'development'){
    mongoose.connect('mongodb://localhost/passportapp', {
      useNewUrlParser: true
    }).then(resp => {
      console.log('database set!')
    })
  }
  else if(nodeEnv === 'production'){
    mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true
    }).then(resp => {
      console.log('database set!')
    }).catch(error => {
      console.log(error)
    })
  }
  else{
    throw new Error(`no environment configurations for '${nodeEnv}'`);
  }
}

module.exports = Config;
