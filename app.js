const express = require('express');
const path = require('path')
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require('passport-strategy').Strategy;
const bodyParser = require('body-parser');
const flash = require('connect-flash')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mongoose = require('mongoose');
const ejs = require('ejs')
//mongodb://josephtesla:tesla98@ds151614.mlab.com:51614/passportapp
mongoose.connect('mongodb://josephtesla:tesla98@ds151614.mlab.com:51614/passportapp').then(() => {
	console.log("connected");
}).catch(err => { console.log(err.message) })
const Message = require('./Models/Message');
const User = require('./Models/User')

app.use(express.static(path.join(__dirname, 'public')));

const socketusers = [];
const connections = [];

server.listen(process.env.PORT || 5000, function () {
	console.log('server started...')
});

const routes = require('./routes/index');
const users = require('./routes/users')

//view engine
app.set('view engine', 'ejs');
//static folder
app.use(express.static(path.join(__dirname, 'public')));


//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//express-session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session());

//express-validator middleware
app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		var namespace = param.split('.')
			, root = namespace.shift()
			, formParam = root;

		while (namespace.length) {
			formParam = '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};

	}
}));

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.location('/users/login');
	res.redirect('/users/login');
}

//connnect-flash
app.use(flash());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
})

app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
})

app.get('/chats', ensureAuthenticated, (req, res)	=>{
	console.log(socketusers)
	const loggedInUser = req.user;
	const onlineFriends = [];
	User.findById(loggedInUser._id)
	.then(user => {
		const friendNames = [];
		user.friends.forEach(friend => {
			friendNames.push(friend.username);
		})
		socketusers.forEach(onlineUser => {
			if (friendNames.includes(onlineUser)){
				onlineFriends.push(onlineUser);
			}
		})
		res.render('index', {
			onlineFriends:onlineFriends
		})
	})
})

app.use('/', routes);
app.use('/users', users);

io.sockets.on('connection', function (socket) {
	connections.push(socket);

	socket.on('disconnect', function (data) {
		if (!socket.username) return;
		socketusers.splice(socketusers.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log("Disconnected: %s sockets connected", connections.length)
	})

	//event Listener for send message emitted from the client
	socket.on('send message', function (data) {
		//'emit new message event' to all sockets
		io.sockets.emit('new message', {
			msg: data.msg,
			user: socket.username,
			receiver: data.receiver
		});
		console.log(socket.username)
		const newMessage = {
			sillyId: `${socket.username} ${data.receiver}`,
			message: {
					msg: data.msg,
					type:"text"
				},
			sender: socket.username,
			receiver: data.receiver,
			date: new Date().toLocaleString()
		}
		Message.create(newMessage)
			.then(result => {
				console.log(result);
			}).catch((err) => {
				console.log(err.message)
			})
	})


	//new user
	socket.on('new user', function (data, callback) {
		callback(true)
		socket.username = data;
		if (!socketusers.includes(socket.username)) {
			socketusers.push(socket.username);
			updateUsernames();
		}
	})

	function updateUsernames() {
		io.sockets.emit('get user', socketusers)
	}
});


