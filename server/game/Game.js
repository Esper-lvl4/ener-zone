const Rooms = require('../rooms/Game_Rooms');
const Game_State = require('./Game_State');

function Game (socket, io) {
	// Function for refreshing game.
	let room = Rooms.getByToken(socket.handshake.query.token).room;
	let board;

	if (room) {
		if (room.state) gameStarted();
	}


	function refresh() {
		socket.to(room.socketRoom).emit('refreshGame', room);
		socket.emit(refreshGame, room);
	}

	// common actions.
	async function draw (number) {
		for (let i = 1; i <= number; i++) {
			await board.delegateAction(
				{name: 'mainDeck', index: 0},
				{name: 'hand'},
				socket,
				'moveCard'
			)
		}
		refresh();
	}
	async function discard (index) {
		await board.delegateAction(
			{name: 'hand', index: index},
			{name: 'trash'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function enerChange (number) {
		for (let i = 1; i <= number; i++) {
			await board.delegateAction(
				{name: 'mainDeck', index: 0},
				{name: 'enerZone'},
				socket,
				'moveCard'
			)
		}
		refresh();
	}
	async function chargeHand(index) {
		await board.delegateAction(
			{name: 'hand', index: index},
			{name: 'enerZone'},
			socket,
			'moveCard'
		)
		refresh();
	}

	// Excludes, moving cards to trash, paying costs, life bursts, spell/arts usage
	async function moveToZone(zone, index, targetZone) {
		await board.delegateAction(
			{name: zone, index: index},
			{name: targetZone},
			socket,
			'moveCard'
		)
		refresh();
	}

	// Signi Zone actions.
	async function callSigni(handIndex, zoneIndex) {
		await board.delegateAction(
			{name: 'hand', index: handIndex},
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function banishSigni(zoneIndex) {
		await board.delegateAction(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'enerZone'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function trashSigni(zoneIndex) {
		await board.delegateAction(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'trash'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function excludeSigni(zoneIndex) {
		await board.delegateAction(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'excluded'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function returnSigni(zoneIndex) {
		await board.delegateAction(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'hand'},
			socket,
			'moveCard'
		)
		refresh();
	}

	// Lrig Zone actions.
	async function growLrig(index) {
		await board.delegateAction(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigZone'},
			socket,
			'moveCard'
		)
		await board.delegateAction(
			{name: 'lrigDeck', index: index},
			{name: 'lrigZone', type: 'lrig'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function returnLrig() {
		await board.delegateAction(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigDeck'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function removeLrig() {
		await board.delegateAction(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigTrash'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function payExceed(index) {
		await board.delegateAction(
			{name: 'lrigZone', index: index},
			{name: 'lrigTrash'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function playKey(index) {
		await board.delegateAction(
			{name: 'lrigDeck', index: index},
			{name: 'lrigZone', type: 'key'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function removeKey(index) {
		await board.delegateAction(
			{name: 'lrigZone', type: 'key', index: index},
			{name: 'lrigTrash'},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function returnKey(index) {
		await board.delegateAction(
			{name: 'lrigZone', type: 'key', index: index},
			{name: 'lrigDeck'},
			socket,
			'moveCard'
		)
		refresh();
	}

	// Uncommon movements to Lrig or signi zone
	async function moveToLrigZone(name, index, type) {
		await board.delegateAction(
			{name: name, index: index},
			{name: 'lrigZone', type},
			socket,
			'moveCard'
		)
		refresh();
	}
	async function moveToSigniZone(name, index, type, signiIndex) {
		await board.delegateAction(
			{name: name, index: index},
			{name: 'signiZones', type: type, signiIndex: signiIndex},
			socket,
			'moveCard'
		)
		refresh();
	}

	// Token creation

	// async function createToken(tokenId) {
	// 	let card = {} // call to database, await.
	// 	await this.addCard(card, {name: 'checkZone'})
	// }

	/*
		Create game state object, which contains full board.
			- Create state.
			- Handle player rights.
			- Create boards.
			- Fill main decks.
			- Fill lrig decks.
			- Shuffle main decks.
			- Fill token store.
			- Place lvl 0 lrig into lrig zone, face-down.

		Every time, board changes, emit refresh to everyone except an initiator of a refresh.
			- Get event from one of the players.
			- Check, if the move is valid.
			- If move is valid:
				- preform all needed actions, then refresh all, except initiator (including spectators)
				- else: rejects action, then refresh initiator, and send him an error.

		Restrictions:
			- Player can only move his own cards.
				- Though, he can mark his opponents cards with different statuses, like freeze.
			- Spectators can only chat. They dont see either of players hands.
			- Zones are split between public and hidden
				- All users, including spectators, can check cards in public zones.
				- Only the owner of the cards can check hidden zone, but he can only do it if it's not restricted.
			- Facedown cards are only visible to an owner, even if it were revealed already.

		All actions that does not affect boards, are handled by Game State. Others are handled by Board object
	*/

	socket.on('gameStarted', gameStarted);

	// socket handlers

	function gameStarted () {
		console.log('game started');
		board = room.board;

		// Field manipulation events.
		socket.on('drawCard', board.drawCard);
		socket.on('discardCard', board.discardCard);
		socket.on('enerCharge', board.enerCharge);
		socket.on('handCharge', board.chargeHand);

		// Signi manipulation
		socket.on('callSigni', board.callSigni);
		socket.on('banishSigni', board.banishSigni);
		socket.on('trashSigni', board.trashSigni);
		socket.on('excludeSigni', board.excludeSigni);
		socket.on('returnSigni', board.returnSigni);

		// Lrig and keys manipulation
		socket.on('growLrig', board.growLrig);
		socket.on('returnLrig', board.returnLrig);
		socket.on('removeLrig', board.removeLrig);
		socket.on('payExceed', board.payExceed);
		socket.on('playKey', board.playKey);
		socket.on('removeKey', board.removeKey);
		socket.on('returnKey', board.returnKey);

		// Moving between easy zones
		socket.on('moveToZone', board.moveToZone);

		// Uncommon actions, that move cards to signi/lrig zone;
		socket.on('moveToLrigZone', board.moveToLrigZone);
		socket.on('moveToSigniZone', board.moveToSigniZone);

		// Create tokens.
		// socket.on('createToken', board.createToken);
	}
}

module.exports = Game;
