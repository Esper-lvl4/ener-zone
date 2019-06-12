const jwt = require('jsonwebtoken');
const User = require('./User');

function UserState(nick, token, location = '/') {
	let prototype = {
		nick: nick,
		token: token,
		location: location,
		room: null,
		ready: false,
	}
	return Object.create(prototype);
}

function Users () {
	let prototype = {
		state: [],

		// Check if state of user is tracked. If not - start tracking it.
		async checkState(socket) {
			let check = false;
			let token = socket.handshake.query.token;
			for (let i = 0; i < this.state.length; i++) {
				if (token == this.state[i].token) {
					check = true;
					break;
				}
			}
			if (!check) {
				let nickname = await this.setNickname(socket).then((nick)=> {return nick;}, (err) => {
					return false;
				})
				if (!nickname) {
					return false;
				}
				this.state.push(UserState(nickname, token, socket.nsp.name,));
			}
			return check;
		},

		getUserState(socket) {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('successLogout', 'no token');
			}
			let result = false;
			for (let i = 0; i < this.state.length; i++) {
				if (this.state[i].token === token) {
					result = this.state[i];
					break;
				}
			}
			return result;
		},

		// Set nickname to user's object in Users.state.

		setNickname(sock) {
			const socket = sock; // to make socket visible in promise.

			return new Promise ((resolve, reject) => {
				let token = socket.handshake.query.token;
				if (!token) {
					socket.emit('successLogout', 'no token');
					reject('no token');
				}
				let decoded = jwt.decode(token, {complete: true});
				if (!decoded) {
					socket.emit('errorMessage', 'failed to decode token');
					reject('cant decode');
				}
				User.findOne({_id: decoded.payload.id}, function (err, user) {
					if (err) {
						socket.emit('errorMessage', 'Error, when tried to find a user.');
						reject('user err');
					}
					if (!user) {
						socket.emit('successLogout', 'User without a document in DB got token.');
						reject('User without a document in DB got token.');
					}
					resolve(user.nickname);
				});
			})
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
		move(socket, args) {
			let [location] = args;
			for (let i = 0; i < this.state.length; i++) {
				if (socket.handshake.query.token == this.state[i].token) {
					this.state[i].location = location;
					break;
				}
			}
		},

		// Change nickname of the user.
		rename(socket, args) {
			let [nick] = args;
			for (let i = 0; i < this.state.length; i++) {
				if (socket.handshake.query.token == this.state[i].token) {
					this.state[i].nick = nick;
					break;
				}
			}
		},

		// Remove user from state, when he leaves the client.
		remove(socket, args) {
			let [token] = args;
			for (let i = 0; i < this.state.length; i++) {
				if (token == this.state[i].token) {
					this.state.splice(i, 1);
					break;
				}
			}
		},

		changeRoom(socket, args) {
			let [roomName] = args;
			for (let i = 0; i < this.state.length; i++) {
				if (socket.handshake.query.token == this.state[i].token) {
					this.state[i].room = roomName;
				}
			}
		},

		ready(socket, args) {
			let [value] = args;
			for (let i = 0; i < this.state.length; i++) {
				if (socket.handshake.query.token == this.state[i].token) {
					this.state[i].ready = value;
				}
			}
		},
		/*****/

		getUser(socket, opt = {returnAll: false, returnExact: false}) {
			return new Promise ((resolve, reject) => {
				let token = socket.handshake.query.token;
				if (!token) {
					socket.emit('errorMessage', 'No token');
					reject('no token');
				}
				let decoded = jwt.decode(token, {complete: true});
				if (!decoded) {
					socket.emit('errorMessage', 'Failed to decode token');
					reject('failed to decode token');
				}
				let userData = null;
				User.findOne({_id: decoded.payload.id}, function (err, user) {
					if (err) {
						socket.emit('errorMessage', 'Error, when tried to find user.')
						reject('Error, when tried to find user.');
					}
					if (!user) {
						socket.emit('successLogout', 'User without a document in DB got token.');
						reject('User without a document in DB got token.');
					}
					if (opt.returnAll) {
						userData = user;
					} else if (opt.returnExact) {
						userData = user[opt.returnExact];
					} else {
						userData = {id: user._id + '', nickname: user.nickname, token: token};
					}
					resolve(userData);
				});
			});
		},
	}
	return Object.create(prototype);
}

module.exports = Users();
