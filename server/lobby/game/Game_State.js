const State = require('./../../state/State');
const CardDB = require('./../../database/CardDB');
const PlayerField = require('./../game/Player_Field');
const GlobalSocket = require('./../../global_socket/Global_Socket');
const EventEmittable = require('@stamp/eventemittable');
const stampit = require('stampit');
const {showError, randomNumber} = require('./../../tools/tools');

let GameState = stampit({
	init({id = '', socketRoom = '', settings = {}, players = [], spectators = []}) {
		this.id = id;
		this.socketRoom = socketRoom;
		this.settings = settings;
		this.players = players;
		this.spectators = spectators;
		this.board = [];
		for (let player of this.players) {
			this.board.push(PlayerField(player));
		}
		this.initDecks();
		GlobalSocket.broadcastToRoom({room: this.socketRoom, eventName: 'restoreGame', data: this})
	},
	props: {
		id: '',
		socketRoom: '',
		settings: null,
		players: null,
		spectators: null,
		phase: 'Draw phase',
		turnPlayer: 1,
		board: null,
	},
	methods: {
		async initDecks () {
			for (let player of this.players) {
				let mainDeck = [], lrigDeck = [];
				let currentDeck = player.deck;
				// let user = await State.getUserFromDB(player.id, {returnExact: 'decks'});

				// for (let deck of user.decks) {
				// 	if (player.deck === deck.name) {
				// 		currentDeck = deck;
				// 		break;
				// 	}
				// }
				if (!currentDeck) {
					showError('Game_State(initDecks): Deck were not found!');
					return false;
				}
				for (let id of currentDeck.mainDeck) {
					await CardDB.findById(id.replace(/\(_\d_\)/, ''), (err, card) => {
						if (err) console.error(err);
						if (card) {
							let quantity = +id.match(/\(_\d_\)$/)[0].replace(/\D/g, '');
							if (isNaN(quantity)) return;
							for (let i = 1; i <= quantity; i++) {
								mainDeck.push(card);
							}
						}
					});
				}

				for (let id of currentDeck.lrigDeck) {
					await CardDB.findById(id.replace(/\(_\d_\)/, ''), (err, card) => {
						lrigDeck.push(card);
					});
				}

				for (let field of this.board) {
					if (field.player == player) {
						console.log(player.nickname);
						field.mainDeck = mainDeck;
						field.lrigDeck = lrigDeck;
						console.log(field);
						break;
					}
				}
			}
			GlobalSocket.broadcastToRoom({room: this.socketRoom, eventName: 'decksReady', data: this});
		},
		async delegateAction(originalZone, destinationZone, socket, action) {
			let player = this.getPlayer(socket);
			if (!player) return;

			for (let field of board) {
				if (field.player.id === player.id) {
					await field[action](originalZone, destinationZone);
					break;
				}
			}
		},
		getPlayer(socket) {
			let token = socket.handshake.query.token;
			if (!token || token === 'null') {
				showError('Token were not provided!');
				socket.emit('successLogout');
				return false;
			}

			let decoded = jwt.decode(token, {complete: true});
			if (!decoded) {
				showError('Failed to decode token!', socket);
				return false;
			}

			for (let user of this.players) {
				if (user.id === decoded.payload.id) {
					return user;
				}
			}
			return false;
		},
		changePhase(phase) {
			this.phase = phase;
		},
		nextTurn(player) {
			this.turnPlayer = player;
		},
		newMessage(msg) {
			let date = new Date();
			let message = msg;
			message.date = `${date.getHours()}:${date.getMinutes()}`
			this.chat.push(message);
		},
		getUserIndex(user) {
			for (let [player, index] of this.players.entries()) {
				if (player.nickname === user.nickname) {
					return {list: this.players, index: index};
					break;
				}
			}
			for (let [spectator, index] of this.spectators.entries()) {
				if (spectator.nickname === user.nickname) {
					return {list: this.spectators, index: index};
					break;
				}
			}
			return false;
		},
		joinGame(user) {
			if (user.role == 'spectator') {
				this.spectators.push(user);
			} else {
				this.players.push(user);
			}
		},
		leaveGame(user) {
			let info = this.getUserIndex(user);
			if (info) {
				this[info.list].splice(info.index, 1);
			}
		},
		coinFlip() {
			if (randomNumber(1) === 1) {
				return true;
			} else {
				return false;
			}
		},

		refreshGame(socket) {
			socket.to(this.socketRoom).emit('refreshGame', this);
		}
	}
}).compose(EventEmittable);

module.exports = GameState;
