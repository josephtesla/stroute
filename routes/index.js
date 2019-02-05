const express = require('express');
const router = express.Router()
const multer = require('multer');
const Message = require('../Models/Message')
const User = require('../Models/User')
const Notification = require('../Models/Notification')
const app = require('../app');
const server = require('http').createServer(router)
const io = require('socket.io').listen(server);

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
  
  function swapNames(string) {
    const splitArr = string.split(" ");
    const final = `${splitArr[1]} ${splitArr[0]}`
    return final
  }
	Message.find({})
  .sort({datesecs: -1})
  .then(messages => {
    let userMessages = [];
    let users = []
    messages.forEach((message) => {
      if (message.sender === req.user.username || message.receiver === req.user.username){
        if (!users.includes(message.sillyId) && !users.includes(swapNames(message.sillyId))){
          userMessages.push(message)
          users.push(message.sillyId)
        }
      }
    })
    res.render('recents', {
      messages: userMessages
    })
  })

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

router.post('/search', ensureAuthenticated, (req, res) => {
  const friend = req.body.friendname;
	User.find({ $text: { $search: friend } })
		.then(users => {
      const searchResults = [];
      User.findOne({ username: req.user.username })
      .then(loggedInUser => {
        const friendNames = [];
        loggedInUser.friends.forEach(index => {
          friendNames.push(index.username);
        })
        users.forEach(user => {
          if ( user.username != req.user.username){
              searchResults.push(user);
            }
          })
          res.render('search', {
            user: req.user,
            searchResults: searchResults
          });
      })
    })
})

router.get('/addfriend/:user', ensureAuthenticated, (req, res) => {
	User.findOne({ username: req.params.user })
		.then(friend => {
      if (friend === null){
        res.location('/addfriend');
        res.redirect('/addfriend');
      }
      else{
        const newFriend = {
          name: friend.name,
          username: friend.username
        }
        User.findOne({ username: req.user.username })
          .then(user => {
            (user.friends.includes(newFriend))
            user.friends.forEach(userFriend => {
              if (userFriend.username === newFriend.username){
                req.flash('success', 'you are already friends')
                res.location('/addfriend');
                res.redirect('/addfriend');
              }
            })
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
              
              //send notification
              Notification.create({
                userId: friend._id,
                message: `${req.user.name} (@${req.user.username}) added you as friends.`,
                link:`users/${req.user.username}`,
                date: new Date().toISOString(),
                time:new Date().getTime()
              }).then(resp => {
                req.flash('success', `${newFriend.name} successfully added to your friend list`)
                res.location('/addfriend');
                res.redirect('/addfriend');
              })
            
          })
      }
		})

})



router.get('/friendlist', ensureAuthenticated,	(req, res) => {
	const userId = req.user.id;
	User.findById(userId)
		.then(user => {
			res.render('index', {
				friendlist: user.friends
			})
		})
})

router.get('/notifications', ensureAuthenticated, (req, res) => {
	const timeSince = (since) => {
		since = since/1000;
		var chunks = [
				[60 * 60 * 24 * 365, 'year'],
				[60 * 60 * 24 * 30, 'month'],
				[60 * 60 * 24 * 7, 'week'],
				[60 * 60 * 24 , 'day'],
				[60 * 60, 'hour'],
				[60, 'min'],
				[1,'second']
		];
		
		for (var i = 0,j = chunks.length; i < j; i++){
				var seconds = chunks[i][0];
				var name = chunks[i][1];
				var count = Math.floor(since/seconds);
				if (count  != 0){
						break;
				}
		}
		var time = [];
		name = (count == 1)?name:`${name}s`;
		time.push(count);
		time.push(name);
		var newTime = `${time[0]} ${time[1]} ago`;
		return newTime;
 }
 
	Notification.find({userId:req.user.id})
	.sort({date: -1})
	.limit(15)
	.then(notifications => {
		res.render('notify', {
			notifications: notifications,
			timeSince: timeSince
		})
	})
	
})


//chats with a particular user
router.get('/:id', ensureAuthenticated, (req, res) => {
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



function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.location('/users/login');
	res.redirect('/users/login');
}



module.exports = router;
