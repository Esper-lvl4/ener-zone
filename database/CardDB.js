const mongoose = require('mongoose');

// Card database

const cardSchema = new mongoose.Schema({
	image: '',
	name: '',
	color: '',
	type: '',
	class: '',
	lrigType: '',
	level: '',
	limit: '',
	power: '',
	cost: '',
	craft: '',
	timing: '',
	limitingCondition: '',
	coins: '',
	effect: '',
	boosterSet: '',
	altImages: '',
	link: '',
	ksLegal: '',
	ru: '',
	number: 0,
}, {
	collection: 'cards01',
});

const CardDB = mongoose.model('cards01', cardSchema);

module.exports = CardDB;