const express = require('express');
const jwt = require('jsonwebtoken');

const State = require('./../state/State');
const Rooms = require('./rooms/Game_Rooms');

var chatHistory = [ // Array to store recent messages in chat.
	{time: '13:00', nickname: 'Kekko', text: 'Hello there!'},
	{time: '13:30', nickname: 'Chebur', text: 'Stfu kys'},
];

// Refresh lobby for a person, when he enters lobby or refreshes the page.
function getGameList () {
	Rooms.emit('refresh-for-one', this);
}

// Lobby events.
function checkUserLocation (message) {
	let user = State.getUser(this);

	if (Rooms.list.length === 0 || !user || !user.room) return;
	let room = user.room;
	if (room) {
		let roomClone = room.clear();
		this.join(room.socketRoom);
		if (room.state) {
			this.emit('restoreGame', roomClone);
		} else {
			this.emit('restoreRoom', roomClone);
		}
	}
}

// Create rooms. Dont allow people to create rooms with same names.
async function createRoom (roomObj) {
	Rooms.emit('host-room', roomObj, socket);
}

// Joining rooms. Check, if it's full, but only if joining user isnt spectator.
function joinRoom (info) {
	Rooms.joinRoom(this, info);
}

// Leaving rooms. Close, if it's empty.
function leaveRoom() {
	let roomObj = Rooms.getRoom(this.handshake.query.token);
	if (roomObj) {
		roomObj.room.emit('leave', this);
	}
}

// Closing rooms.
function closeRoom (id) {
	Rooms.emit('close-room', id);
}

// Loading decks.
function loadedDeck (name) {
	State.loadDeck(this, name);
}

// Player is ready.
function playerReadiness (value) {
	State.emit('player-ready', {socket: this, value});
}

// Start game, when all players are ready.
function initGame (id) {
	let room = Rooms.getRoom(id).room;
	if (!room.state) {
		room.start();
		let roomClone = room.clear();

		this.to(roomClone.socketRoom).emit('restoreGame', roomClone);
		this.emit('restoreGame', roomClone);
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
	let token = this.handshake.query.token;
	if (!token) {
		this.emit('successLogout', 'no token');
		return;
	}
	let room = Rooms.getRoom(token).room;
	room.chat.push(message);
	this.to(room.socketRoom).emit('refreshRoomChat', room.chat);
	this.emit('refreshRoomChat', room.chat);
}

// refresh chat for one socket.
function refreshChatOne () {
	this.emit('refreshChat', chatHistory);
}

// refresh chat for all.
function refreshChatAll () {
	io.sockets.emit('refreshChat', chatHistory);
}

function LobbyRoom (socket, io) {
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
