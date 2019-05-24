class SigniZone  {
	constructor() {
		this.card = null;
		this.under = [];
		this.status = '';
		this.down = false;
		this.tooltip = '';
	}
	exceed(index) {
		this.under.splice(index, 1);
	}
	inceed(card) {
		this.under.push(card);
	}
	rotate() {
		this.down = !this.down;
	}
	setStatus(status) {
		this.status = status;
	}
	setTooltip(tooltip) {
		this.tooltip = tooltip;
	}
}

class LrigZone extends SigniZone  {
	constructor() {
		super();
		this.key: null,
	}
}

class BoardState {
	constructor() {
		this.lrigTrash = [];
		this.trash = [];
		this.mainDeck = [];
		this.lrigDeck = [];
		this.lrigZone = new LrigZone();
		this.lifeCloth = [];
		this.checkZone = [];
		this.enerZone = [];
		this.signiZones = [];
		for (let i = 1; i < 3; i++) {
			this.signiZones.push(new SigniZone());
		}
		this.removedZone = [];
		this.hand = [];
	}

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
	}
	async removeCard({index, name, type, signiIndex}) {
		if (!index) {
			throw new Error('removeCard: no index of the target card was provided');
		} else if (!name) {
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
				this.lrigZone.key = null;
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
			card = this[name][index];
			this[name].splice(index, 1);
		}
		return card;
	}
	async addCard(card, zone) {
		if (!card) {
			throw new Error('addCard: No card was provided');
		} else if (!zone) {
			throw new Error('addCard: No zone was provided');
		}
		let {name, type, signiIndex} = zone;
		if (name == 'lrigZone') {
			// Lrig zone rules.
			if (type == 'lrig') {
				this.lrigZone.card = card;
			} else if (type == 'key') {
				this.lrigZone.key = card;
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
	}
	async addToken(name, zone) {

	}

	// common actions.
	async draw (number) {
		for (let i = 1; i <= number; i++) {
			await this.moveCard(
				{name: 'mainDeck', index: 0},
				{name: 'hand'}
			)
		}
	}
	async discard (index) {
		await this.moveCard(
			{name: 'hand', index: index},
			{name: 'trash'}
		)
	}
	async enerChange (number) {
		for (let i = 1; i <= number; i++) {
			await this.moveCard(
				{name: 'mainDeck', index: 0},
				{name: 'enerZone'}
			)
		}
	}
	async chargeHand(index) {
		await this.moveCard(
			{name: 'hand', index: index},
			{name: 'enerZone'}
		)
	}
	async callSigni(handIndex, zoneIndex) {
		await this.moveCard(
			{name: 'hand', index: handIndex},
			{name: 'signiZones', type: 'signi', zoneIndex}
		)
	}
}

module.exports = BoardState;
