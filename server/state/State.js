const jwt = require('jsonwebtoken');
const User = require('./users/User');
const stampit = require('stampit');
const EventEmittable = require('@stamp/eventemittable');
const {showError} = require('./../tools/tools');

let UserState = stampit({
	init({nickname, id}) {
		this.id = id;
		this.nickname = nickname;
	},
	props: {
		id: '',
		nickname: '',
		ready: false,
		gameHasStarted: false,
		deck: null,
		role: '',
		room: null,
	},
}).compose(EventEmittable);

let UserList = stampit({
	init() {
		this.pool = [];
		console.log('init state...');
	},
	methods: {
		// Two methods to keep track of users.
		async check(socket) {
			let check = false;

			if (!this.getUser(socket)) {
				await this.getUserFromDB(socket).then(
					({id, nickname}) => {
						this.pool.push(UserState({nickname, id}));
						check = true;
					}, (err) => {
						showError('State(check): Could not get user from DB!');
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
			if (!token || token === 'null') {
				socket.emit('errorMessage', 'No token!');
				return false;
			}

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
			}

			return this.getUserById(decoded.payload.id);
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
			let token = socket.handshake.query.token;
			if (!token || token === 'null') {
				showError('State(remove): Cant remove user without a token!');
				socket.emit('successLogout', 'There was no token.');
				return false;
			}

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token.', socket);
				return false;
			}
			for (let i = 0; i < this.pool.length; i++) {
				if (decoded.payload.id === this.pool[i].id) {
					user = this.pool[i];
					this.pool.splice(i, 1);
					return user;
				}
			}
		},
		/*****/

		async getUserFromDB(socketOrId, opt = {returnAll: false, returnExact: false}) {
			let id = null;
			if (typeof socketOrId === 'object') {
				let token = socketOrId.handshake.query.token;
				if (!token || token === 'null') {
					showError('No token!', socketOrId);
				}
				let decoded = jwt.decode(token, {complete: true});
				if (!decoded) {
					showError('Failed to decode token.', socketOrId);
				}
				id = decoded.payload.id;
			} else if (typeof socketOrId === 'string') {
				id = socketOrId
			}

			let userData = null;
			await User.findOne({_id: id}).then((user) => {
				try {
					if (!user) {
						showError('User without a document in DB got token.');
					}
					if (opt.returnAll) {
						userData = user;
					} else if (opt.returnExact) {
						userData = user[opt.returnExact];
					} else {
						userData = {id: user._id + '', nickname: user.nickname};
					}
				} catch (error) {
					console.error(error);
				}
			}).catch((err) => {
				showError('Error, when tried to find user.')
				console.error(err);
			});
			return userData;
		}
	}
}).compose(EventEmittable);

module.exports = UserList();
