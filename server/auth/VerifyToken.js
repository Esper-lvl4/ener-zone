const jwt = require('jsonwebtoken');
const Users = require('../users/Users');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket) {
	let token = socket.handshake.query.token;
	let access = false;

	if (!token) { 
		if (Users.checkState(socket)) {
			Users.updateState(socket, 'remove', token);
		};
		socket.emit('failed-auth', 'There was no token.');
		return access;
	}
	jwt.verify(token, key.secret, function (err, decoded) {
		if (err) {		
			if (Users.checkState(socket)) {
				Users.updateState(socket, 'remove', token);
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