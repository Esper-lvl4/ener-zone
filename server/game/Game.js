const Rooms = require('../rooms/Game_Rooms');
const Game_State = require('./Game_State');

function Game (socket, io) {
	// Function for refreshing game.
	let room = Rooms.getByToken(socket.handshake.query.token).room;
	let board = room.state.getBoard(socket);

	function refresh() {
		socket.to(room.socketRoom).emit('refreshGame', room);
		socket.emit(refreshGame, room);
	}

	// socket handlers

	function gameStarted (data) {
		console.log('game-started');
	}

	socket.on('gameStarted', gameStarted);

	// Field manipulation events.
	socket.on('drawCard', board.drawCard.then(refresh));
	socket.on('discardCard', board.discardCard.then(refresh));
	socket.on('enerCharge', board.enerCharge.then(refresh));
	socket.on('handCharge', board.chargeHand.then(refresh));

	// Signi manipulation
	socket.on('callSigni', board.callSigni.then(refresh));
	socket.on('banishSigni', board.banishSigni.then(refresh));
	socket.on('trashSigni', board.trashSigni.then(refresh));
	socket.on('excludeSigni', board.excludeSigni.then(refresh));
	socket.on('returnSigni', board.returnSigni.then(refresh));

	// Lrig and keys manipulation
	socket.on('growLrig', board.growLrig.then(refresh));
	socket.on('returnLrig', board.returnLrig.then(refresh));
	socket.on('removeLrig', board.removeLrig.then(refresh));
	socket.on('payExceed', board.payExceed.then(refresh));
	socket.on('playKey', board.playKey.then(refresh));
	socket.on('removeKey', board.removeKey.then(refresh));
	socket.on('returnKey', board.returnKey.then(refresh));

	// Moving between easy zones
	socket.on('moveToZone', board.moveToZone.then(refresh));
}

module.exports = Game;
