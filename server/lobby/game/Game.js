const Rooms = require('../rooms/Game_Rooms');
const Game_State = require('./Game_State');
const CardDB = require('./../../database/CardDB');
const User = require('./../../state/users/User');
const State = require('./../../state/State');

async function surrender() {
	Rooms.emit('end-game', this);
}

async function leaveGame() {
	Rooms.emit('leave-game', this);
}

// common actions.
async function drawCard ({number}) {
	for (let i = 1; i <= number; i++) {
		await room.delegateAction(
			{name: 'mainDeck', index: 0},
			{name: 'hand'},
			this,
			'moveCard'
		)
	}
}
async function discardCard ({index}) {
	await room.delegateAction(
		{name: 'hand', index: index},
		{name: 'trash'},
		this,
		'moveCard'
	)
}
async function enerCharge ({number}) {
	for (let i = 1; i <= number; i++) {
		await room.delegateAction(
			{name: 'mainDeck', index: 0},
			{name: 'enerZone'},
			this,
			'moveCard'
		)
	}
}
async function chargeHand({index}) {
	await room.delegateAction(
		{name: 'hand', index: index},
		{name: 'enerZone'},
		this,
		'moveCard'
	)
}

// Excludes, moving cards to trash, paying costs, life bursts, spell/arts usage
async function moveToZone({zone, index, targetZone}) {
	await room.delegateAction(
		{name: zone, index: index},
		{name: targetZone},
		this,
		'moveCard'
	)
}

// Signi Zone actions.
async function callSigni({handIndex, zoneIndex}) {
	await room.delegateAction(
		{name: 'hand', index: handIndex},
		{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
		this,
		'moveCard'
	)
}
async function banishSigni({zoneIndex}) {
	await room.delegateAction(
		{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
		{name: 'enerZone'},
		this,
		'moveCard'
	)
}
async function trashSigni({zoneIndex}) {
	await room.delegateAction(
		{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
		{name: 'trash'},
		this,
		'moveCard'
	)
}
async function excludeSigni({zoneIndex}) {
	await room.delegateAction(
		{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
		{name: 'excluded'},
		this,
		'moveCard'
	)
}
async function returnSigni({zoneIndex}) {
	await room.delegateAction(
		{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
		{name: 'hand'},
		this,
		'moveCard'
	)
}

// Lrig Zone actions.
async function growLrig({index}) {
	await room.delegateAction(
		{name: 'lrigZone', type: 'lrig'},
		{name: 'lrigZone'},
		this,
		'moveCard'
	)
	await room.delegateAction(
		{name: 'lrigDeck', index: index},
		{name: 'lrigZone', type: 'lrig'},
		this,
		'moveCard'
	)
}
async function returnLrig() {
	await room.delegateAction(
		{name: 'lrigZone', type: 'lrig'},
		{name: 'lrigDeck'},
		this,
		'moveCard'
	)
}
async function removeLrig() {
	await room.delegateAction(
		{name: 'lrigZone', type: 'lrig'},
		{name: 'lrigTrash'},
		this,
		'moveCard'
	)
}
async function payExceed({index}) {
	await room.delegateAction(
		{name: 'lrigZone', index: index},
		{name: 'lrigTrash'},
		this,
		'moveCard'
	)
}
async function playKey({index}) {
	await room.delegateAction(
		{name: 'lrigDeck', index: index},
		{name: 'lrigZone', type: 'key'},
		this,
		'moveCard'
	)
}
async function removeKey({index}) {
	await room.delegateAction(
		{name: 'lrigZone', type: 'key', index: index},
		{name: 'lrigTrash'},
		this,
		'moveCard'
	)
}
async function returnKey({index}) {
	await room.delegateAction(
		{name: 'lrigZone', type: 'key', index: index},
		{name: 'lrigDeck'},
		this,
		'moveCard'
	)
}

// Uncommon movements to Lrig or signi zone
async function moveToLrigZone({name, index, type}) {
	await room.delegateAction(
		{name: name, index: index},
		{name: 'lrigZone', type},
		this,
		'moveCard'
	)
}
async function moveToSigniZone({name, index, type, signiIndex}) {
	await room.delegateAction(
		{name: name, index: index},
		{name: 'signiZones', type: type, signiIndex: signiIndex},
		this,
		'moveCard'
	)
}

// Token creation

// async function createToken(tokenId) {
// 	let card = {} // call to database, await.
// 	await this.addCard(card, {name: 'checkZone'})
// }

/*
	Create game state object, which contains full boaard.
		- Create state.
		- Handle player rights.
		- Create boaards.
		- Fill main decks.
		- Fill lrig decks.
		- Shuffle main decks.
		- Fill token store.
		- Place lvl 0 lrig into lrig zone, face-down.

	Every time, boaard changes, emit refresh to everyone except an initiator of a refresh.
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

	All actions that does not affect boaards, are handled by Game State. Others are handled by Boaard object
*/

// Functions for initiating the game.

function gameStarted () {
	console.log('game started');
}

// Get player's decks from database.

function Game (socket) {
	socket.on('gameStarted', gameStarted);

	socket.on('surrender', surrender);
	socket.on('leaveGame', leaveGame);

	// Field manipulation events.
	socket.on('drawCard', drawCard);
	socket.on('discardCard', discardCard);
	socket.on('enerCharge', enerCharge);
	socket.on('handCharge', chargeHand);

	// Signi manipulation
	socket.on('callSigni', callSigni);
	socket.on('banishSigni', banishSigni);
	socket.on('trashSigni', trashSigni);
	socket.on('excludeSigni', excludeSigni);
	socket.on('returnSigni', returnSigni);

	// Lrig and keys manipulation
	socket.on('growLrig', growLrig);
	socket.on('returnLrig', returnLrig);
	socket.on('removeLrig', removeLrig);
	socket.on('payExceed', payExceed);
	socket.on('playKey', playKey);
	socket.on('removeKey', removeKey);
	socket.on('returnKey', returnKey);

	// Moving between easy zones
	socket.on('moveToZone', moveToZone);

	// Uncommon actions, that move cards to signi/lrig zone;
	socket.on('moveToLrigZone', moveToLrigZone);
	socket.on('moveToSigniZone', moveToSigniZone);

	// Create tokens.
	// socket.on('createToken', room.createToken);
}

module.exports = Game;
