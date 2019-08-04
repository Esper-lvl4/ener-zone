const jwt = require('jsonwebtoken');
const User = require('./users/User');
const Rooms = require('./../lobby/rooms/Game_Rooms');
const stampit = require('stampit');
const EventEmittable = require('@stamp/eventemittable');
const {showError} = require('./../tools/tools');

let UserState = stampit({
	init({nickname, socket, id}) {
		this.id = id;
		this.socket = socket;
		this.nickname = nickname;
		this.token = socket.handshake.query.token;
		this.ready = false;
		this.gameHasStarted = false;
		this.deck = null;
		this.role = '';
		this.room = null;
	}
}).compose(EventEmittable);

let UserList = stampit({
	init() {
		this.pool = [];
		this.rooms = Rooms;
		console.log('init state...');
		this.on('player-ready', this.playerReady);
	},
	methods: {
		// Two methods to keep track of users.
		async check(socket) {
			let check = false;

			if (!this.getUser(socket)) {
				await this.getUserFromDB(socket).then(
					({id, nickname}) => {
						this.pool.push(UserState({nickname, socket, id}));
						this.pool[0].poke(nickname);
						check = true;
					}, (err) => {
						socket.emit('successLogout');
					});
			}
			return check;
		},

		removeUserState(id) {
			for (let i = 0; i < this.pool.length; i++) {
				if (this.pool[i].id === id) {
					this.pool.splice(i, 1);
					break;
				}
			}
		},

		// Load deck of user.
		loadDeck(socket, name) {
			let user = this.getUser(this.handshake.query.token);
			if (!user) {
				this.emit('errorMessage', "State: User is not tracked!");
			} else {
				user.deck = name;
				user.room.refresh(this);
			}
		},

		// Player ready.

		playerReady ({socket, value}) {
			if (value === undefined) return;
			let user = this.getUser(socket);

			if (!user) {
				socket.emit('errorMessage', "State: User is not tracked!");
			} else {
				user.ready = value;
				user.room.refresh(this);
			}
		},

		// Methods for getting the user by socket or id.

		getUser(socketOrId) {
			if (typeof socketOrId == 'object') {
				return this.getUserBySocket(socketOrId);
			} else if (typeof socketOrId == 'string') {
				return this.getUserById(socketOrId);
			}
		},

		getUserBySocket(socket) {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('errorMessage', 'No token!');
				return false;
			}

			for (let user of this.pool) {
				if (user.token === token) {
					return user;
				}
			}
			return false;
		},

		getUserById(id) {
			for (let user of this.pool) {
				if (user.id === id) {
					return user;
				}
			}
			return false;
		},

		// Remove user from state, when he leaves the client.
		remove(socket) {
			let user = null;
			for (let i = 0; i < this.pool.length; i++) {
				if (socket.handshake.query.token === this.pool[i].token) {
					user = this.pool[i];
					this.pool.splice(i, 1);
					return user;
				}
			}
		},
		/*****/

		async getUserFromDB(socket, opt = {returnAll: false, returnExact: false}) {
			let token = socket.handshake.query.token;
			if (!token) {
				showError('No token!', socket);
			}
			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
			}
			let userData = null;
			await User.findOne({_id: decoded.payload.id}).then((user) => {
				if (!user) {
					showError('User without a document in DB got token.', socket);
					socket.emit('successLogout');
				}
				if (opt.returnAll) {
					userData = user;
				} else if (opt.returnExact) {
					userData = user[opt.returnExact];
				} else {
					userData = {id: user._id + '', nickname: user.nickname, token: token};
				}
			}, (err) => {
				socket.emit('errorMessage', 'Error, when tried to find user.')
				console.log(err);
			});
			return userData;
		}
	}
}).compose(EventEmittable);

module.exports = UserList();
