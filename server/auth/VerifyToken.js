const jwt = require('jsonwebtoken');
const State = require('./../state/State');
const {showError} = require('./../tools/tools');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket) {
	let token = socket.handshake.query.token;

	if (!token || token === 'null') {
		socket.emit('successLogout');
		showError('There was no token!');
		return false;
	}
	jwt.verify(token, key.secret, function (err) {
		if (err) {
			if (State.check(socket)) {
				State.remove(socket);
			};
			socket.emit('successLogout', 'Invalid token');
			return false;
		}

		State.check(socket);
		socket.emit('success-auth', 'Access granted');
		return true;
	});
};

module.exports = verifyToken;
