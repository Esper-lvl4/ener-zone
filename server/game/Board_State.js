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
		this.key = [];
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
		this.excluded = [];
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
	}
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

	// Excludes, moving cards to trash, paying costs, life bursts, spell/arts usage
	async moveToZone(zone, index, targetZone) {
		await this.moveCard(
			{name: zone, index: index},
			{name: targetZone}
		)
	}

	// Signi Zone actions.
	async callSigni(handIndex, zoneIndex) {
		await this.moveCard(
			{name: 'hand', index: handIndex},
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex}
		)
	}
	async banishSigni(zoneIndex) {
		await this.moveCard(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'enerZone'}
		)
	}
	async trashSigni(zoneIndex) {
		await this.moveCard(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'trash'}
		)
	}
	async excludeSigni(zoneIndex) {
		await this.moveCard(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'excluded'}
		)
	}
	async returnSigni(zoneIndex) {
		await this.moveCard(
			{name: 'signiZones', type: 'signi', signiIndex: zoneIndex},
			{name: 'hand'}
		)
	}

	// Lrig Zone actions.
	async growLrig(index) {
		await this.moveCard(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigZone'}
		)
		await this.moveCard(
			{name: 'lrigDeck', index: index},
			{name: 'lrigZone', type: 'lrig'}
		)
	}
	async returnLrig() {
		await this.moveCard(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigDeck'}
		)
	}
	async removeLrig() {
		await this.moveCard(
			{name: 'lrigZone', type: 'lrig'},
			{name: 'lrigTrash'}
		)
	}
	async payExceed(index) {
		await this.moveCard(
			{name: 'lrigZone', index: index},
			{name: 'lrigTrash'}
		)
	}
	async playKey(index) {
		await this.moveCard(
			{name: 'lrigDeck', index: index},
			{name: 'lrigZone', type: 'key'}
		)
	}
	async removeKey(index) {
		await this.moveCard(
			{name: 'lrigZone', type: 'key', index: index},
			{name: 'lrigTrash'}
		)
	}
	async returnKey(index) {
		await this.moveCard(
			{name: 'lrigZone', type: 'key', index: index},
			{name: 'lrigDeck'}
		)
	}

	// Uncommon movements to Lrig or signi zone
	async moveToLrigZone(name, index, type) {
		await this.moveCard(
			{name, index},
			{name: 'lrigZone', type}
		)
	}
	async moveToSigniZone(name, index, type, signiIndex) {
		await this.moveCard(
			{name, index},
			{name: 'signiZones', type, signiIndex}
		)
	}

	// Token creation
	async createToken(tokenId) {
		let card = {} // call to database, await.
		await this.addCard(card, {name: 'checkZone'})
	}

}

module.exports = BoardState;
