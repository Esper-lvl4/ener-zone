function Game (socket, io) {
	socket.on('game-started', function (data) {
		console.log('game-started');
	});
}

module.exports = Game;
