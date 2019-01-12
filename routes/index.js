const express = require('express');
const router = express.Router()
const multer = require('multer');
const Message = require('../Models/Message')
const User = require('../Models/User')

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

router.post('/image/:received', upload.single('image'), (req, res) => {
	const image = {
		msg: req.file.path,
		type: "image"
	}
	const newMessage = {
		sillyId: `${req.user.username} ${req.params.received}`,
		message: image,
		sender: req.user.username,
		receiver: req.params.received,
		date: new Date().toLocaleString()
	}
	Message.create(newMessage)
		.then(success => {
			console.log(success)
		}).catch(err => {
			console.log(err.message)
		})
	res.redirect(`/${req.params.received}`);
})

router.post('/mpsome/:received', upload.single('mpsome'), (req, res) => {
	const mpsome = {
		msg: req.file.path,
		type: req.body.mpsome
	}
	const newMessage = {
		sillyId: `${req.user.username} ${req.params.received}`,
		message: mpsome,
		sender: req.user.username,
		receiver: req.params.received,
		date: new Date().toLocaleString()
	}
	Message.create(newMessage)
		.then(success => {
			console.log(success)
		}).catch(err => {
			console.log(err.message)
		})
	res.redirect(`/${req.params.received}`);
})

router.get('/', ensureAuthenticated, (req, res) => {
	res.render('index');

})

router.get('/addfriend/', ensureAuthenticated, (req, res) => {
	User.find({})
	.then(users => {
		const suggestions = [];
		User.findOne({ username: req.user.username })
		.then(loggedInUser => {
			const friendNames = [];
			loggedInUser.friends.forEach(index => {
				friendNames.push(index.username);
			})
			users.forEach(user => {
				if (!friendNames.includes(user.username) && user.username != req.user.username){
						suggestions.push(user);
					}
				})
				res.render('index', {
					users: suggestions
				});
			})
		})
})

router.get('/addfriend/:user', ensureAuthenticated, (req, res) => {
	User.findOne({ username: req.params.user })
		.then(friend => {
			const newFriend = {
				name: friend.name,
				username: friend.username
			}
			User.findOne({ username: req.user.username })
				.then(user => {
					if (user.friends.includes(newFriend)) {
						req.flash('success', 'you are already friends')
						res.location('/addfriend');
						res.redirect('/addfriend');
					}
					user.friends.push(newFriend)
					user.save();
					User.findOne({ username: newFriend.username })
						.then(user => {
							const added = {
								name: req.user.name,
								username: req.user.username
							}
							user.friends.push(added);
							user.save();
						})
					req.flash('success', `${newFriend.name} successfully added to your friend list`)
					res.location('/addfriend');
					res.redirect('/addfriend');
				})
		})

})

router.post('/addfriend/search', ensureAuthenticated, (req, res) => {
	const friend = req.body.friendname;
	User.find({ $text: { $search: friend } })
		.then(users => {
			const searchResults = [];
			users.forEach(user => {
				if (!req.user.friends.username.includes(user.username)) {
					searchResults.push(user)
				}
			})
			res.render('index', {
				searchResults: searchResults
			})
		})
})

router.get('/friendlist', (req, res) => {
	const userId = req.user.id;
	User.findById(userId)
		.then(user => {
			res.render('index', {
				friendlist: user.friends
			})
		})

})

//chats with a particular user
router.get('/:id', ensureAuthenticated, function (req, res) {
	User.findById(req.user.id)
	.then(loggedInUser => {
		const friendNames = [];
		loggedInUser.friends.forEach(index => {
			friendNames.push(index.username);
		})
		if (friendNames.includes(req.params.id)){
			Message.find({})
			.then(chats => {
				const privateChats = [];
				chats.forEach(chat => {
					if (chat.sillyId.includes(req.user.username) && chat.sillyId.includes(req.params.id)) {
						privateChats.push(chat)
					}
				})
				res.render('chats', {
					chats: privateChats,
					receiver: req.params.id
				});
			})
		}
		else{
			res.location('/addfriend');
			res.redirect('/addfriend');
		}
		
	})

});

router.get('/chats', ensureAuthenticated, (req, res) => {
	
})

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.location('/users/login');
	res.redirect('/users/login');
}



module.exports = router;