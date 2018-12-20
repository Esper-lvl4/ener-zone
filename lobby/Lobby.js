const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

function LobbyRoom (socket) {
	console.log(`User entered lobby:`);
	Users.setNickname(socket);

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