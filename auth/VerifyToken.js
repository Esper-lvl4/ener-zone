const jwt = require('jsonwebtoken');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket) {
	let token = socket.handshake.query.token;
	let access = false;
	console.log(token);

	if (!token) { 
		socket.emit('failed-auth', 'There was no token.');
		return access;
	}
	jwt.verify(token, key.secret, function (err, decoded) {
		if (err) {
			socket.emit('failed-auth', 'Invalid token');
		}
		access = true;
		socket.emit('success-auth', 'Access granted');
	})
	return access;
};

module.exports = verifyToken;