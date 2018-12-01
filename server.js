const IO = require('socket.io');
const express = require('express');
const session = require('express-session');
const FileStore = require('express-file-store');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt.js');

const request = require('request');
const path = require('path');
const http = require('http');
const fs = require('fs');

const AuthController = require('./auth/AuthController');
const UserDB = require('./users/User');

const app = express();
const server = http.Server(app);
const io = IO(server);
const key = {
	'secret': 'kappadin',
}

mongoose.connect('mongodb://127.0.0.1:27017/wixoss', {useNewUrlParser: true});
mongoose.connection.on('open', function (err) {
	if (err) {
		console.error( 'connection error:');
	}
	console.log('Connected to database.');
});

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

// Saved decks path.

var fileStore = FileStore('fs', {
  path: __dirname + '/saves/',
});

// Getting an array of links from wiki API.

function getDatabase() {
	var linkList = [];

	let cardTypes = [
	'SIGNI',
	'LRIG',
	'ARTS',
	'Resona',
	'Spell',
	'Key',
	];

	let colors = [
	'Black',
	'White',
	'Blue',
	'Red',
	'Green',
	'Colorless',
	];
	for (let t = 0; t < cardTypes.length; t++) {
		for (let c = 0; c < colors.length; c++) {
			linkList.push(wikiQuery(cardTypes[t], colors[c], linkList));
		}
	}
	return linkList;
};

// Requests to API

function wikiQuery (type, color, linkList, number = 1000) {
	return new Promise((resolve, reject) => {
		//const loleni = 'https://selector-wixoss.wikia.com/wiki/Special:CategoryIntersection?category_1=Category%3A+ARTS&category_2=Category%3ABlack&limit=1000&wpSubmit=Find+matches'
		const reqUrl = 'https://wixoss.wikia.com/wiki/Special:CategoryIntersection?category_1=Category%3A+' + type 
		+ '&category_2=Category%3A+' + color + '&limit=' + number + '&wpSubmit=Find+matches';
		let result = [];
		request(reqUrl, (err, res, body) => {
			const $ = cheerio.load(body);
			const links = $('.ci_results ul li a');
			for (let i = 0; i < links.length; i++) {
				result.push($(links[i]).attr('href'));
			}
			if (color == 'Colorless') {
			}
			resolve(result);
		});
	})
}

// Card object constructor

var cardCount = 0;

class Card {
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
}

// Parse cards.

function parseCards(list, from, to) {
	let cardArray = [];

		for (let m = from; m < to; m++) {
			if (m == list.length) {
				console.log('Stopped at ' + m + 'th card.');
				return cardArray;
			}
			cardArray.push(getCard(list[m]));
		}
	console.log(to);
	return cardArray;
}

// Request to card pages.

function getCard (link) {
	return new Promise((resolve, reject) => {
		let url = link;
		let card = new Card(url);

		request(url, (err, res, body) => {
			if (err) {
				console.error(error);
			}
			const $ = cheerio.load(body);

			let nameWiki = $('#header').html();
			if (nameWiki != null) {
				let name = nameWiki.slice(0, nameWiki.indexOf('<br>'));
				card.name = name;
			}
			let image = $('#container img:first-of-type');
			card.image = $(image).attr('src');

			/* Mark card translated */

			$('#info_container .info-extra table th').each(function(index) {
				if ($(this).html().toLowerCase().match('russian')) {
					card.ru = true;
				}
			});


			$('#info_container .info-main tr').each(function (index) {

				let prop = $(this).find('td:first-of-type a').text();
				if (prop == 'Color') {
					card.color = $(this).find('td:nth-of-type(2) a:nth-of-type(2n)').text();
				}
				else if ($(this).find('b').text() == 'Card Type') {
					card.type = $(this).find('a:first-of-type').text();
					if (card.type == 'ARTS' && $(this).find('a:nth-of-type(2)').text()) {
						card.craft = true;
					}
				}
				else if ($(this).find('td:first-of-type a').text() == 'Level') {
					card.level = +$(this).find('td:nth-of-type(2)').text() + '';
				}
				else if ($(this).find('td:first-of-type a').text() == 'Power') {
					card.power = +$(this).find('td:nth-of-type(2)').text() + '';
				}
				else if ($(this).find('td:first-of-type a').text() == 'Limiting Condition') {
					card.limitingCondition = $(this).find('td:nth-of-type(2) a').text();
				}
				else if ($(this).find('td:first-of-type a').text() == 'Class') {
					card.class = $(this).find('td:nth-of-type(2) a').text();
				}
				else if ($(this).find('td:first-of-type a').text() == 'Limit') {
					card.limit = +$(this).find('td:nth-of-type(2)').text() + '';
				}
				else if ($(this).find('td:first-of-type a').text() == 'LRIG') {
					card.lrigType = $(this).find('td:nth-of-type(2) a').text();
				}
				else if ($(this).find('td:first-of-type a').text() == 'Coin') {
					card.coins = +$(this).find('td:nth-of-type(2)').text() + '';
					if (isNaN(card.coins)) {
						card.coins = null;
					}
				}
				else if ($(this).find('td:first-of-type a').text() == 'Grow Cost' || $(this).find('td:first-of-type a').text() == 'Cost') {
					let html = $(this).find('td:nth-of-type(2)').html();
					let array = html.split('</a>');
					let result = '';
					for (let i = 1; i < array.length; i++) {
						if(array[i].indexOf('<a') != -1) {
							result += array[i].slice(8, array[i].indexOf('<a')) + ' ';
						} else {
							result += array[i].slice(8) + ' ';
						}
					}
					let color = $(this).find('td:nth-of-type(2) img');
					for (let j = 0; j < color.length; j++) {
						result += $(color[j]).attr('alt') + ' ';
					}
					card.cost = result;
				}
				else if ($(this).find('td:first-of-type a').text() == 'Use Timing') {
					card.timing = $(this).find('td:nth-of-type(2)').text();
				}
				else if ($(this).find('td:first-of-type a').text() == 'Key Selection') {
					if ($(this).find('td:nth-of-type(2)').text().match('Yes')) {
						card.ksLegal = true;				
					}
				}
			});	

			card.effect = $('#info_container .effect table:first-of-type tr td').html();

			card.boosterSet = $('#info_container .sets table:first-of-type tr td a').text();

			resolve(card);
		});
	});
}

function setDatabase (cardArray) {
	var array = cardArray;
	for (let i = 0; i < array.length; i++) {
		let card = new CardDB(array[i]);
		card.save(function (err, data) {
			if (err) {
				console.log(err);
			}
		})
	}
	console.log('Added another pack of cards to db.');
}

app.use('/auth', AuthController);
app.use(express.static(path.resolve(__dirname, 'templates/')));

const sessionMiddle = session({
	secret: 'testingSession',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
});

app.use(sessionMiddle);

io.use(function (socket, next) {
  sessionMiddle(socket.request, socket.request.res, next);
});

// Main menu.

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/templates/main-menu/main-menu.html');

})

const mainMenu = io.of('/main-menu');

mainMenu.on('connection', function(socket) {
	console.log('User entered main menu');

	socket.on('authentication', function(values) {
		target = {
			username: values.name,
			password: values.password,
		}
		UserDB.findOne(target, (err, data) => {
			if (err) {console.error(err)};
			if (!data) {
				socket.emit('failed-auth', 'failed');
			} else {
				socket.emit('authenticated', 'success');
			}
		});
	});

});

// Deck Editor.

app.all('/deck-editor/', (req, res) => {
  res.sendFile(__dirname + '/templates/deck-editor/deck-editor.html');
})

const deckEditor = io.of('/deck-editor');

deckEditor.on('connection', function(socket) {
	console.log('User entered deck editor');

	CardDB.find((err, data) => {
		deckEditor.emit('db-init', data);
	});

	socket.on('save-deck', function (object) {
		const deck = JSON.stringify(object);
		const name = object.name;
		fs.writeFile(__dirname +`/saves/${name}.json`, deck, (err) => {  
      if (err) throw err;
      console.log('Saved deck');
    });
	});

	socket.on('show-decks', function (user) {
		fs.readdir(__dirname +'/saves/', (err, files) => {
			if (err) throw err;
			socket.emit('decks-rdy', files);
		});
	});

	socket.on('load-deck', function (name) {
		fs.readFile(`${__dirname}/saves/${name}.json`,
			{encoding: 'utf8'},
			(err, deck) => {
			if (err) throw err;
			socket.emit('loaded-deck', deck);
		});
	});

	socket.on('show-decks-delete', function (user) {
		fs.readdir(__dirname +'/saves/', (err, files) => {
			if (err) throw err;
			socket.emit('rdy-to-delete', files);
		});
	});

	socket.on('delete-deck', function (name) {
		fs.unlink(`${__dirname}/saves/${name}.json`,
			(err) => {
			if (err) throw err;
			socket.emit('deleted-deck', `deleted ${name}.json`);
		});
	});

});

// Parser.

app.all('/parse-db/', (req, res) => {
	res.sendFile(__dirname + '/templates/database/parsedb.html');
})

const parserRoom = io.of('/parse-db');

parserRoom.on('connection', function(socket) {
	console.log('User connected to parser');

	/* Show db */
	socket.on('showDB', function(val) {
		console.log('Displaying database');
		CardDB.find((err, data) => {
			io.emit('showingDB', data);
		});
	});

	/* Search throw database */

	socket.on('showFilter', function(query) {
		console.log(`Searching for cards.`);
		CardDB.find(query, (err, data) => {
			console.log('Done');
			io.emit('gotUntranslatedCards', data);
		});
	});

	/* Parsing wiki */

	socket.on('parse', function (msg) {
		console.log('Parsing wixoss wiki...');
		Promise.all(getDatabase())
			.then((result) => {
				var rdyArr = {
					links: [],
					database: [],
				};
				for (let i = 0; i < result.length; i++) {
					rdyArr.links = rdyArr.links.concat(result[i]);
				}
				io.emit('link-list', rdyArr.links);
				return rdyArr;
			})
			.then(async (doneObj) => {
				var rdyArr = doneObj;
				for (let start = 0, end = 1; end <= Math.ceil(rdyArr.links.length / 300); end++) {
					await Promise.all(parseCards(rdyArr.links, start, end * 300))
					.then((cards) => {
						setDatabase(cards);
						start = end * 300 + 1;
					})
					.catch((err) => {
						console.error(err);
					});
				}
				console.log('Done adding cards to database');
				return;
			})
			.then(() => {
				console.log('Displaying database');
				CardDB.find((err, data) => {
					io.emit('parsed', data);
				});
			});
	});
});


server.listen(3000, function() {
	console.log('listening on *:3000');
});