const express = require('express');
const jwt = require('jsonwebtoken');

const State = require('../state/State');
const Rooms = require('../rooms/Game_Rooms');

const callback = require('../tools/SocketCallbackDecorator');


var chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', text: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', text: 'Stfu kys'},
];

function LobbyRoom (socket, io) {

	State.check(socket);

	// Decorated methods to pass current socket to it in socket callback.
	// Otherwise I would be forced to call it within anonimous function, since "this" is lost.
	let getGameList = callback(Rooms.refresh, socket, Rooms);

	// Functions, that are used as callbacks without decorator.

	// Lobby events.
	function checkUserLocation (message) {
		let location = State.getUserLocation(socket);
		if (Rooms.list.length === 0) {
			return;
		}
		if (location && location !== 'pool') {
			let room = location.room;
			let roomClone = room.clear();
			socket.join(room.socketRoom);
			if (room.state) {
				socket.emit('restoreGame', roomClone);
			} else {
				socket.emit('restoreRoom', roomClone);
			}
		}
	}

	// Create rooms. Dont allow people to create rooms with same names.
	async function createRoom (roomObj) {
		if (Rooms.canCreate()) {
			State.hostRoom(socket, roomObj);
		} else {
			socket.emit('errorMessage', 'Room with that name already exists. Try changing name.');
		}
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
			let user = await State.getUser(socket);
			if(!user) {
				socket.emit('errorMessage', 'User, that tries to joing the game, does not exists');
				return;
			}
			user.role = info.role;
			State.joinRoom(socket, room);
			Rooms.refreshAll(io);
		}
	}

	// Leaving rooms. Close, if it's empty.
	function leaveRoom(data) {
		let roomObj = Rooms.getByToken(socket.handshake.query.token);

		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to leave from. Maybe this room does not exist already.');
		} else {
			let {room} = roomObj;

			State.moveUser(socket, room, false);
			socket.emit('leftRoom');

			room.refresh(socket);
			Rooms.refreshAll(io);
		}
	}

	// Closing rooms.
	function closeRoom (data) {
		let roomObj = Rooms.getByToken(socket.handshake.query.token);

		if (!roomObj) {
			socket.emit('errorMessage', 'Could not find room to close. Maybe this room does not exist.');
		} else {
			let {room} = roomObj;

			State.moveUser(socket, room, false);
			socket.to(room.socketRoom).emit('closedRoom');
			socket.emit('closedRoom');

			Rooms.refreshAll(io);
		}
	}

	// Loading decks.
	function loadedDeck (name) {
		let roomObj = Rooms.getByToken(socket.handshake.query.token);
		if (!roomObj) {
			socket.emit('errorMessage', "You're not in the room!");
		} else {
			let {room, userIndex} = roomObj;
			room.players[userIndex].deck = name;
			room.refresh(socket);
		}
	}

	// Player is ready.
	function playerReadiness (value) {
		if (!value) return;
		let roomObj = Rooms.getByToken(socket.handshake.query.token);

		if (!roomObj) {
			socket.emit('errorMessage', "You're not in the room!");
		} else {
			let {room} = roomObj;
			room.setPlayerReady(socket, value);
			room.refresh(socket);
		}
	}

	// Start game, when all players are ready.
	function initGame (id) {
		let room = Rooms.getById(id).room;
		if (!room.state) {
			room.start();
			let roomClone = room.clear();

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
	socket.on('loadedDeck', loadedDeck);
	socket.on('playerReadiness', playerReadiness);
	socket.on('initGame', initGame);

	socket.on('chatMessage', chatMessage);
	socket.on('roomMessage', roomMessage);
};

module.exports = LobbyRoom;
