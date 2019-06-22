const CardDB = require('../database/CardDB');
const User = require('../users/User');
const Users = require('../users/Users');

function DeckEditor (socket) {

	// Return all database.

	function getDatabase (msg) {
		CardDB.find((err, data) => {
			socket.emit('giveDatabase', data);
		});
	}

	// Save deck.

	async function saveDeck (deckToSave) {
		let deck = deckToSave;
		let user = await Users.getUser(socket, {returnAll: true});
		if (!user || !user.decks) {
			socket.emit('errorMessage', 'Could not find a user.');
			return;
		}
		for (let i = 0; i < user.decks.length; i++) {
			if (user.decks[i].name === deck.name) {
				socket.emit('errorMessage', 'The deck with that name already exists');
				return;
			}
		}
		user.decks.push(deck);
		User.updateOne({_id: user._id}, {decks: user.decks}, (err, query) => {
			socket.emit('sentDecks', user.decks);
		});
	}

	function showDecks () {
		Users.getUser(socket, {returnExact: 'decks'}).then((decks) => {
			socket.emit('sentDecks', decks);
		}, (err) => {
			socket.emit('errorMessage', 'Could not find decks.');
		})
	}

	// Load deck. Delete deck.

	function getDeck (deckToShow, action) {
		let deck = deckToShow;
		Users.getUser(socket, {returnAll: true}).then((user) => {
			let decks = user.decks;
			for (let i = 0; i < decks.length; i++) {
				if (decks[i].name === deck) {
					if (action ==='load') {
						socket.emit('loadedDeck', decks[i]);
					} else if (action === 'delete') {
						decks.splice(i, 1);
						socket.emit('deletedDeck', decks);
						User.updateOne({_id: user._id}, {decks: decks}, (err, query) => {
							socket.emit('sentDecks', decks);
						});
					}
					break;
				}
			}
		}, (err) => {
			socket.emit('errorMessage', 'Could not find any deck.');
		})
	}

	socket.on('getDatabase', getDatabase);
	socket.on('saveDeck', saveDeck);
	socket.on('showDecks', showDecks);
	socket.on('getDeck', getDeck);
}

module.exports = DeckEditor;
