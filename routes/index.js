const express = require('express');
const router = express.Router()
const upload = require('./cloudConfig');
const Message = require('../Models/Message')
const User = require('../Models/User')
const Notification = require('../Models/Notification');
const Request = require('../Models/Request');
const Group = require('../Models/Group')

router.post('/api/saveimageurl', ensureAuthenticated, (req, res) => {
	Message.create({
    sillyId: `${req.user.username} ${req.body.received}`,
    message: {
      msg: req.body.url,
		  type: req.body.type
    },
    sender: req.user.username,
    receiver: req.body.received,
    date: new Date().toLocaleString(),
    datesecs: Date.now(),
    msgtype:"private"
  })
		.then(message => {
      console.log(message)
			res.status(200).json({
        message: 'image sent'
      })
		}).catch(err => {
      console.log(err)
			res.json({error:err.message})
		})

})

router.post('/mpsome/:received', upload.single('mpsome'), (req, res) => {
	const mpsome = {
		msg: req.file.url,
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
      const doNothing = true;
		}).catch(err => {
			console.log(err.message)
		})
	res.redirect(`/chatphase?type=private&user=${req.params.received}#last`);
})

router.get('/', ensureAuthenticated, (req, res) => {

  function swapNames(string) {
    const splitArr = string.split(" ");
    const final = `${splitArr[1]} ${splitArr[0]}`
    return final
  }
  User.findOne({username : req.user.username})
  .then(loggedInUser => {
    Message.find({})
    .sort({datesecs: -1})
    .then(messages => {
      let userMessages = [];
      let privateusers = [];
      let groupmsgs = [];
      messages.forEach((message) => {
        if (message.msgtype === "private"){
          if (message.sender === req.user.username || message.receiver === req.user.username){
            if (!privateusers.includes(message.sillyId) && !privateusers.includes(swapNames(message.sillyId))){
              userMessages.push(message);
              privateusers.push(message.sillyId);
            }
          }
        }
        else if (message.msgtype === "group"){
          if (loggedInUser.groups.indexOf(`${message.receiver}`) !== -1){
            if (!groupmsgs.includes(message.receiver)){
              userMessages.push(message);
              groupmsgs.push(message.receiver);
            }
          }
        }
      })
    res.render('recents', {
      messages: userMessages
    })
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
				if (!friendNames.includes(user.username) && user.username !== req.user.username){
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
            user.friends.forEach(userFriend => {
              if (userFriend.username === newFriend.username){
                req.flash('success', 'you are already friends')
                res.location('/addfriend');
                res.redirect('/addfriend');
              }
            })
            Request.find({})
            .then(requests => {
              var requestExists = false;
              requests.forEach(request => {
                if (request.sender === req.user.username && request.receiver === friend.username){
                  requestExists = true;
                  req.flash('success', 'request already sent!')
                  res.location('/addfriend');
                  res.redirect('/addfriend');
                }
              });
              if (!requestExists){
                Request.create({
                  sender: req.user.username,
                  receiver: friend.username,
                  link: 'request/accept',
                  date: new Date().toISOString(),
                  time: new Date().getTime()
                }).then(resp => {
                    friend.requests += 1;
                    friend.save();
                    req.flash('success', `friend request sent!`)
                    res.location('/addfriend');
                    res.redirect('/addfriend');
                })
              }
            })
        })
      }
		})
})

router.get('/request/accept/:user', ensureAuthenticated, (req, res) => {
	User.findOne({ username: req.params.user })
		.then(friend => {
      if (friend === null){
        console.log(friend)
        res.location('/requests');
        res.redirect('/requests');
      }
      else{
        const newFriend = {
          name: friend.name,
          username: friend.username
        }
        User.findOne({ username: req.user.username })
          .then(user => {
            const userExists = false;
            user.friends.forEach(userFriend => {
              if (userFriend.username === newFriend.username){
                userExists = true;
                res.location('/requests');
                res.redirect('/requests');
              }
            })
            console.log(userExists)
            if (!userExists) {
              user.friends.push(newFriend)
              user.save();
              User.findOne({ username: newFriend.username })
              .then(userFriend => {
                const added = {
                  name: req.user.name,
                  username: req.user.username
                }
                  userFriend.friends.push(added);
                  userFriend.save();
                  Request.deleteOne({sender:newFriend.username, receiver: req.user.username })
                  .then(() => {
                    user.requests -= 1;
                    user.save();
                    Notification.create({
                      userId: friend._id,
                      message: `${req.user.name} (@${req.user.username}) accepted your friend request.`,
                      link:`users/${req.user.username}`,
                      date: new Date().toISOString(),
                      time:new Date().getTime()
                    }).then(resp => {
                      friend.notifications += 1;
                      friend.save();
                      req.flash('success', `${newFriend.name} successfully added to your friend list`)
                      res.location('/requests');
                      res.redirect('/requests');
                    })
                  })
              })
            }
        })
      }
		})

})



router.get('/request/reject/:user', ensureAuthenticated,	(req, res) => {
  Request.find({sender: req.params.user, receiver: req.user.username})
  .then(request => {
    if (!request.length){
      res.location('/requests');
      res.redirect('/requests');
    }
    else{
      Request.deleteOne({_id: request[0]._id})
      .then(resp => {
        User.findById(req.user._id)
        .then(user => {
          user.requests -= 1;
          user.save();
          res.location('/requests');
          res.redirect('/requests');
        })
      })
    }
  })
})

router.get('/requests', ensureAuthenticated,	(req, res) => {
  Request.find({receiver: req.user.username})
  .then(requests => {
    res.render('index', { requests: requests});
  })
})

router.get('/groups', ensureAuthenticated,	(req, res) => {
  if (req.query.admin){
    Group.find({createdBy: req.user.username})
    .then(resp => {
      res.render('groups', {
        groups : resp,
        heading: 'Groups you created'
      })
    })
  }

  else if (req.query.action && req.query.groupid){
    if (req.query.action === 'members'){
      Group.findOne({_id: req.query.groupid}).populate('users').exec()
      .then(group => {
        res.render('groups', {
          members: group.users,
          heading:`${group.name} - members`,
          admin: group.createdBy
        })
      })
    }
    else if (req.query.action === 'manage'){
      Group.findOne({_id: req.query.groupid}).populate('users').exec()
      .then(group => {
        if (group.createdBy === req.user.username){
          res.render('groups', {
            admin: group.createdBy,
            adminsetting: true,
            groupmembers: group.users,
            heading:`${group.name} - Admin panel`,
            groupid: group._id
          })
        }
      })
    }
  }

  else{
    Group.find({}).populate('messages').exec()
    .then(groups => {
      let userGroups = []
      if (groups.length){
        groups.forEach(group => {
        group.users.forEach(user => {
          if (user.toString() === req.user._id.toString()){
            userGroups.push(group);
          }
        })
        })
      }
      res.render('groups',{
        groups: userGroups,
        heading: 'Groups you are in!'
      })
    })
  }
})


router.post('/groups/addmember', ensureAuthenticated,  (req, res) => {
  function userExists(username, groupusers){
    for (let i = 0; i < groupusers.length; i++) {
      if (username === groupusers[i].username){
        return true;
      }
    }
    return false;
  }
  const groupid = req.body.groupid;
  const newuser = req.body.uname.trim();
  User.findOne({username: newuser})
  .then(user => {
    if (user){
      Group.findById(groupid).populate('users').
      then(group => {

        if (userExists(user.username, group.users)){
          req.flash('error', 'user already a member!')
          res.location(`/groups?action=manage&groupid=${groupid}`);
          res.redirect(`/groups?action=manage&groupid=${groupid}`);
        }
        else{
          group.users.push(user);
          group.members += 1;
          group.save();
          user.groups.push(groupid);
          user.save();
          Notification.create({
            userId: user._id,
            message: `You've been added to the group: ${group.name}`,
            link:`chatphase?type=group&user=${groupid}`,
            date: new Date().toISOString(),
            time:new Date().getTime()
          }).then(resp => {
            user.notifications += 1;
            user.save();
            Message.create({
              sillyId: `groupbot ${groupid}`,
              message: {
                  msg: `${user.name} joined the group`,
                  type:"text"
              },
              sender: 'groupbot',
              receiver: groupid,
              date: new Date().toLocaleString(),
              datesecs: Date.now(),
              msgtype:"group",
              groupname: group.name,
              groupid: groupid
            }).then(message => {
              Group.findById(groupid)
              .then(group => {
                group.messages.push(message)
                group.save();
              })
            req.flash('success', `${user.name} (@${user.username}) successfully added to ${group.name}`)
            res.location(`/groups?action=manage&groupid=${groupid}`);
            res.redirect(`/groups?action=manage&groupid=${groupid}`);
          })
          })
        }
      })
    }
    else{
      req.flash('error', 'user does not exist!')
      res.location(`/groups?action=manage&groupid=${groupid}`);
      res.redirect(`/groups?action=manage&groupid=${groupid}`);
    }
  })
})

router.post('/groups/new',  ensureAuthenticated,	(req, res) => {
  const gname = req.body.gname;
  const gdesc = req.body.gdesc;
  Group.create({
    name: gname,
    description: gdesc,
    createdBy: req.user.username,
    date: new Date().toLocaleDateString(),
    datesecs: new Date().getTime()
  }).then(group => {
    group.users.push(req.user);
    group.members += 1;
    group.save();
    User.findOne({username: req.user.username})
    .then(user => {
      user.groups.push(group._id)
      user.save();
    })
    req.flash('success', 'Group successfully created!')
    res.location('/groups')
    res.redirect('/groups');
  })
})

router.get('/deleteuser', ensureAuthenticated,	(req, res) => {
  if (!req.query.userid && !req.query.groupid){
    res.redirect('/');
  }
  else{
    const userid = req.query.userid;
    const groupid = req.query.groupid;
    Group.findById(groupid).populate('users')
    .then(group => {
      const users = group.users.filter(user => {
        return user._id.toString() !== userid.toString();
      })
      Group.updateOne({_id: groupid}, { $set : {users : users, members: group.members-1}})
      .then(resp => {
        User.findById(userid)
        .then(leftuser  => {
          leftuser.groups.splice(leftuser.groups.indexOf(groupid), 1);
          leftuser.save();
          Message.create({
            sillyId: `groupbot ${groupid}`,
            message: {
                msg: `${leftuser.username} left the group`,
                type:"text"
              },
            sender: 'groupbot',
            receiver: groupid,
            date: new Date().toLocaleString(),
            datesecs: Date.now(),
            msgtype:"group",
            groupname: group.name,
            groupid: group._id
          }).then((message) => {
            group.messages.push(message);
            group.save()
            req.flash('success', 'user has been removed!');
            res.location('/groups?admin=2i994y89333ll78aouaw');
            res.redirect('/groups?admin=2i994y89333ll78aouaw');
          })
        })
      })
    })
  }
})

router.get('/friendlist', ensureAuthenticated,	(req, res) => {
  let userId = req.user.username;
  if (req.query.user){
    userId = req.query.user;
  }
	User.findOne({username: userId})
		.then(user => {
			res.render('index', {
        friendlist: user.friends,
        cooluser: user.username
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
	.then(notifications => {
    User.findById(req.user._id)
    .then(user => {
      user.notifications = 0;
      user.save();
      res.render('notify', {
        notifications: notifications,
        timeSince: timeSince
      })
    })
	})

})


//chats with a particular user
router.get('/chatphase', ensureAuthenticated, (req, res) => {
  const type = req.query.type;
  const chatid = req.query.user;
  if (type.trim() === "private"){
    User.findById(req.user.id)
	  .then(loggedInUser => {
      const friendNames = [];
      loggedInUser.friends.forEach(index => {
        friendNames.push(index.username);
      })
      if (friendNames.includes(chatid)){
        Message.find({})
        .then(chats => {
          const privateChats = [];
          chats.forEach(chat => {
            if (chat.sillyId.includes(req.user.username) && chat.sillyId.includes(chatid)) {
              privateChats.push(chat)
            }
          })
          User.findOne({username: chatid})
          .then(founduser => {
            res.render('chats', {
              chats: privateChats,
              receiver: chatid,
              receiverimg: founduser.image
            });
          })
        })
      }
      else{
        res.location('/addfriend');
        res.redirect('/addfriend');
      }
    })
  }
  else if (type.trim() === 'group'){
    Group.findOne({_id: chatid})
    .populate('users')
    .populate('messages')
    .then(group => {
      let groupusers = []
      group.users.forEach(user => {
        groupusers.push(user.username);
      });
      if (groupusers.indexOf(req.user.username) === -1){
        res.location('/')
        res.redirect('/');
      }
      else{
        const chats = group.messages;
        res.render('groupchats' , {
          chats: chats,
          receiver: chatid,
          name: group.name,
          admin: group.createdBy,
          members: group.members,
          groupid: group._id,
          groupusers: groupusers
        })
      }
    })
  }

});



function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.location('/users/login');
	res.redirect('/users/login');
}



module.exports = router;



/**
User.deleteMany({})
.then(() => {
  Message.deleteMany({})
.then(() => {
  Notification.deleteMany({})
  .then(() => {
    Group.deleteMany({})
    .then(() => {
      Request.deleteMany({})
      .then(() => {
        console.log('done')
      })
    })
  })
})
})*/
