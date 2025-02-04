const express = require('express');
const router = express.Router()
const path = require('path')
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Notification = require('../Models/Notification');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sendEmailMessage = require('./email');
const { upload } = require('./cloudConfig');
const { checkRememberMe } = require('./utils');


router.use(express.static(path.join('public')));

router.use('/uploads', express.static('uploads'));

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
      name: name.trim(),
      email: email.trim(),
      username: username.trim(),
      password: password,
      password2: password2,
      gender: gender
    })
  }
  else {

    User.findOne({ username: req.body.username })
      .then(founduser => {
        if (!founduser) {
          User.findOne({email: req.body.email})
          .then(emailexists => {
            if (!emailexists){
              if (req.body.password.toString().length < 8){
                res.render('register', {
                  nameerror: "Enter at least 8 characters for password"
                })
              }
              else{
              const newUser = {
                name: name.trim(),
                email: email.trim(),
                username: username.trim(),
                password: password.trim(),
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
                          docs.notifications += 2;
                          docs.save();
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
            }
            else{
              res.render('register', {
                nameerror: "user with email already exists"
              })
            }
          })
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
router.get('/login', checkRememberMe,  (req, res) => {
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
    User.findOne({ username: username.trim() }, (err, user) => {
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
    failureRedirect: '/users/login',
    failureFlash: 'Invalid username or password',
  }), (req, res, next) => {
    const rememberMe = Boolean(req.body.rememberMe);
    if (rememberMe){
      res.cookie('rememberId', req.user._id, { maxAge: 365 * 24 * 60 * 60 * 1000});
      // Cookie expires after 1 year
    } 
    res.redirect('/loadinguser');
})

router.get('/resetpassword', (req, res) => {
  res.render('forgot',{
    emailpage: true
  });
})

router.post('/resetpassword', (req, res) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        const token = jwt.sign({id : user._id}, process.env.SECRETKEY, { expiresIn: 86400 });
        const emailBody = `<h1>Password reset for your account</h1>\n<p>you are seeing this email because you
      (or someone else) requested to change your current password on our app</p>
      follow the link below to reset your password\n<h4><a href='http://stroutechat.herokuapp.com/users/resetpasswordpage?token=${token}'>
      http://stroutechat.herokuapp.com/users/resetpasswordpage/token=${token}</a></h4>`;
     sendEmailMessage(email, 'Stroute - Password Reset confirmation', emailBody)
     .then(resp => {
      res.render('forgot',{
        passwordsent: true,
        email: req.body.email
      })
     }).catch(error => {
       res.render('forgot',{
         emailpage:true,
         email: req.body.email,
         errormsg: `error occurred why trying to send mail. this might be due to incorrect email or your email settings`
       })
     });
    }
      else {
        res.render('forgot', {
          emailpage:true,
          errormsg: 'Invalid email address',
          email: req.body.email
        })
      }
    })
})

router.get('/resetpasswordpage', (req, res) => {
  if (!req.query.token){
    res.redirect('/');
  }
  else{
    const token = req.query.token;
    jwt.verify(token, process.env.SECRETKEY, (error, user) => {
      if (error){
        res.location('/');
        res.redirect('/');
      }
      res.render('forgot',{
        authTrue: true,
        userid: user.id
      })
    })
  }
})

router.post('/reset/final',(req,res)  =>  {
  const userid = req.body.userid;
  if (req.body.password !== req.body.cpassword) {
    res.render('forgot', {
      authTrue:true,
      errormsg: 'passwords do not match',
      password: req.body.password,
      cpassword: req.body.cpassword
    })
  }
  else if (req.body.password.toString().trim().length < 8){
    res.render('forgot', {
      authTrue:true,
      errormsg: 'Enter at least 8 characters',
      password: req.body.password,
      cpassword: req.body.cpassword
    })
  }
  else {
    bcrypt.genSalt(10).then(salt => {
      bcrypt.hash(req.body.password, salt)
        .then(hash => {
          User.updateOne({ _id: userid }, { $set: { password: hash } })
            .then(resp => {
              req.flash('success', 'password successfully changed, Login with new password');
              res.redirect('/users/login');
            })
        })
    })
  }
})

router.get('/logout', function (req, res) {
  req.logout();
  res.clearCookie('rememberId');
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
    updates.image = req.file.url
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
                    }).then(()  =>  {
                      user.notifications += 1;
                      user.save()
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
