const express = require('express');
const router = express.Router()
const path = require('path')
const User = require('../Models/User')
const multer = require('multer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

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
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2,
			gender:gender
		})
	}
	else {

		const newUser = {

			name: name,
			email: email,
			username: username,
			password: password,
			friends: [],
			image:"",
			address: "",
			gender: gender

		}

		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(newUser.password, salt, function (err, hash) {
				newUser.password = hash;

				User.create(newUser, function (err, docs) {
					if (err) {
						res.send(err);
					}
					else {
						console.log("User added");

						//success-message
						req.flash('success', 'Successfully Registered, you can now Login');

						//redirect
						res.location('/users/login');
						res.redirect('/users/login')
					}
				});
			});
		});
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
      return  done(null, user)
   })
})



passport.use(new LocalStrategy(
   (username ,password, done) => {
      User.findOne({username:username}, (err, user) => {
         if(err){
            return done(err);
         }
         if(!user){
            return done(null,false, { message:"invalid username"})
         }
         else{
            bcrypt.compare(password, user.password, (err, isMatch) => {
               if (err){
                  return done(err)
               }
               if (isMatch){
                  return done(null, user)
               }
               else{
                  return done(null, false, {message:"invalid password"})
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
		failureFlash: 'Invalid username or password'
	}))

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'You Have Logged Out');
	res.redirect('/users/login');
})

router.get('/:username', ensureAuthenticated,  (req, res)	=>	{
	User.findOne({username: req.params.username})
	.then(user => {
		if (user){
			res.render('profile', {
				name:user.name,
				username: user.username,
				email: user.email,
				address: user.address,
				gender:	user.gender,
				image: user.image
			})
		}
		else{
			res.location('/');
			res.redirect('/');
		}
	})
})

router.post('/:username/edit', ensureAuthenticated, upload.single('profilepics'), (req, res)	=>	{
	console.log(req.body)
	const username = req.params.username;
	const updates = {
		name: req.body.editname,
		email: req.body.editemail,
		gender: req.body.editgender,
		address: req.body.editaddress
	}
	if (req.file){
		updates.image = req.file.path
	}

	User.updateOne({username:username}, {$set : updates})
	.then(success => {
		req.flash('success',	'profile	successfully updated')
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