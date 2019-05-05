const IO = require('socket.io');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const request = require('request');
const path = require('path');
const http = require('http');

const AuthController = require('./auth/AuthController');
const UserDB = require('./users/User');
const VerifyToken = require('./auth/VerifyToken');

const keys = require('./config/keys');
const Card = require('./database/Card');
const CardDB = require('./database/CardDB');
const Parser = require('./database/Parser');
const Database = require('./database/Database');
const LobbyRoom = require('./lobby/Lobby');
const DeckEditor = require('./deck-editor/DeckEditor');

const app = express();
const server = http.Server(app);
const io = IO(server);
const key = {
	'secret': 'kappadin',
}

mongoose.connect(keys.mongoURI, {useNewUrlParser: true});
mongoose.connection.on('open', function (err) {
	if (err) {
		console.error( 'connection error:');
	}
	console.log('Connected to database.');
});

app.use(express.static(path.resolve(__dirname, 'templates/')));

// Authentication and Authorization.
app.get('/auth', (req, res) => {
	res.sendFile(__dirname + '/templates/auth/auth.html');
})

io.on('connection', function(socket) {
	console.log('User connected');
	if (!VerifyToken(socket)) {
		AuthController(socket);
		return;
	} else {
		socket.emit('loginSuccess', {auth: true, token: socket.handshake.query.token});
		DeckEditor(socket);
		LobbyRoom(socket, io);
	};
})

// Parser.

app.all('/parse-db/', (req, res) => {
	res.sendFile(__dirname + '/templates/database/parsedb.html');
})

const parserRoom = io.of('/parse-db');

parserRoom.on('connection', function(socket) {
	Database(socket);
});

server.listen(5000, function() {
	console.log('listening on *:5000');
});
