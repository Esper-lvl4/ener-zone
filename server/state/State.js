const jwt = require('jsonwebtoken');
const User = require('./users/User');
const Rooms = require('./../lobby/rooms/Game_Rooms');
const stampit = require('stampit');
const EventEmittable = require('@stamp/eventemittable');
const {showError} = require('./../tools/tools');

// let obj = stampit({
// 	methods: {
// 		rip() {
// 			this.emit('rip', 'rest pls');
// 		}
// 	}
// }).compose(EventEmittable)();
//
// obj.on('rip', (data) => {
// 	console.log(data);
// })
//
// obj.rip();

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
	},
	methods: {
		leave(nick) {
			state.emit('custom-event', nick);
		}
	}
}).compose(EventEmittable);

let UserList = stampit({
	init() {
		this.pool = [];
		this.rooms = Rooms;
		console.log('init state...');
		this.on('custom-event', this.kappa);
	},
	methods: {
		kappa (data) {
			console.log(data);
		},
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

		},

		// Methods for getting the user by socket or id.

		getUser(socketOrId) {
			if (typeof socketOrId == 'object') {
				getUserBySocket(socketOrId);
			} else if (typeof socketOrId == 'string') {
				getUserById(socketOrId);
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


		checkToken(socket) {
			let token = socket.handshake.query.token;
			if (!token) {
				showError('No token!', socket);
				return false;
			}
			return token;
		},

		// Hosting a game in game rooms. This method is here, because we need to move users from here to the newly created roomю
		async hostRoom(socket, roomObj) {
			let user = this.getUser(socket);
			user.role = 'host';
			let room = await Rooms.add(socket, roomObj, user);
			this.moveUser(socket, room, true);

			// clone room and remove tokens from clone - then send it to client;
			let roomClone = room.clear();
			socket.join(room.socketRoom);
			socket.emit('joiningRoom', roomClone);
			Rooms.refreshAll(io);
		},
		joinRoom(socket, room) {
			let success = State.moveUser(socket, room, true);
			if (success) {
				let roomClone = room.clear();
				socket.emit('joiningRoom', roomClone);
				socket.to(room.socketRoom).emit('refreshRoom', roomClone);
				Rooms.refreshAll(io);
			}
		},

		// Change location of the user.
		moveUser(socket, room, join) {
			if (join) {
				let user = this.remove(socket);
				return room.join(user);
			} else {
				let user = room.leave(socket);
				user.ready = false;
				user.role = '';
				user.deck = null;
				this.pool.push(user);

				Rooms.checkEmptiness();
			}
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
