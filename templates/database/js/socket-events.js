var socket = io();

$(function () {
		var socket = io('/parse-db');

		$('#parsing-db').submit(function() {
			socket.emit('parse', $('#parse').val());
			return false;
		});

		$('#show-db').submit(function() {
			socket.emit('showDB', $('#show-db').val());
			return false;
		});

		$('#search-for').submit(function() {
			let obj = {};
			if ($('#search-val').val() === 'false') {
				obj[$('#search-what').val()] = false;
			}
			else if ($('#search-val').val() === 'true') {
				obj[$('#search-what').val()] = true;
			}
			else if ($('#search-val').val() === 'null') {
				obj[$('#search-what').val()] = null;
			}
			else {
				obj[$('#search-what').val()] = $('#search-val').val();
			}
			socket.emit('showFilter', obj);
			return false;
		});

		socket.on('showingDB', function (database) {
			console.log('Showing db');
			database.forEach((card) => {
				$('#output').append('- ' + card.name + '\n');
			});
		});

		socket.on('link-list', function(list) {
			console.log(list);
			list.forEach((url) => {
				$('#link-list').append($('<li>').text(url));
			});
		});

		socket.on('parsed', function(database) {
			console.log('Parsed');
			console.info(database);
			$('#output').text('Database is ready :)\n');
		});

		socket.on('gotUntranslatedCards', function(cards) {
			cards.forEach(function (card) {
				$('#link-list').append($('<li>').text(card.link));
			});
		});
	})