let cardCount = 0;

// Card object constructor

module.exports = class Card {
	constructor(url) {
		this.image = null;
		this.name = null;
		this.color = null;
		this.type = null;
		this.class = null;
		this.lrigType = null;
		this.level = null;
		this.limit = null;
		this.power = null;
		this.cost = null;
		this.craft = false;
		this.timing = null;
		this.limitingCondition = null;
		this.coins = null;
		this.effect = null;
		this.boosterSet = null;
		this.altImages = null;
		this.link = url;
		this.ksLegal = false;
		this.ru = false;
		this.number = cardCount++;
	}
};

