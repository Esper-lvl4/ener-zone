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
	let room = Rooms.getRoom(this);
	if (room) {
		this.join(room.socketRoom);
		if (room.state) {
			this.emit('restoreGame', room.state);
		} else {
			this.emit('restoreRoom', room);
		}
	}
}

// Create rooms. Dont allow people to create rooms with same names.
async function createRoom (roomObj) {
	Rooms.emit('host-room', {roomObj, socket: this});
}

// Joining rooms. Check, if it's full, but only if joining user isnt spectator.
function joinRoom (info) {
	Rooms.joinRoom(this, info);
}

// Leaving rooms. Close, if it's empty.
function leaveRoom() {
	Rooms.emit('leave-room', this);
}

// Closing rooms.
function closeRoom (roomId) {
	Rooms.emit('close-room', {socket: this, roomId});
}

// Loading decks.
function loadedDeck (name) {
	Rooms.loadDeck({socket: this, name});
}

// Player is ready.
function playerReadiness (value) {
	Rooms.emit('player-ready', {socket: this, value});
}

// Start game, when all players are ready.
function initGame (id) {
	let room = Rooms.getByRoomId(id);
	if (room) {
		room.emit('init-game', {socket: this, id});
	}
}

// Chat events.

async function chatMessage (message) {
	chatHistory.push(message);
	refreshChatAll(this);
}

async function roomMessage (message) {
	let room = Rooms.getRoom(this);
	if (room) {
		room.chat.push(message);
		this.to(room.socketRoom).emit('refreshRoomChat', room.chat);
		this.emit('refreshRoomChat', room.chat);
	}
}

// refresh chat for one socket.
function refreshChatOne () {
	this.emit('refreshChat', chatHistory);
}

// refresh chat for all.
function refreshChatAll (socket) {
	socket.server.sockets.emit('refreshChat', chatHistory);
}

function LobbyRoom (socket) {
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
