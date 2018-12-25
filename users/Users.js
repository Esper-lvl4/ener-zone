const jwt = require('jsonwebtoken');
const User = require('./User');

const Users = {

	// Set nickname to clients localStorage, if they have no it there stored already.
	setNickname: function (socket) {
		if (socket.handshake.query.nickname === 'null' || !socket.handshake.query.nickname) {
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
			User.findOne({_id: decoded.payload.id}, function (err, user) {
				if (err) {
					socket.emit('something-wrong', 'Error, when tried to find a user.');
					return;
				}
				if (!user) {
					socket.emit('success-logout', 'User without a document in DB got token.');
					return;
				}
				socket.emit('set-nickname', user.nickname);
			});																												
		}
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
