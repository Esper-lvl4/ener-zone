const fs = require('fs');
const CardDB = require('../database/CardDB');

function DeckEditor (socket) {
	console.log('User entered deck editor');

	CardDB.find((err, data) => {
		socket.emit('db-init', data);
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
}

module.exports = DeckEditor;