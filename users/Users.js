const jwt = require('jsonwebtoken');
const User = require('./User');

const Users = {

	// Set nickname to clients localStorage, if they have no it there stored already.
	setNickname: function (socket) {
		if (socket.handshake.query.nickname === 'null' || !socket.handshake.query.nickname) {
			let token = socket.handshake.query.token;
			let decoded = jwt.decode(token, {complete: true});
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
	}
}

module.exports = Users;
