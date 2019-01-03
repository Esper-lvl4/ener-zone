const jwt = require('jsonwebtoken');
const User = require('./User');

const Users = {

	state: [
		// store user's state here.
		// {nick: 'KappaLord', token: '', location: '/lobby'},
	],

	// Check if state of user is tracked. If not - start tracking it.
	checkState: async function (socket) {
		let check = false;
		for (let i = 0; i < this.state.length; i++) {
			if (socket.handshake.query.token == this.state[i].token) {
				check = true;
				break;
			}
		}
		if (!check) {
			this.state.push({
				nick: await this.setNickname(socket), 
				token: socket.handshake.query.token, 
				location: socket.nsp.name,
			});
			console.log(this.state);
		} else {
			console.log("already tracking this user's state");
		}
		return check;
	},

	// Set nickname to user's object in Users.state.

	setNickname: function (sock) {
		const socket = sock; // to make socket visible in promise.

		return new Promise ((resolve, reject) => {
			let token = socket.handshake.query.token;
			if (!token) {
				socket.emit('success-logout', 'no token');
				reject('no token');
			}
			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				console.log('failed to decode token');
				reject('cant decode');
			}
			User.findOne({_id: decoded.payload.id}, function (err, user) {
				if (err) {
					socket.emit('error-message', 'Error, when tried to find a user.');
					reject('user err');
				}
				if (!user) {
					socket.emit('success-logout', 'User without a document in DB got token.');
					reject('User without a document in DB got token.');
				}
				resolve(user.nickname);
			});
		})																												
	},

	// Handler for changes in user's state. Below are functions, that gets executed by this.
	updateState: function (socket, action) {
		//const socket = sock;
		let args;
		if (arguments.length > 2) {
			args = [].slice.call(arguments);
			args = args.slice(2);
		}
		this[action](socket, args);
	},

	// Change location of the user.
	move: function (socket, args) {
		for (let i = 0; i < this.state.length; i++) {
			if (socket.handshake.query.token == this.state[i].token) {
				this.state[i].location = args[0];
				break;
			}
		}
		console.log('movedTo');
	},

	// Change nickname of the user.
	rename: function (socket, args) {
		for (let i = 0; i < this.state.length; i++) {
			if (socket.handshake.query.token == this.state[i].token) {
				this.state[i].nick = args[0];
				break;
			}
		}
		console.log('rename');
	},

	// Remove user from state, when he leaves the client.
	remove: function (socket, args) {
		for (let i = 0; i < this.state.length; i++) {
			if (args[0] == this.state[i].token) {
				this.state.splice(i, 1);
				break;
			}
		}
		console.log('remove');
	},

	getUser: async function (socket) {
		let token = socket.handshake.query.token;
		if (!token) {
			console.log('no token');
			return;
		}
		let decoded = jwt.decode(token, {complete: true});
		if (!decoded) {
			console.log('failed to decode token');
			return;
		}
		let userData = null;
		await User.findOne({_id: decoded.payload.id}, function (err, user) {
			if (err) {
				socket.emit('something-wrong', 'Error, when tried to find user.')
				return;
			}
			if (!user) {
				socket.emit('success-logout', 'User without a document in DB got token.');
				return;
			}
			userData = {id: user._id, nickname: user.nickname};
		});
		return userData;
	}
}

module.exports = Users;
