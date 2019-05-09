const express = require('express');
const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

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

// functions for removing tokens from rooms before sending them. For all rooms and for one room.
function removeTokens (roomsArray) {
	let roomClones = [];
	// Clone rooms, then remove tokens, to not send them, and dont affect initial room objects.
	for (let r in roomsArray) {
		roomClones.push(cloneObject(roomsArray[r]));
		roomClones[r].users.forEach((user) => {
			delete user.token;
		})
	}
	return roomClones;
}
function removeTokensOne (roomObj) {
	// Clone room, then remove tokens, to not send them, and dont affect initial room object.
	let roomClone = cloneObject(roomObj);
	roomClone.users.forEach((user) => {
		delete user.token;
	})
	return roomClone;
}

// functions to search for rooms. By ID and by user jwt.
function searchRoomId (id) {
	if (!id) {return false;}

	for (let i = 0; i < gameRooms.length; i++) {
		if (id === gameRooms[i].id) {
			return {room: gameRooms[i], index: i};
		}
	}
	return false;
}
function searchRoomToken (token) {
	if (!token) {return false;}

	for (let i = 0; i < gameRooms.length; i++) {
		for (let j = 0; j < gameRooms[i].users.length; j++) {
			if (token === gameRooms[i].users[j].token) {
				return {room: gameRooms[i], index: i, userIndex: j};
				break;
			}
		}
	}
	return false;
}

var gameRooms = []; // Array to store rooms.
var chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', text: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', text: 'Stfu kys'},
];

var roomCounter = 1;


function LobbyRoom (socket, io) {

	Users.checkState(socket);

	// Refresh lobby for one socket.
	function refreshLobbyOne () {
		if (gameRooms.length == 0) {
			socket.emit('refreshLobby', gameRooms);
		}
		let roomClones = removeTokens(gameRooms);
		socket.emit('refreshLobby', roomClones);
	}

	// Refresh lobby for all.
	function refreshLobbyAll () {
		if (gameRooms.length == 0) {
			io.sockets.emit('refreshLobby', gameRooms);
		}
		let roomClones = removeTokens(gameRooms);
		io.sockets.emit('refreshLobby', roomClones);
	}

	// refresh chat for one socket.
	function refreshChatOne () {
		socket.emit('refreshChat', chatHistory);
	}

	// refresh chat for all.
	function refreshChatAll () {
		io.sockets.emit('refreshChat', chatHistory);
	}

	// refresh lobby and chat for every user, that just connected to lobby. This is done on page refresh too.
	socket.on('getGameList', function () {
		refreshLobbyOne();
	});
	socket.on('getChatHistory', function () {
		refreshChatOne();
	});

	// Lobby events.

	socket.on('checkUserLocation', function (message) {
		let userState = Users.getUserState(socket);
		// Emit nickname for chat. Maybe I should make separate event for this.
		socket.emit('save-nick', userState.nick);
		if (gameRooms.length === 0) {
			return;
		}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
		}
		if (!userState) {
			return;
		} else if (userState.location.match('room')) {
			let roomID = userState.location.replace('room-', '');
			let room = searchRoomId(roomID).room;
			if (!room) {
				socket.emit('errorMessage', 'Could not find room to refresh')
			} else {
				let roomClone = removeTokensOne(room);
				socket.join(room.socketRoom);
				if (room.state) {
					socket.emit('restoreGame', roomClone);
				} else {
					socket.emit('restoreRoom', roomClone);
				}
			}
		}
	})

	socket.on('createRoom', async function (roomObj) {
		let allowCreation = true;
		for (var i = 0; i < gameRooms.length; i++) {
			if (gameRooms[i].name == roomObj.name) {
				allowCreation = false;
				break;
			}
		};
		if (!allowCreation) {
			socket.emit('errorMessage', 'Room with that name already exists. Try changing name.');
			return;
		}
		var room = roomObj;
		room.id = roomCounter++ + '';
		room.socketRoom = 'room-' + room.id;
		room.state = false;
		room.chat = [];
		room.users = [];
		room.users.push(await Users.getUser(socket));
		if (room.users[0] === null) {
			socket.emit('errorMessage', 'User, that are creating the room, does not exists');
			return;
		}
		room.users[0].role = 'host';
		gameRooms.push(room);

		// clone room and remove tokens from clone - then send it to client;
		let roomClone = removeTokensOne(room);
		socket.join(gameRooms[i].socketRoom);
		socket.emit('joiningRoom', roomClone);
		Users.updateState(socket, 'ready', false);
		Users.updateState(socket, 'move', room.socketRoom);
		Users.updateState(socket, 'changeRoom', gameRooms[i].socketRoom, room.users[0].role);
		refreshLobbyAll();
	});

	// Joining rooms.

	socket.on('joinRoom', async function (info) {
		if (!info || !info.role || !info.id) {
			socket.emit('errorMessage', 'Error joining the game');
		}
		let room = searchRoomId(info.id).room;
		if (!room) {
			socket.emit('errorMessage', 'Could not find room to join.')
		} else {

			// check if there is space for more players.
			let playerCount = 0;
			if (info.role !== 'spectator') {
				for (let j = 0; j < room.users.length; j++) {
					if (room.users[j].role == 'player' || room.users[j].role == 'host') {
						playerCount++;
					}
					if (playerCount === 2) {
						socket.emit('errorMessage', 'The room is full. You can spectate this game, if you want.');
						break;
					}
				}
			}
			if (info.role === 'spectator' || playerCount < 2) {
				var user = await Users.getUser(socket);
				if(!user) {
					socket.emit('errorMessage', 'User, that tries to joing the game, does not exists');
					return;
				}
				user.role = info.role;
				room.users.push(user);
				socket.join(room.socketRoom);

				let roomClone = removeTokensOne(room);
				socket.emit('joiningRoom', roomClone);

				Users.updateState(socket, 'ready', false);
				Users.updateState(socket, 'move', room.socketRoom);
				Users.updateState(socket, 'changeRoom', room.socketRoom, info.role);

				socket.to(room.socketRoom).emit('refreshRoom', roomClone);

				refreshLobbyAll();
			}
		}
	});

	// Leaving rooms.

	socket.on('leaveRoom', function (data) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let roomObj = searchRoomToken(token);
		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to leave from. Maybe this room does not exist already.');
		} else {
			socket.emit('leftRoom', roomObj.room.id);
			roomObj.room.users.splice(roomObj.userIndex, 1);

			Users.updateState(socket, 'ready', false);
			Users.updateState(socket, 'move', '/lobby');
			Users.updateState(socket, 'changeRoom', null, '');

			// Check if there are still players in the room. Dont count spectators.
			let closeGame = true;
			for (let k = 0; k < roomObj.room.users.length; k++) {
				if (roomObj.room.users[k].role == 'player' || roomObj.room.users[k].role == 'host') {
					closeGame = false;
					break;
				}
			}
			if (closeGame) {
				socket.to(roomObj.room.socketRoom).emit('closedRoom', roomObj.room.id);
				gameRooms.splice(roomObj.index, 1);
			} else {
				let roomClone = removeTokensOne(roomObj.room);
				socket.to(roomObj.room.socketRoom).emit('refreshRoom', roomClone);
			}
			refreshLobbyAll();
		}
	});

	// Closing rooms.

	socket.on('closeRoom', function (data) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let roomObj = searchRoomToken(token);
		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to close. Maybe this room does not exist.');
		} else {
			socket.to(roomObj.room.socketRoom).emit('closedRoom', roomObj.room.id);
			socket.emit('closedRoom', roomObj.room.id);
			gameRooms.splice(roomObj.index, 1);

			Users.updateState(socket, 'ready', false);
			Users.updateState(socket, 'move', '/lobby');
			Users.updateState(socket, 'changeRoom', null, '');
			refreshLobbyAll();
		}
	});

	// Player is ready.

	socket.on('playerReadiness', function () {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let roomObj = searchRoomToken(token);
		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to change player readiness. Maybe your room does not exist.');
		} else {
			roomObj.room.users[roomObj.userIndex].ready = !roomObj.room.users[roomObj.userIndex].ready;
			Users.updateState(socket, 'ready', roomObj.room.users[roomObj.userIndex].ready);
			let roomClone = removeTokensOne(roomObj.room);
			socket.to(roomObj.room.socketRoom).emit('refreshRoom', roomClone);
			socket.emit('refreshRoom', roomClone);
		}
	});

	// Start game, when all players are ready.
	socket.on('initGame', function (id) {
		let room = searchRoomId(id).room;
		room.state = true;
		socket.to(room.socketRoom).emit('restoreGame', room);
		socket.emit('restoreGame', room);
		refreshLobbyAll();
	});

	// Chat events.

	socket.on('chatMessage', async function (message) {
		if (messagesIsForbidden) {
			return;
		}
		chatHistory.push(message);
		refreshChatAll();
	});
	socket.on('roomMessage', async function (message) {
		if (messagesIsForbidden) {
			return;
		}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let room = searchRoomToken(token).room;
		room.chat.push(message);
		socket.to(room.socketRoom).emit('refreshRoomChat', room.chat);
		socket.emit('refreshRoomChat', room.chat);
	});
};

module.exports = LobbyRoom;
