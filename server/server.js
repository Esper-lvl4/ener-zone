const IO = require('socket.io');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const bodyParser = require('body-parser');

const path = require('path');
const http = require('http');

const AuthController = require('./auth/AuthController');
// const UserDB = require('./state/users/User');
const VerifyToken = require('./auth/VerifyToken');

const keys = require('./config/keys');
// const Card = require('./database/Card');
// const CardDB = require('./database/CardDB');
// const Parser = require('./database/Parser');
const Database = require('./database/Database');
const LobbyRoom = require('./lobby/Lobby');
const DeckEditor = require('./deck-editor/DeckEditor');
const Game = require('./lobby/game/Game');
const State = require('./state/State');
const GlobalSocket = require('./global_socket/Global_Socket');

const app = express();
const server = http.Server(app);
const io = IO(server);
const key = {
	'secret': 'kappadin',
}

mongoose.connect(keys.mongoURI, {useNewUrlParser: true});
mongoose.connection.on('open', function (err) {
	if (err) {
		console.error('connection error:');
		console.error(err);
	}
	console.log('Connected to database.');
});

app.use(cors());

app.use(express.static(path.resolve(__dirname, 'templates/')));

// Authentication and Authorization.
app.get('/auth', (req, res) => {
	res.sendFile(__dirname + '/templates/auth/auth.html');
})

GlobalSocket.provideServerInstance(io);

io.on('connection', function(socket) {
	console.log('User connected');
	VerifyToken(socket);
	AuthController(socket);
	DeckEditor(socket);
	LobbyRoom(socket);
	Game(socket);

	// Parser
	Database(socket);
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
