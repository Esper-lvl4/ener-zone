const User = require('../state/users/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const key = {
	'secret': 'kappadin',
}

function socketRouter (socket) {
	socket.on('tryRegister', async function (userObj) {

		// check if there is user with that name already.

		var allowSignUp = true;

		await User.findOne({username: userObj.name}, function (err, user) {
			if (err) {
				socket.emit('registerFail', 'Something went wrong, when checked the name.');
				allowSignUp = false;
			}
			if (user) {
				socket.emit('registerFail', 'Username is already taken');
				allowSignUp = false;
			}
		});

		if (allowSignUp === false) return;

		let hashedPass = bcrypt.hashSync(userObj.password, 8);
		User.create({
				username: userObj.name,
				password: hashedPass,
				nickname: userObj.name,
				avatarPass: '/users/default-pic.png',
				options: {
					infoPosition: 'left',
					clientColor: 'default',
				},
				decks: [],
			},
			function (err, user) {
				if (err) {
					socket.emit('registerFail', 'Could not register a user');
					return;
				}
				let token = jwt.sign({id: user._id}, key.secret, {
					expiresIn: 86400,
				});

				socket.emit('loginSuccess', {auth: true, token: token, nick: user.nickname});
			});
	});

	socket.on('tryLogin', function (userObj) {
		console.log('login attempt');
		User.findOne({username: userObj.name}, function (err, user) {
			if (err || !user) {
				socket.emit('loginFail', 'Wrong username or password.');
				return;
			}
			bcrypt.compare(userObj.password, user.password)
				.then((res) => {
					if (!res) {
						socket.emit('loginFail', 'Wrong username or password.');
						return;
					}
					const token = jwt.sign({id: user._id}, key.secret, {
						expiresIn: 86400,
					});
					socket.emit('loginSuccess', {auth: true, token: token, nick: user.nickname});
				})
				.catch(err => console.error(err));
		});
	});
};


module.exports = socketRouter;
