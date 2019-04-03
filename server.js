const IO = require('socket.io');
const express = require('express');
const session = require('express-session');
const FileStore = require('express-file-store');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const request = require('request');
const path = require('path');
const http = require('http');
const fs = require('fs');

const AuthController = require('./auth/AuthController');
const UserDB = require('./users/User');
const VerifyToken = require('./auth/VerifyToken');

const Card = require('./database/Card');
const CardDB = require('./database/CardDB');
const Parser = require('./database/Parser');
const Database = require('./database/Database');
const LobbyRoom = require('./lobby/Lobby');
const DeckEditor = require('./deck-editor/DeckEditor');
const MainMenu = require('./main-menu/MainMenu');

const app = express();
const server = http.Server(app);
const io = IO(server);
const key = {
	'secret': 'kappadin',
}

mongoose.connect('mongodb://127.0.0.1:27017/wixoss', {useNewUrlParser: true});
mongoose.connection.on('open', function (err) {
	if (err) {
		console.error( 'connection error:');
	}
	console.log('Connected to database.');
});

// Saved decks path.

var fileStore = FileStore('fs', {
  path: __dirname + '/saves/',
});

app.use(express.static(path.resolve(__dirname, 'templates/')));

// Authentication and Authorization.
app.get('/auth', (req, res) => {
	res.sendFile(__dirname + '/templates/auth/auth.html');
})

const authPage = io.of('/auth');

authPage.on('connection', function (socket) {
	console.log('User is at auth page.');

	AuthController(socket);
})

// Main menu.

const mainMenu = io.of('/main-menu');

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/templates/main-menu/main-menu.html');

})

mainMenu.on('connection', function(socket) {
	if (!VerifyToken(socket)) {
		return;
	} else {
		MainMenu(socket);
	};
});

// Deck Editor.

app.all('/deck-editor/', (req, res) => {
  res.sendFile(__dirname + '/templates/deck-editor/deck-editor.html');
})

const deckEditor = io.of('/deck-editor');

deckEditor.on('connection', function(socket) {
	if (!VerifyToken(socket)) {
		return;
	} else {
		DeckEditor(socket);
	};
});

// Lobby. 

app.get('/lobby/', (req, res) => {
	res.sendFile(__dirname + '/templates/lobby/lobby.html');
})

const lobby = io.of('/lobby');

lobby.on('connection', function (socket) {
	if (!VerifyToken(socket)) {
		return;
	} else {
		LobbyRoom(socket, io);
	};
});

// Parser.

app.all('/parse-db/', (req, res) => {
	res.sendFile(__dirname + '/templates/database/parsedb.html');
})

const parserRoom = io.of('/parse-db');

parserRoom.on('connection', function(socket) {
	Database(socket);
});

server.listen(8080, function() {
	console.log('listening on *:8080');
});