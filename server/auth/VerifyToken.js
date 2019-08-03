const jwt = require('jsonwebtoken');
const State = require('./../state/State');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket) {
	let token = socket.handshake.query.token;
	let access = false;

	if (!token) {
		if (State.check(socket)) {
			State.remove(socket);
		};
		socket.emit('failed-auth', 'There was no token.');
		return access;
	}
	jwt.verify(token, key.secret, function (err, decoded) {
		if (err) {
			if (State.check(socket)) {
				State.remove(socket);
			};
			socket.emit('failed-auth', 'Invalid token');
			return access;
		}
		access = true;
		socket.emit('success-auth', 'Access granted');
	})
	return access;
};

module.exports = verifyToken;
