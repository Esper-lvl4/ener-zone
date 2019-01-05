const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

let gameRooms = [ // Array to store rooms.
	/*{name: 'wixoss-open', id: '-2', settings: {
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
	]},*/
]; 
let chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', message: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', message: 'Stfu kys'},
];

let roomCounter = 1;

function LobbyRoom (socket, io) {
	console.log('User entered lobby');
	
	Users.checkState(socket);

	// init or refresh lobby's room list and chat. Do it every 10 seconds afterwards.
	function refreshLobbyOne () {
		socket.emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
	}
	refreshLobbyOne(); // refresh lobby for every user, that just connected to lobby.

	// Refresh lobby for all.
	function refreshLobbyAll () {
		io.of('/lobby').emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
	}
	
	// Lobby events.

	socket.on('check-user-location', function (message) {
		if (gameRooms.length === 0) {return;}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('success-logout', 'no token');
		}
		let userState = Users.getUserState(socket);
		if (!userState) {
			return;
		} else if (userState.location.match('/room')) {
			let roomID = userState.location.replace('/lobby/room-', '');
			for (let i = 0; i < gameRooms.length; i++) {
				if (+gameRooms[i].id === +roomID) {
					// Copy room object and send the copy without tokens to client. 
					let room = Object.assign({}, gameRooms[i]);
					room.users.forEach(function (user) {
						user.token = undefined;
					});
					socket.emit('restore-room', room);
				}
			}
		}
	})

	socket.on('create-room', async function (roomObj) {
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
		room.id = roomCounter++ + '';
		room.socketRoom = 'room-' + room.id;
		room.state = false;
		room.users = [];
		room.users.push(await Users.getUser(socket));
		if (room.users[0] === null) {
			socket.emit('failed-room-creation', 'User, that are creating the room, does not exists');
			return;
		}
		gameRooms.push(room);

		// delete tokens from room before sending it to client;
		let tokens = [];
		for (var u in room.users) {
			tokens.push(room.users[u].token);
			delete room.users[u].token;
		}
		socket.emit('joining-room', room);

		// restore tokens.
		for (var t in tokens) {
			room.users[t].token = tokens[t];
		}

		Users.updateState(socket, 'move', `/lobby/${room.socketRoom}`);
		refreshLobbyAll();
	});

	socket.on('delete-room', function (id) {
		refreshLobbyAll();
	});

	// Joining rooms.

	socket.on('join-room', async function (info) {
		if (!info || !info.role || !info.id) {
			socket.emit('error-message', 'Error joining the game');
		}
		for (var i = 0; i < gameRooms.length; i++) {
			console.log(info.id === gameRooms[i].id);
			if (info.id === gameRooms[i].id) {
				var user = await Users.getUser(socket);
				if(!user) {
					socket.emit('error-message', 'User, that tries to joing the game, does not exists');
					break;
				}
				gameRooms[i].users.push(user);
				socket.join(gameRooms[i].socketRoom);
				
				// delete tokens from room before sending it to client;
				let tokens = [];
				for (var u in gameRooms[i].users) {
					tokens.push(gameRooms[i].users[u].token);
					delete gameRooms[i].users[u].token;
				}
				socket.emit('joining-room', room);

				// restore tokens.
				for (var t in tokens) {
					gameRooms[i].users[t].token = tokens[t];
				}

				Users.updateState(socket, 'move', `/lobby/${gameRooms[i].socketRoom}`);
				io.to(gameRooms[i].socketRoom).emit('refresh-room', gameRooms[i]);

				refreshLobbyAll();
				break;
			}
		}
	});

	// Closing rooms.

	socket.on('close-room', function (data) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('success-logout', 'no token');
			return;
		}
		for (let i = 0; i < gameRooms.length; i++) {
			let breaker = false;
			for (let j = 0; j < gameRooms[i].users.length; j++) {
				if (token === gameRooms[i].users[j].token) {
					breaker = true;
					break;
				}
			}
			if (breaker) {
				socket.emit('closed-room', gameRooms[i].id);
				gameRooms.splice(i, 1);
				Users.updateState(socket, 'move', '/lobby');
				refreshLobbyAll();
				break;
			}
		}
	});

	socket.on('init-game', function (data) {

	});

	// Chat events.

	socket.on('chat-message', function (data) {
		refreshLobbyAll();
	});
};

module.exports = LobbyRoom;