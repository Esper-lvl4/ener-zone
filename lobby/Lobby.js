const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

let gameRooms = [ // Array to store rooms.
	{name: 'wixoss-open', id: '-2', settings: {
		format: 'as', 
		timeLimit: 'none', 
		password: ''
	}, 
	users: [
		{id: '123', name: 'Admin'},
		{id: '321', name: 'RankUp'},
	]},
	{name: 'wixoss-closed', id: '-1', settings: {
		format: 'ks', 
		timeLimit: '300', 
		password: '123'
	}, 
	users: [
		{id: '456', name: 'Renekton'},
		{id: '654', name: 'Kekko'},
	]},
]; 
let chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', message: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', message: 'Stfu kys'},
];
let roomCounter = 0;

function LobbyRoom (socket, io) {
	console.log('User entered lobby:');
	Users.setNickname(socket);

	// init or refresh lobby's room list and chat. Do it every 10 seconds afterwards.
	function refreshLobbyOne () {
		socket.emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
	}
	refreshLobbyOne();

	// Refresh lobby for all.
	function refreshLobbyAll () {
		io.of('/lobby').emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
	}
	
	// Lobby events.

	socket.on('create-room', function (roomObj) {
		let allowCreation = true;
		for (var i = 0; i < gameRooms.length; i++) {
			if (gameRooms[i].name == roomObj.name) {
				allowCreation = false;
				break;
			}
		};
		if (!allowCreation) {
			socket.emit('failed-room-creation', 'Room with that name already exists. Try changing name.');
			return;
		}
		var room = roomObj;
		room.users = [].push(Users.getUser(socket));
		if (room.users[0] === null) {
			socket.emit('failed-room-creation', 'User, that are creating the room, does not exists');
			return;
		}
		room.id = roomCounter++ + '';
		gameRooms.push(room);
		socket.emit('joining-room', room);
		refreshLobbyAll();
	});

	socket.on('delete-room', function (id) {
		refreshLobbyAll();
	});

	socket.on('init-game', function (data) {

	});

	// Chat events.

	socket.on('chat-message', function (data) {
		refreshLobbyAll();
	});
};

module.exports = LobbyRoom;