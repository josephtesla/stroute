const express = require('express');
const router = express.Router()
const path = require('path')
const User = require('../Models/User');
const Notification = require('../Models/Notification');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sendEmailMessage = require('./email');


router.use(express.static(path.join('public')));

router.use('/uploads', express.static('uploads'));

//generate random string to use with images
const getRandomString = () => {
  return (Math.floor(Math.random() * 99999)).toString();
}

//storage strategy for multer upload
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    callback(null, getRandomString() + file.originalname)
  }
})


const upload = multer({
  storage: storage
})

//register -GET
router.get('/register', function (req, res) {
  req.logout();
  res.render('register');
})

const hisOrHer = (gender) => {
  if (gender == 'Male') {
    return "his";
  }
  return "her";
}

//REGISTER - POST (handling register form)
router.post('/register', function (req, res) {
  //get form input
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const gender = req.body.gender;

  //Validation with express-validator
  req.checkBody('name', 'Name field cant be empty!').notEmpty();
  req.checkBody('email', 'Email field cant be empty!').notEmpty();
  req.checkBody('username', 'Username field cant be empty!').notEmpty();
  req.checkBody('email', 'Enter a valid email address!').isEmail();
  req.checkBody('password', 'password field cant be empty!').notEmpty();
  req.checkBody('password2', 'passwords do not match!').equals(password);
  req.checkBody('gender', 'gender field cant be empty!').notEmpty();

  //errors
  const errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors: errors,
      name: trim(name),
      email: email,
      username: trim(username),
      password: password,
      password2: password2,
      gender: gender
    })
  }
  else {

    User.findOne({ username: req.body.username })
      .then(founduser => {
        if (!founduser) {
          const newUser = {
            name: name,
            email: email,
            username: username,
            password: password,
            friends: [],
            image: "",
            address: "",
            gender: gender
          }
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
              newUser.password = hash;

              User.create(newUser, function (error, docs) {
                if (error) {
                  console.log(error);
                }
                else {
                  Notification.create({
                    userId: docs._id,
                    message: `Welcome ${newUser.name}, get started by adding new friends...`,
                    link: `addfriend`,
                    date: new Date().toISOString(),
                    time: new Date().getTime()
                  }).then(resp => {
                    Notification.create({
                      userId: docs._id,
                      message: `${newUser.name}, update your address & profile pics so friends can recognize you`,
                      link: `users/${newUser.username}`,
                      date: new Date().toISOString(),
                      time: new Date().getTime()
                    }).then(resp => {
                      //success-message
                      req.flash('success', 'Successfully Registered, you can now Login');
                      //redirect
                      res.location('/users/login');
                      res.redirect('/users/login')
                    });
                  });
                }
              });
            });
          });
        }
        else {
          res.render('register', {
            nameerror: "username already exists"
          })
        }
      })
  }

})

//login - GET
router.get('/login', function (req, res) {
  req.logout()
  res.render('login');
})

//----User---Login----
passport.serializeUser((user, done) => {
  return done(null, user.id)
})
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    return done(null, user)
  })
})



passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "invalid username" })
      }
      else {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return done(err)
          }
          if (isMatch) {
            return done(null, user)
          }
          else {
            return done(null, false, { message: "invalid password" })
          }
        })
      }
    })
  }
))



router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password',
  }))

router.get('/resetpassword', (req, res) => {
  res.render('forgot');
})

router.post('/resetpassword', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  User.findOne({ username: username, email: email })
    .then(user => {
      if (user) {
        const emailBody = `<h1>Password reset for your account</h1>\n<p>you requested to change your current password</p>
      follow the link below to reset your password\n<h4><a href='http://twoexpress.herokuapp.com/user/reset/543k2joi2hj2k2kjk2f'>
      http://twoexpress.herokuapp.com/user/reset/543k2joi2hj2k2kjk2f</a></h4>`;

        sendEmailMessage(email, 'TwoExpress - Password Reset confirmation', emailBody);
        if (req.body.password === req.body.cpassword) {
          bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(req.body.password, salt)
              .then(hash => {
                User.updateOne({ username: username }, { $set: { password: hash } })
                  .then(resp => {
                    req.flash('success', 'password successfully changed, Login with new password');
                    res.redirect('/users/login');
                  })
              })
          })
        }
        else {
          res.render('forgot', {
            errormsg: 'passwords do not match',
            username: req.body.username,
            email: req.body.email,
            passport: req.body.password
          })
        }
      }
      else {
        res.render('forgot', {
          errormsg: 'User details could not be found',
          username: req.body.username,
          email: req.body.email,
          passport: req.body.password
        })
      }
    })
})

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You Have Logged Out');
  res.redirect('/users/login');
})


router.get('/:username', ensureAuthenticated, (req, res) => {
  User.findOne({ username: req.params.username })
    .then(user => {
      if (user) {
        res.render('profile', {
          name: user.name,
          username: user.username,
          email: user.email,
          address: user.address,
          gender: user.gender,
          image: user.image,
          status: user.status
        })
      }
      else {
        res.location('/');
        res.redirect('/');
      }
    })
})



router.post('/:username/edit', ensureAuthenticated, upload.single('profilepics'), (req, res) => {
  const username = req.params.username;
  const updates = {
    name: req.body.editname,
    email: req.body.editemail,
    gender: req.body.editgender,
    address: req.body.editaddress,
    status: req.body.editstatus,
  }
  if (req.file) {
    updates.image = req.file.path
  }

  User.updateOne({ username: username }, { $set: updates })
    .then(success => {
      if (updates.image) {
        User.findOne({ username: username })
          .then(resp => {
            if (resp.friends.length) {
              resp.friends.forEach(friend => {
                User.findOne({ username: friend.username })
                  .then(user => {
                    Notification.create({
                      userId: user._id,
                      message: `${req.user.name} (@${username})	updated ${hisOrHer(req.user.gender)} profile picture.`,
                      link: `users/${username}`,
                      date: new Date().toISOString(),
                      time: new Date().getTime()
                    })
                    Notification.create({
                      userId: user._id,
                      message: `${req.user.name} (@${username})	updated ${hisOrHer(req.user.gender)} Status.`,
                      link: `users/${username}`,
                      date: new Date().toISOString(),
                      time: new Date().getTime()
                    })
                  })
              })
            }
          })
      }
      req.flash('success', 'profile	successfully updated')
      res.location(`/users/${req.params.username}`);
      res.redirect(`/users/${req.params.username}`);
    })
})


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.location('/users/login');
  res.redirect('/users/login');
}


module.exports = router;