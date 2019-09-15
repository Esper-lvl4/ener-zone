const jwt = require('jsonwebtoken');
const State = require('./../state/State');
const {showError} = require('./../tools/tools');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket) {
	let token = socket.handshake.query.token;
	let access = false;

	if (!token || token === 'null') {
		socket.emit('successLogout');
		showError('There was no token!');
		return access;
	}
	jwt.verify(token, key.secret, function (err, decoded) {
		if (err) {
			console.error(err);
			if (State.check(socket)) {
				State.remove(socket);
			};
			socket.emit('successLogout', 'Invalid token');
			return access;
		}

		State.check(socket);
		access = true;
		socket.emit('success-auth', 'Access granted');
	})
	return access;
};

module.exports = verifyToken;
