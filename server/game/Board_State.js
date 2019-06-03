function SigniZone() {
	let prototype = {
		card: null,
		under: [],
		status: '',
		down: false,
		tooltip: '',

		exceed(index) {
			this.under.splice(index, 1);
		},
		inceed(card) {
			this.under.push(card);
		},
		rotate() {
			this.down = !this.down;
		},
		setStatus(status) {
			this.status = status;
		},
		setTooltip(tooltip) {
			this.tooltip = tooltip;
		},
	}
	return Object.create(prototype);
}

function LrigZone () {
	let signiZoneObj = SigniZone();
	let prototype = {
		key: [],
	}
	prototype = Object.assign(prototype, signiZoneObj.prototype);
	return Object.create(prototype);
}

function PlayerField (playerId) {
	let prototype = {
		playerIndex: null,
		lrigTrash: [],
		trash: [],
		mainDeck: [],
		lrigDeck: [],
		lrigZone: null,
		lifeCloth: [],
		checkZone: [],
		enerZone: [],
		signiZones: [],
		removedZone: [],
		hand: [],
		excluded: [],

		async moveCard(originalZone, destinationZone) {
			// originalZone: {name, type, index, signiIndex}
			// destinationZone: {name, type, signiIndex}
			// validation.
			try {
				if (!(originalZone && destinationZone)) {
					throw new Error('moveCard: no zones were provided');
				} else if (!(originalZone.index && originalZone.name && destinationZone.name)) {
					throw new Error('moveCard: not enough info about zones');
				} else if (!originalCard[cardIndex]) {
					throw new Error('moveCard: card is not in its original zone');
				}

				// removed card is saved in the variable;
				let card = await this.removeCard(originalZone);
				await this.addCard(card, destinationZone);
			} catch (err) {
				console.log(err);
			}
		},
		async removeCard(zone) {
			let {index, name, type, signiIndex} = zone;
			index = +index;
			signiIndex = +signiIndex;
			if (!name) {
				throw new Error('removeCard: no zone name was provided');
			}
			let card = null;
			// If card were moved from lrig zone, apply special rules. Use different rules for signi zone, and another set of rules for everything else.
			if (name == 'lrigZone') {
				// Lrig zone rules.
				if (type == 'lrig') {
					card = this.lrigZone.card;
					this.lrigZone.card = null;
				} else if (type == 'key') {
					card = this.lrigZone.key;
					this.lrigZone.key.splice(index, 1);
				} else {
					// if it's a card under lrig
					card = this.lrigZone.under[index];
					this.lrigZone.exceed(index);
				}
			} else if (name == 'signiZones') {
				if (type == 'signi') {
					card = this.signiZones[signiIndex].card;
					this.signiZones[signiIndex].card = null;
				} else {
					// if it's a card under signi
					card = this.signiZones[signiIndex].under[index];
					this.signiZones[signiIndex].exceed(index, 1);
				}
			} else {
				// standart iteraction.
				if (!index) {
					throw new Error('removeCard: no index of the target card was provided');
				}
				card = this[name][index];
				this[name].splice(index, 1);
			}
			return card;
		},
		async addCard(card, zone) {
			if (!card) {
				throw new Error('addCard: No card was provided');
			} else if (!zone) {
				throw new Error('addCard: No zone was provided');
			}
			let {name, type, signiIndex} = zone;
			signiIndex = +signiIndex;
			if (name == 'lrigZone') {
				// Lrig zone rules.
				if (type == 'lrig') {
					this.lrigZone.card = card;
				} else if (type == 'key') {
					this.lrigZone.key.push(card);
				} else {
					// if it's a card under lrig
					this.lrigZone.inceed(card);
				}
			} else if (name == 'signiZones') {
				if (type == 'signi') {
					this.signiZones[signiIndex].card = card;
				} else {
					// if it's a card under signi
					this.signiZones[signiIndex].inceed(card);
				}
			} else {
				// standart iteraction.
				this[name].push(card);
			}
		},
		async addToken(name, zone) {

		},
	}

	for (let i = 1; i <= 3; i++) {
		prototype.signiZones.push(SigniZone());
	}
	prototype.lrigZone = LrigZone();
	prototype.playerIndex = playerId;

	return Object.create(prototype);
}

function BoardState (players) {
	let prototype = {
		board: [],
		async delegateAction(originalZone, destinationZone, socket, action) {
			let player = this.getPlayer(socket);
			if (!player) return;

			for (let field of board) {
				if (field.playerIndex == player.id) {
					await field[action](originalZone, destinationZone);
					break;
				}
			}
		},
	}
	for (let i = 0; i < players.length; i++) {
		board.push(PlayerField(players[i].id));
	}
	return Object.create(prototype);
}

module.exports = BoardState;
