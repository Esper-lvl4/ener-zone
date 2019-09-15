const jwt = require('jsonwebtoken');
const stampit = require('@stamp/it');
const State = require('./../../state/State');
const GameState = require('./../game/Game_State');
const EventEmittable = require('@stamp/eventemittable');
const {showError} = require('./../../tools/tools');
const GlobalSocket = require('./../../global_socket/Global_Socket');

let RoomState = stampit({
	props: {
		players: null,
		spectators: null,
		name: '',
		settings: null,
		/*
			format: 'as',
			timeLimit: '180',
			password: '',
		*/
		id: '',
		socketRoom: '',
		state: false,
		chat: null,
	},
	init({socket, roomObj, id}) {
		this.name = roomObj.name;
		this.settings = roomObj.settings;
		this.id = id + '';
		this.socketRoom = 'room-' + id;
		this.players = [];
		this.spectators = [];

		this.on('join', this.join);
		this.on('leave', this.leave);
		this.on('closing', this.clearUsers);
		this.on('init-game', this.initGame);
		this.on('player-ready', this.setPlayerReady);

		this.on('end-game', this.endGame);
		this.on('leave-game', this.leaveGame);
	},
	methods: {
		refresh(socket) {
			socket.to(this.socketRoom).emit('refreshRoom', this);
			socket.emit('refreshRoom', this);
		},
		join({socket, user}) {
			// check if there is space for more players.
			if (this.isFull() && user.role !== 'spectator') {
				socket.emit('errorMessage', 'The room is full.');
				return false;
			} else if (user.role == 'player' || user.role == 'host') {
				this.players.push(user);
			} else {
				this.spectators.push(user);
			}
			user.room = this.id;
			socket.join(this.socketRoom);
			socket.to(this.socketRoom).emit('refreshRoom', this);
			socket.emit('joiningRoom', this);
			Rooms.emit('add-one-room-all', {socket, room: this});
			return true;
		},

		leave({socket, id}) {
			for (let i = 0; i < this.players.length; i++) {
				if (this.players[i].id === id) {
					this.players[i].room = null;
					this.players.splice(i, 1);
					socket.leave(this.socketRoom);
					break;
				}
			}
			for (let i = 0; i < this.spectators.length; i++) {
				if (this.spectators[i].id === id) {
					this.spectators[i].room = null;
					this.spectators.splice(i, 1);
					socket.leave(this.socketRoom);
					break;
				}
			}
			if (this.state) {
				socket.emit('leftGame', this);
			}


			if (this.isEmpty()) {
				this.state = null;
				Rooms.emit('close-room', {socket, roomId: this.id});
			} else {
				this.refresh(socket);
				socket.emit('leftRoom');
			}
		},
		isFull() {
			let number = 2;
			if (this.settings.numberOfPlayers) number = this.settings.NumberOfPlayers;
			if (this.players.length == number) return true;
			return false;
		},
		isEmpty() {
			// Check if there are still players in the room. Dont count spectators, but search for host in their list.
			if (this.players.length == 0) {
				for (let i = 0; i < this.spectators.length; i++) {
					if (this.spectators[i].role === 'host') {
						return false;
						break;
					}
				}
				return true;
			}
			return false;
		},
		clearUsers() {
			for (let player of this.players) {
				player.room = null;
			}
			for (let spec of this.spectators) {
				spec.room = null;
			}
		},
		getPlayer(socket) {
			let token = socket.handshake.query.token;

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
			}

			for (let player of this.players) {
				if (player.id === decoded.payload.id) {
					return player;
				}
			}
			return false;
		},
		setPlayerReady({socket, value}) {
			let token = socket.handshake.query.token;

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
			}

			for (let player of this.players) {
				if (decoded.payload.id === player.id) {
					player.ready = value === undefined ? !player.ready : value;
					this.refresh(socket);
				}
			}
		},
		initGame({socket, id}) {
			if (!this.state) {
				this.start();

				// socket.to(this.socketRoom).emit('restoreGame', this);
				// socket.emit('restoreGame', this);
				Rooms.emit('refresh-one-room-all', {socket, room: this});
			}
		},
 		start() {
			this.state = GameState(this);
		},

		// In game events.
		endGame (socket) {
			this.state = null;
			for (let player of this.players) {
				player.ready = false;
			}
			let user = this.getPlayer(socket);
			GlobalSocket.broadcastToRoom({room: this.socketRoom, eventName: 'errorMessage', data: `${user.nickname} gave up!`});
			GlobalSocket.broadcastToRoom({room: this.socketRoom, eventName: 'restoreRoom', data: this});
		},
		leaveGame (socket) {
			let user = State.getUser(socket);
			this.leave({socket, id: user.id});
			if (user.role != 'spectator') {
				GlobalSocket.broadcastToRoom({room: this.socketRoom, eventName: 'errorMessage', data: `${user.nickname} has left the game!`});
			}
		},
	}
}).compose(EventEmittable);

const GameRooms = stampit({
	init () {
		this.list = [];
		this.counter = 0;

		this.on('host-room', this.add);
		this.on('close-room', this.remove);
		this.on('leave-room', this.leaveRoom);
		this.on('refresh-for-one', this.refresh);
		this.on('refresh-for-all', this.refreshAll);
		this.on('refresh-one-room-all', this.refreshOneRoomAll);
		this.on('remove-one-room-all', this.removeOneRoomAll);
		this.on('add-one-room-all', this.addOneRoomAll);
		this.on('player-ready', this.playerReady);

		this.on('end-game', this.endGame);
		this.on('leave-game', this.leaveGame);

		console.log('init rooms...');
	},
	methods: {
		add({roomObj, socket}) {
			for (var i = 0; i < this.list.length; i++) {
				if (this.list[i].name == roomObj.name) {
					socket.emit('errorMessage', 'Room with that name already exists. Try changing name.');
				}
			};
			let user = State.getUser(socket);
			if (!user) {
				socket.emit('errorMessage', 'User with this socket does not exist.');
			}
			user.role = 'host';
			let room = RoomState({socket, roomObj, id: ++this.counter});
			this.list.push(room);
			room.emit('join', {socket, user});
		},
		remove({socket, roomId}) {
			if (roomId) {
				for (let i = 0; i < this.list.length; i++) {
					if (roomId === this.list[i].id) {
						this.list[i].emit('closing');
						this.removeOneRoomAll({socket, id: roomId});
						socket.to(this.list[i].socketRoom).emit('closedRoom');
						socket.emit('closedRoom');
						this.list.splice(i, 1);
					}
				}
			}
		},

		// Joining room.
		joinRoom(socket, info) {
			if (!info || !info.role || !info.id) {
				socket.emit('errorMessage', "Info weren't provided or weren't complete");
			}

			let room = this.getByRoomId(info.id);
			let user = State.getUser(socket);

			if (!room) {
				socket.emit('errorMessage', 'Could not find room to join.');
				return;
			}
			if (!user) {
				socket.emit('errorMessage', 'User, that tries to joing the game, does not exists');
				return;
			}
			user.role = info.role;
			room.emit("join", {socket, user});
		},
		leaveRoom(socket) {
			let room = this.getRoom(socket);
			let user = State.getUser(socket);
			if (room && user) {
				room.emit('leave', {socket, id: user.id});
			}
		},

		// Functions to search for rooms.
		getByRoomId(id) {
			if (id !== undefined) {
				for (let i = 0; i < this.list.length; i++) {
					if (this.list[i].id === id) {
						return this.list[i];
					}
				}
			}
		},

		// If, instead of id, socket has been provided, extract user's id from it, then search by id.
		getRoom (socketOrId) {
			if (typeof socketOrId == "object") {
				return this.getByToken(socketOrId);
			} else if (typeof socketOrId == "string") {
				return this.getById(socketOrId);
			}
		},

		getById (id) {
			if (!id) return false;

			for (let i = 0; i < this.list.length; i++) {
				for (let user of this.list[i].players) {
					if (id === user.id) {
						return this.list[i];
					}
				}
				for (let user of this.list[i].spectators) {
					if (id === user.id) {
						return this.list[i];
					}
				}

			}
			return false;
		},
		getByToken (socket) {
			if (!socket) return false;
			let token = socket.handshake.query.token;
			if (!token || token === 'null') {
				showError('Room_List(getByToken): No token were provided!')
				return false;
			}

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
			}
			return this.getById(decoded.payload.id);
		},

		// Load deck of user.
		loadDeck({socket, name}) {
			let user = State.getUser(socket);
			let room = this.getRoom(socket);
			if (!user || !room) {
				this.emit('errorMessage', "State(loadDeck): User is not tracked or he is not in a room!");
			} else {
				user.deck = name;
				room.refresh(socket);
			}
		},

		// Player ready.

		playerReady ({socket, value}) {
			let room = this.getRoom(socket);

			if (!room) {
				socket.emit('errorMessage', "Room List: Room has not been found!");
			} else {
				room.emit('player-ready', {socket, value});
			}
		},

		// In game events.

		leaveGame(socket) {
			let room = this.getRoom(socket);
			room.emit('leave-game', socket);
		},

		endGame(socket) {
			let room = this.getRoom(socket);
			room.emit('end-game', socket);
		},

		// Refresh lobby for one socket.
		refresh (socket) {
			if (this.list.length === 0) {
				socket.emit('refreshLobby', []);
			}
			socket.emit('refreshLobby', this.list);
		},

		// Refresh lobby for all.
		refreshAll (socket) {
			if (this.list.length === 0) {
				socket.server.sockets.emit('refreshLobby', []);
			}
			socket.server.sockets.emit('refreshLobby', this.list);
		},

		// Refresh one room for all.
		refreshOneRoomAll ({socket, room}) {
			socket.server.sockets.emit('roomChanged', room);
		},
		// Add one room for all.
		addOneRoomAll ({socket, room}) {
			socket.server.sockets.emit('roomAdded', room);
		},
		// Remove one room for all.
		removeOneRoomAll ({socket, id}) {
			socket.server.sockets.emit('roomRemoved', id);
		},
	},
}).compose(EventEmittable);

let Rooms = GameRooms()

module.exports = Rooms;
