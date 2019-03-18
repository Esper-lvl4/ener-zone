const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

let gameRooms = [ // Array to store rooms.
	/*
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
	{time: '13:00', nickname: 'Kekko', text: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', text: 'Stfu kys'},
];

let roomCounter = 1;

function LobbyRoom (socket, io) {
	console.log('User entered lobby');
	socket.emit('error-message', 'emits-broken?');
	// function for cloning objects.
	function cloneObject(obj) {
		var clone = {};
		for (var i in obj) {
			if (obj[i] != null && typeof(obj[i]) == 'object' && obj[i].forEach) {
				clone[i] = cloneArray(obj[i]);
			} else if (obj[i] != null && typeof(obj[i]) == 'object') {
				clone[i] = cloneObject(obj[i]);
			} else {
				clone[i] = obj[i];
			}
		}
		return clone;
	}
	// function for cloning arrays.
	function cloneArray(arr) {
		var clone = [];
		for (var a in arr) {
			if (arr[a] != null && typeof(arr[a]) == 'object' && arr[a].forEach) {
				clone.push(cloneArray(arr[a]));
			} else if (arr[a] != null && typeof(arr[a]) == 'object') {
				clone.push(cloneObject(arr[a]));
			} else {
				clone.push(arr[a]);
			}
		}
		return clone;
	}
	
	Users.checkState(socket);

	// init or refresh lobby's room list and chat.
	function refreshLobbyOne () {
		if (gameRooms.length == 0) {
			socket.emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
		}
		// clone rooms, then remove tokens, to not send them.
		var roomClones = [];
		for (var r in gameRooms) {
			roomClones.push(cloneObject(gameRooms[r]));
			roomClones[r].users.forEach((user) => {
				delete user.token;
			})
		}
		socket.emit('refresh-lobby', {rooms: roomClones, history: chatHistory});
	}
	refreshLobbyOne(); // refresh lobby for every user, that just connected to lobby.
 
	// Refresh lobby for all.
	function refreshLobbyAll () {
		if (gameRooms.length == 0) {
			io.of('/lobby').emit('refresh-lobby', {rooms: gameRooms, history: chatHistory});
		}
		// clone rooms, then remove tokens, to not send them.
		var roomClones = [];
		for (var r in gameRooms) {
			roomClones.push(cloneObject(gameRooms[r]));
			roomClones[r].users.forEach((user) => {
				delete user.token;
			})
		}
		io.of('/lobby').emit('refresh-lobby', {rooms: roomClones, history: chatHistory});
	}
	
	// Lobby events.

	socket.on('check-user-location', function (message) {
		let userState = Users.getUserState(socket);
		// Emit nickname for chat. Maybe I should make separate event for this.
		socket.emit('save-nick', userState.nick);
		if (gameRooms.length === 0) {return;}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('success-logout', 'no token');
		}
		if (!userState) {
			return;
		} else if (userState.location.match('/room')) {
			let roomID = userState.location.replace('/lobby/room-', '');
			for (let i = 0; i < gameRooms.length; i++) {
				if (+gameRooms[i].id === +roomID) {
					// Send the copy without tokens to client. 
					let room = cloneObject(gameRooms[i]);
					room.users.forEach((user) => {
						delete user.token;
					})
					socket.join(gameRooms[i].socketRoom);
					socket.emit('restore-room', room, userState.role, userState.ready);
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
		room.users[0].role = 'host';
		gameRooms.push(room);

		// clone room and remove tokens from clone - then send it to client;
		let roomClone = cloneObject(room);
		roomClone.users.forEach((user) => {
			delete user.token;
		});
		socket.join(gameRooms[i].socketRoom);
		console.log(roomClone);
		socket.emit('joining-room', roomClone, room.users[0].role);
		Users.updateState(socket, 'ready', false);
		Users.updateState(socket, 'move', `/lobby/${room.socketRoom}`);
		Users.updateState(socket, 'changeRoom', gameRooms[i].socketRoom, room.users[0].role);
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
		outer: for (var i = 0; i < gameRooms.length; i++) {
			if (info.id === gameRooms[i].id) {
				let playerCount = 0;
				for (let j = 0; j < gameRooms[i].users.length; j++) {
					if (gameRooms[i].users[j].role == 'player' || gameRooms[i].users[j].role == 'host') {
						playerCount++;
					}
					if (playerCount == 2) {
						socket.emit('error-message', 'The room is full. You can spectate this game, if you want.');
						break outer;
					}
				}
				var user = await Users.getUser(socket);
				if(!user) {
					socket.emit('error-message', 'User, that tries to joing the game, does not exists');
					break;
				}
				user.role = info.role;
				user.rdy = false;
				gameRooms[i].users.push(user);
				socket.join(gameRooms[i].socketRoom);
				
				// clone room and remove tokens from clone - then send it to client;
				let roomClone = cloneObject(gameRooms[i]);
				roomClone.users.forEach((user) => {
					delete user.token;
				});
				socket.emit('joining-room', roomClone, info.role);

				Users.updateState(socket, 'ready', false);
				Users.updateState(socket, 'move', `/lobby/${gameRooms[i].socketRoom}`);
				Users.updateState(socket, 'changeRoom', gameRooms[i].socketRoom, info.role);

				socket.to(gameRooms[i].socketRoom).emit('refresh-room', roomClone);

				refreshLobbyAll();
				break;
			}
		}
	});

	// Leaving rooms.

	socket.on('leave-room', function (data) {
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
					socket.emit('left-room', gameRooms[i].id);
					gameRooms[i].users.splice(j, 1);
					
					Users.updateState(socket, 'ready', false);
					Users.updateState(socket, 'move', '/lobby');
					Users.updateState(socket, 'changeRoom', null, '');

					// Check if there are still players in the room. Dont count spectators.
					let closeGame = true;
					for (let k = 0; k < gameRooms[i].users.length; k++) {
						if (gameRooms[i].users[k].role == 'player' || gameRooms[i].users[k].role == 'host') {
							closeGame = false;
							break;
						}
					}
					if (closeGame) {
						socket.to(gameRooms[i].socketRoom).emit('closed-room', gameRooms[i].id);
						gameRooms.splice(i, 1);
					} else {
						// clone room and remove tokens from clone - then send it to client;
						let roomClone = cloneObject(gameRooms[i]);
						roomClone.users.forEach((user) => {
							delete user.token;
						});
						socket.to(gameRooms[i].socketRoom).emit('refresh-room', roomClone);
					}
					refreshLobbyAll();
					break;
				}
			}
			if (breaker) {
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
				socket.to(gameRooms[i].socketRoom).emit('closed-room', gameRooms[i].id);
				socket.emit('closed-room', gameRooms[i].id);
				gameRooms.splice(i, 1);

				Users.updateState(socket, 'ready', false);
				Users.updateState(socket, 'move', '/lobby');
				Users.updateState(socket, 'changeRoom', null, '');
				refreshLobbyAll();
				break;
			}
		}
	});

	// Player is ready.

	socket.on('player-readiness', function (value) {
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
					gameRooms[i].users[j].ready = value;
					break;
				}
			}
			if (breaker) {
				Users.updateState(socket, 'ready', value);
				let roomClone = cloneObject(gameRooms[i]);
				roomClone.users.forEach((user) => {
					delete user.token;
				});
				socket.to(gameRooms[i].socketRoom).emit('refresh-room', roomClone);
				socket.emit('refresh-room', roomClone, value);
				break;
			}
		}
	});

	// Start game, when all players are ready.
	socket.on('init-game', function (data) {

	});

	// Chat events.

	socket.on('chat-message', async function (message) {
		chatHistory.push(message);
		refreshLobbyAll();
	});
};

module.exports = LobbyRoom;