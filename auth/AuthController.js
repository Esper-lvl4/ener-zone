const express = require('express');
const User = require('../users/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const key = {
	'secret': 'kappadin',
}

function socketRouter (socket) {
	socket.on('sign-up-user', async function (userObj) {

		// check if there is user with that name already.

		var allowSignUp = true;

		await User.findOne({username: userObj.name}, function (err, user) {
			if (err) {
				socket.emit('failed-sign-up', 'Something went wrong, when checked the name.');
				allowSignUp = false;
			}
			if (user) {
				socket.emit('failed-sign-up', 'Username is already taken');
				allowSignUp = false;
			}
		});
		if (allowSignUp === false) {
			return;
		} else {
			let hashedPass = bcrypt.hashSync(userObj.password, 8);
			User.create({
				username: userObj.name,
				password: hashedPass,
				avatarPass: '/users/default-pic.png',
				options: {
					infoPosition: 'left',
					clientColor: 'default',
				}
			},
			function (err, user) {
				if (err) {
					socket.emit('failed-register', 'Could not register a user');
					return;
				}
				let token = jwt.sign({id: user._id}, key.secret, {
					expiresIn: 86400,
				});
				socket.emit('success-sign-up', {auth: true, token: token})
			});
		}
	});

	socket.on('login', function (userObj) {
		User.findOne({username: userObj.name}, function (err, user) {
			if (err) {
				socket.emit('failed-login', 'Error, when tried to login.');
				return;
			}
			if (!user) {
				socket.emit('failed-login', 'Wrong username or password.');
				return;
			}
			let passwordIsValid = bcrypt.compareSync(userObj.password, user.password);

			if (!passwordIsValid) {
				socket.emit('failed-login', 'Wrong username or password.');
			}
			else {
				const token = jwt.sign({id: user._id}, key.secret, {
					expiresIn: 86400,
				});
				console.log(token);
				socket.emit('success-login', {auth: true, token: token});
			}
		});
	});
};


module.exports = socketRouter;
