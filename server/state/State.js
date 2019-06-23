const jwt = require('jsonwebtoken');
const User = require('./User');
const Rooms = require('./../rooms/Game_Rooms');

function UserState(nick, token, socket) {
	let prototype = {

	}
	let props = {
		socket,
		nickname,
		token: socket.handshake.query.token,
		ready: false,
		deck: null,
		role: '',
	}
	let obj = Object.create(prototype);
	obj = Object.assign(obj, props);
	return obj;
}

function State () {
	let props = {
		pool: [],
		rooms: Rooms,
	}

	let prototype = {
		// Check if state of user is tracked. If not - start tracking it.
		async check(socket) {
			let check = false;

			if (!this.getUserLocation(socket)) {
				await this.getUser(socket).then(
					({nickname}) => {
						this.pool.push(UserState(nickname, socket));
						check = true;
					});
			}
			return check;
		},

		checkToken(socket) {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('successLogout');
				return false;
			}
			return token;
		},
		getUserLocation(socket) {
			for (let user of this.pool) {
				if (token == user.token) {
					return 'pool';
				}
			}
			return this.getUserRoom(socket);
		},
		getUserRoom(socket) {
			return this.rooms.getByToken(socket.handshake.query.token);
		},

		getUserState(socket) {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('successLogout', 'no token');
			}

			for (let i = 0; i < this.pool.length; i++) {
				if (this.pool[i].token === token) {
					return {user: this.pool[i], index: i};
				}
			}
			return false;
		},

		// Hosting a game in game rooms. This method is here, because we need to move users from here to the newly created roomю
		async hostRoom(socket, roomObj) {
			let room = await Rooms.add(socket, roomObj);

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

		// Handler for changes in user's state. Below are functions, that gets executed by this.
		updateState(socket, action) {
			let args;
			if (arguments.length > 2) {
				args = [].slice.call(arguments);
				args = args.slice(2);
			}
			this[action](socket, args);
		},

		// Change location of the user.
		moveUser(socket, room, join) {
			if (join) {
				let user = this.remove(socket);
				user.role = 'host';
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
				if (socket.handshake.query.token == this.pool[i].token) {
					user = this.pool[i];
					this.pool.splice(i, 1);
					return user;
				}
			}
		},
		/*****/

		async getUser(socket, opt = {returnAll: false, returnExact: false}) {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('errorMessage', 'No token');
				throw new Error('no token');
			}
			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				socket.emit('errorMessage', 'Failed to decode token');
				throw new Error('failed to decode token');
			}
			let userData = null;
			await User.findOne({_id: decoded.payload.id}).then((err, user) => {
				if (err) {
					socket.emit('errorMessage', 'Error, when tried to find user.')
					throw new Error('Error, when tried to find user.');
				}
				if (!user) {
					socket.emit('successLogout', 'User without a document in DB got token.');
					throw new Error('User without a document in DB got token.');
				}
				if (opt.returnAll) {
					userData = user;
				} else if (opt.returnExact) {
					userData = user[opt.returnExact];
				} else {
					userData = {id: user._id + '', nickname: user.nickname, token: token};
				}
			});
			return userData;
		},
		async getUserByNick(nick) {
			if (!nick) return false;
			let userData = null;
			await User.findOne({nickname: nick}).then((err, user) => {
				if (err) {
					throw new Error('Error, when tried to find user.');
				}
				if (!user) {
					throw new Error('User without a document in DB got token.');
				}
				userData = user;
			});
			return userData;
		}
	}
	let obj = Object.create(prototype);
	obj = Object.assign(obj, props);
	return obj;
}
