const express = require('express');
const jwt = require('jsonwebtoken');

const Users = require('../users/Users');
const Rooms = require('../rooms/Game_Rooms');

const callback = require('../tools/SocketCallbackDecorator');


var chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', text: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', text: 'Stfu kys'},
];

function LobbyRoom (socket, io) {

	Users.checkState(socket);

	// Decorated methods to pass current socket to it in socket callback.
	// Otherwise I would be forced to call it withing anonimous function, since "this" is lost.
	let getGameList = callback(Rooms.refresh, socket, Rooms);

	// Functions, that are used as callbacks without decorator.

	// Lobby events.
	function checkUserLocation (message) {
		let userState = Users.getUserState(socket);
		// Emit nickname for chat. Maybe I should make separate event for this.
		socket.emit('save-nick', userState.nick);
		if (Rooms.list.length === 0) {
			return;
		}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout');
		}
		if (!userState) {
			return;
		} else if (userState.location.match('room')) {
			let roomID = userState.location.replace('room-', '');
			let room = Rooms.getById(roomID).room;
			if (!room) {
				socket.emit('errorMessage', 'Could not find room to refresh')
			} else {
				let roomClone = room.clear();
				socket.join(room.socketRoom);
				if (room.state) {
					socket.emit('restoreGame', roomClone);
				} else {
					socket.emit('restoreRoom', roomClone);
				}
			}
		}
	}

	// Create rooms. Dont allow people to create rooms with same names.
	async function createRoom (roomObj) {
		let allowCreation = true;
		for (var i = 0; i < Rooms.list.length; i++) {
			if (Rooms.list[i].name == roomObj.name) {
				allowCreation = false;
				break;
			}
		};
		if (!allowCreation) {
			socket.emit('errorMessage', 'Room with that name already exists. Try changing name.');
			return;
		}
		let room = await Rooms.add(socket, roomObj);
		if (!room) {
			socket.emit('errorMessage', 'User, that are creating the room, does not exists');
		}

		// clone room and remove tokens from clone - then send it to client;
		let roomClone = room.clear();
		socket.join(room.socketRoom);
		socket.emit('joiningRoom', roomClone);
		Users.updateState(socket, 'ready', false);
		Users.updateState(socket, 'move', room.socketRoom);
		Users.updateState(socket, 'changeRoom', room.socketRoom);
		Rooms.refreshAll(io);
	}

	// Joining rooms. Check, if it's full, but only if joining user isnt spectator.
	async function joinRoom (info) {
		if (!info || !info.role || !info.id) {
			socket.emit('errorMessage', 'Info werent provided or werent complete');
		}
		let room = Rooms.getById(info.id).room;
		if (!room) {
			socket.emit('errorMessage', 'Could not find room to join.')
		} else {

			// check if there is space for more players.
			if (room.isFull() && info.role !== 'spectator') {
				socket.emit('errorMessage', 'The room is full. You can spectate this game, if you want, though.');
				return;
			} else {
				let user = await Users.getUser(socket);
				if(!user) {
					socket.emit('errorMessage', 'User, that tries to joing the game, does not exists');
					return;
				}
				user.role = info.role;
				room.join(socket, user);

				let roomClone = room.clear();
				socket.emit('joiningRoom', roomClone);

				Users.updateState(socket, 'ready', false);
				Users.updateState(socket, 'move', room.socketRoom);
				Users.updateState(socket, 'changeRoom', room.socketRoom, info.role);

				socket.to(room.socketRoom).emit('refreshRoom', roomClone);

				Rooms.refreshAll(io);
			}
		}
	}

	// Leaving rooms. Close, if it's empty.
	function leaveRoom(data) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}

		let roomObj = Rooms.getByToken(token);

		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to leave from. Maybe this room does not exist already.');
		} else {
			let {room, index, userIndex, role} = roomObj;

			socket.emit('leftRoom');
			room.leave(userIndex, role);

			Users.updateState(socket, 'ready', false);
			Users.updateState(socket, 'move', '/lobby');
			Users.updateState(socket, 'changeRoom', null, '');

			if (room.isEmpty()) {
				socket.to(room.socketRoom).emit('closedRoom');
				Rooms.remove(index);
			} else {
				let roomClone = room.clear();
				socket.to(room.socketRoom).emit('refreshRoom', roomClone);
			}
			Rooms.refreshAll(io);
		}
	}

	// Closing rooms.
	function closeRoom (data) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout');
			return;
		}

		let roomObj = Rooms.getByToken(token);

		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to close. Maybe this room does not exist.');
		} else {
			let {room, index} = roomObj;

			socket.to(room.socketRoom).emit('closedRoom');
			socket.emit('closedRoom');
			Rooms.remove(index);

			Users.updateState(socket, 'ready', false);
			Users.updateState(socket, 'move', '/lobby');
			Users.updateState(socket, 'changeRoom', null, '');
			Rooms.refreshAll(io);
		}
	}

	// Player is ready.
	function playerReadiness (value) {
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let roomObj = Rooms.getByToken(token);
		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to change player readiness. Maybe your room does not exist.');
		} else {
			let room = roomObj.room;
			let index = roomObj.index;
			let userIndex = roomObj.userIndex;

			if (value !== undefined) {
				room.players[userIndex].ready = value;
			} else {
				room.players[userIndex].ready = !room.players[userIndex].ready;
			}

			Users.updateState(socket, 'ready', room.players[userIndex].ready);
			let roomClone = room.clear();
			socket.to(room.socketRoom).emit('refreshRoom', roomClone);
			socket.emit('refreshRoom', roomClone);
		}
	}

	// Start game, when all players are ready.
	function initGame (id) {
		let room = Rooms.getById(id).room;
		if (!room.state) {
			room.start();
			let roomClone = room.clear();
			socket.join(room.socketRoom);
			socket.to(roomClone.socketRoom).emit('restoreGame', roomClone);
			socket.emit('restoreGame', roomClone);
			Rooms.refreshAll(io);
		}
	}

	// Chat events.

	async function chatMessage (message) {
		if (messagesIsForbidden) {
			return;
		}
		chatHistory.push(message);
		refreshChatAll();
	}

	async function roomMessage (message) {
		if (messagesIsForbidden) {
			return;
		}
		let token = socket.handshake.query.token;
		if (!token) {
			socket.emit('successLogout', 'no token');
			return;
		}
		let room = Rooms.getByToken(token).room;
		room.chat.push(message);
		socket.to(room.socketRoom).emit('refreshRoomChat', room.chat);
		socket.emit('refreshRoomChat', room.chat);
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
	socket.on('getGameList', getGameList);
	socket.on('getChatHistory',	refreshChatOne);

	socket.on('checkUserLocation', checkUserLocation);
	socket.on('createRoom', createRoom);
	socket.on('joinRoom', joinRoom);
	socket.on('leaveRoom', leaveRoom);
	socket.on('closeRoom', closeRoom);
	socket.on('playerReadiness', playerReadiness);
	socket.on('initGame', initGame);

	socket.on('chatMessage', chatMessage);
	socket.on('roomMessage', roomMessage);
};

module.exports = LobbyRoom;
