const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

function LobbyRoom (socket) {
	console.log(`User entered lobby:`);
	Users.setNickname(socket);

	let gameRooms = [ // Array to store rooms.
		{name: 'wixoss-open', settings: {format: 'as', timeLimit: 'none', password: ''}},
		{name: 'wixoss-closed', settings: {format: 'ks', timeLimit: '300', password: '123'}},
	]; 
	let chatHistory = [ // Array to store recent messages in chat.
		{time: '13:00', nickname: 'Kekko', message: 'Hello there!'},
		{time: '13:30', nickname: 'Chebur', message: 'Stfu kys'},
	]; 

	// init or refresh lobby's room list and chat.

	socket.emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
	
	// Lobby events.

	socket.on('create-room', function (room) {
		gameRooms.push({name: room.name, settings: room.settings});
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