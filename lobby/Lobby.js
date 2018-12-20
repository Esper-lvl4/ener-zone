const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../users/User');

function LobbyRoom (socket) {
	console.log(`User entered lobby:`);
	var nick = socket.handshake.query.nickname;
	console.log(nick);
	if (!nick) {
		console.log(socket.handshake.query);
		let token = socket.handshake.query.token;
		let decoded = jwt.decode(token, {complete: true});
		User.findOne({_id: decoded.payload.id}, function (err, user) {
			if (err) {
				socket.emit('something-wrong', 'Error, when tried to find a user.');
				return;
			}
			if (!user) {
				socket.emit('success-logout', 'User without a document in DB got token.');
				return;
			}
			socket.emit('set-nickname', user.nickname);
		});																												
	}

	socket.emit('get-room-list', '');

	socket.emit('get-chat-history', '');
	
	// Lobby events.

	socket.on('create-room', function (data) {

	});

	socket.on('delete-room', function (data) {

	});

	socket.on('init-game', function (data) {

	});

	// Chat events.

	socket.on('chat-message', function (data) {

	});
};

module.exports = LobbyRoom;