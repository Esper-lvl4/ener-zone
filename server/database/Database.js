const CardDB = require('./CardDB');
const Parser = require('./Parser');

function Database (socket) {
	/* Show db */
	socket.on('showDB', function(val) {
		console.log('Displaying database');
		CardDB.find((err, data) => {
			if (err) {console.error(err)}
			socket.emit('showingDB', data);
		});
	});

	/* Search throw database */

	socket.on('showFilter', function(query) {
		console.log(`Searching for cards.`);
		CardDB.find(query, (err, data) => {
			console.log('Done');
			socket.emit('gotUntranslatedCards', data);
		});
	});

	/* Parsing wiki */

	socket.on('parse', function (msg) {
		console.log('Parsing wixoss wiki...');
		Promise.all(Parser.getDatabase())
			.then((result) => {
				var rdyArr = {
					links: [],
					database: [],
				};
				for (let i = 0; i < result.length; i++) {
					rdyArr.links = rdyArr.links.concat(result[i]);
				}
				socket.emit('link-list', rdyArr.links);
				return rdyArr;
			})
			.then(async (doneObj) => {
				var rdyArr = doneObj;
				for (let start = 0, end = 1; end <= Math.ceil(rdyArr.links.length / 300); end++) {
					await Promise.all(Parser.parseCards(rdyArr.links, start, end * 300))
					.then((cards) => {
						Parser.setDatabase(cards);
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
					socket.emit('parsed', data);
				});
			});
	});
}

module.exports = Database;
