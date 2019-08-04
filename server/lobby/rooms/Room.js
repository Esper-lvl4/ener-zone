const GameState = require('./../game/Game_State');
const BoardState = require('./../game/Board_State');
const State = require('./../../state/State');
const stampit = require('stampit');
const EventEmittable = require('@stamp/eventemittable');
const {cloneObject, cloneArray} = require('./../../tools/tools');

let Room = stampit({
	init(socket, roomObj, id) {
		this.players = [];
		this.spectators = [];
		this.name = roomObj.name;
		this.settings = roomObj.settings;
		/*
		{
			format: 'as',
			timeLimit: '180',
			password: '',
		}
		*/
		this.id = id + '';
		this.socketRoom = 'room-' + id;
		this.state = false;
		this.initiated = false;
		this.chat = [];

		this.on('join', this.join);
		this.on('leave', this.leave);
		this.on('closing', this.clearUsers);
	},
	methods: {
		refresh(socket) {
			let roomClone = this.clear();
			socket.to(this.socketRoom).emit('refreshRoom', roomClone);
			socket.emit('refreshRoom', roomClone);
		},
		clear() {
			// Clone room, then remove tokens, to not send them, and dont affect initial room object.
			let roomClone = cloneObject(this);
			roomClone.players.forEach((player) => {
				delete player.token;
			})
			roomClone.spectators.forEach((spectator) => {
				delete spectator.token;
			})
			return roomClone;
		},

		join({socket, user}) {
			// check if there is space for more players.
			if (this.isFull() && info.role !== 'spectator') {
				socket.emit('errorMessage', 'The room is full. You can spectate this game, if you want, though.');
				return false;
			} else if (user.role == 'player' || user.role == 'host') {
				this.players.push(user);
			} else {
				this.spectators.push(user);
			}
			socket.join(this.socketRoom);
			return true;
		},

		leave(socket) {
			let token = socket.handshake.query.token;
			for (let i = 0; i < this.players.length; i++) {
				if (this.players[i].token === token) {
					this.players[i].room = null;
					this.players.splice(i, 1);
				}
			}
			for (let i = 0; i < this.spectators.length; i++) {
				if (this.spectators[i].token === token) {
					this.spectators[i].room = null;
					this.spectators.splice(i, 1);
				}
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
					if (this.spectators[i].isHost) {
						return false;
						break;
					}
				}
			}
			return true;
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
			for (let player of this.players) {
				if (player.token === token) {
					return player;
				}
			}
		},
		setPlayerReady(socket, value) {
			for (let player of this.players) {
				if (socket.handshake.query.token == player.token) {
					player.ready = value;
				}
			}
		},
		start() {
			this.init();
			this.state = true;
		},
	}
}).compose(EventEmittable, GameState, BoardState);

module.exports = Room;
