class Player {
	constructor() {
		this.id = user.id;
		this.nickname = user.nickname;
		this.token = user.token;

		this.lrigTrash = [];
		this.trash = [];
		this.mainDeck = [];
		this.lrigDeck = [];
		this.lrigZone = {
			lrig: null,
			key: null,
			under: [],
			status: '',
			state: true, tooltip: '',
		};
		this.lifeCloth = [];
		this.checkZone = [];
		this.enerZone = [];
		this.signiZones = [
			{signi: null, under: [], status: '', state: true, tooltip: '',},
			{signi: null, under: [], status: '', state: true, tooltip: '',},
			{signi: null, under: [], status: '', state: true, tooltip: '',},
		];
		this.removedZone = [];
		this.hand = [];
	}

	moveCard(originalZone, destinationZone) {
		// originalZone: {name, type, index, indexOfSigniZone}
		// destinationZone: {name, type, indexOfSigniZone}
		// validation.
		if (!(originalZone && destinationZone) {
			console.log('moveCard: no zones were provided');
		} else if (!(originalZone.index && originalZone.name && destinationZone.name)) {
			console.log('moveCard: not enough info about zones');
		} else if (!originalCard[cardIndex]) {
			console.log('moveCard: card is not in its original zone');
			return;
		}

		// removed card is saved in the variable;
		let card = this.removeCard(originalZone);
		this.addCard(card, destinationZone);
	},
	removeCard({index, name, type, indexOfSigniZone}) {
		if (!index) {
			console.log('removeCard: no index of the target card was provided');
			return;
		} else if (!name) {
			console.log('removeCard: no zone name was provided');
			return;
		}
		let card = null;
		// If card were moved from lrig zone, apply special rules. Use different rules for signi zone, and another set of rules for everything else.
		if (name == 'lrigZone') {
			// Lrig zone rules.
			if (type == 'lrig' || type == 'key') {
				// if it's key or lrig
				card = this.lrigZone[type];
				this.lrigZone[type] = null;
			} else  {
				// if it's a card under lrig
				card = this.lrigZone.under[index];
				this.lrigZone.under.splice(index, 1);
			}
		} else if (name == 'signiZones') {
			if (type == 'signi') {
				// if it's a signi
				card = this.signiZones[indexOfSigniZone].signi;
				this.signiZones[indexOfSigniZone].signi = null;
			} else {
				// if it's a card under signi
				card = this.signiZones[indexOfSigniZone].under[index];
				this.signiZones[indexOfSigniZone].under.splice(index, 1);
			}
		} else {
			// standart iteraction.
			card = this[name][index];
			this[name].splice(index, 1);
		}
		return card;
	},
	addCard(card, zone) {
		if (!card) {
			console.log('addCard: No card was provided');
			return;
		} else if (!zone) {
			console.log('addCard: No zone was provided');
			return;
		}
		let {name, type, indexOfSigniZone} = zone;
		if (name == 'lrigZone') {
			// Lrig zone rules.
			if (type == 'lrig' || type == 'key') {
				// if it's key or lrig
				this.lrigZone[type] = card;
			} else  {
				// if it's a card under lrig
				this.lrigZone.under.push(card);
			}
		} else if (name == 'signiZones') {
			if (type == 'signi') {
				// if it's a signi
				this.signiZones[indexOfSigniZone].signi = card;
			} else {
				// if it's a card under signi
				this.signiZones[indexOfSigniZone].under.push(card;
			}
		} else {
			// standart iteraction.
			this[name].push(card);
		}
	},
	setCardState(zone, index) {
		if (zone == 'lrigZone') {
			this.lrigZone.state = !this.lrigZone.state;
		} else if (zone == 'signiZones') {
			this.signiZones[index].state = !this.signiZones[index].state;
		}
	},
	setCardStatus(status, zone, index) {
		if (zone == 'lrigZone') {
			this.lrigZone.status = status;
		} else if (zone == 'signiZones') {
			this.signiZones[index].status = status;
		}
	},
	setCardTooltip(tooltip, zone, index) {
		if (zone == 'lrigZone') {
			this.lrigZone.tooltip = tooltip;
		} else if (zone == 'signiZones') {
			this.signiZones[index].tooltip = tooltip;
		}
	}
}

module.exports = Player;
