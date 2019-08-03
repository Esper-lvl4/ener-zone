function showError(msg, socket) {
	if (socket) {
		socket.emit('errorMessage', msg);
	}
	throw new Error(msg);
}

module.exports = {
	showError
}
