const jwt = require('jsonwebtoken');

var key = {
	'secret': 'kappadin',
}

function verifyToken (socket, next) {
	let token = socket.handshake.query.token;

	if (!token) { 
		return next(new Error('There is no token.'));
	}
	jwt.verify(token, key.secret, function (err, decoded) {
		if (err) {
			return next(new Error('Invlaid token.'));
		}
		return next();
	})
};

module.exports = verifyToken;