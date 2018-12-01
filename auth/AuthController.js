const express = require('express');
const User = require('../users/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const key = {
	'secret': 'kappadin',
}

function socketRouter (socket) {
	socket.on('sign-up-user', function (userObj) {
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
		})
	})
};


module.exports = socketRouter;
