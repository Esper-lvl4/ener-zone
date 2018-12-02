$(function () {
		var socket = io('/deck-editor', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
			},
		});

		socket.on('failed-auth', function (socket) {
			window.location.href = '/auth/';
		})
		
		var database = [];
		var visibleCards = [];
		var visibleCount = 0;
		var deck = {
			main: [],
			lrig: [],
			// Render deck.
			render: function () {
				var mainDeck = $('#main-deck').empty();
				var lrigDeck = $('#lrig-deck').empty();
				this.main.forEach(function(card, index) {
					target = '.card img[data-num="' + card.number + '"] + .card-count';
					if ($(target).length != 0) {
						var count = +$(target).text() + 1;
						$(target).text(count);
						return;
					}
					var div = $('<div>').addClass('card');
					var img = $('<img>').attr({
						src: card.image,
						'data-num': card.number, 
					});
					var count = $('<div>').addClass('card-count').text('1');
					$(div).append(img);
					$(div).append(count);
					$(mainDeck).append(div);
				});
				this.lrig.forEach(function(card, index) {
					target = '.card img[data-num="' + card.number + '"] + .card-count';
					if ($(target).length != 0) {
						var count = +$(target).text() + 1;
						$(target).text(count);
						return;
					}
					var div = $('<div>').addClass('card');
					var img = $('<img>').attr({
						src: card.image,
						'data-num': card.number, 
					});
					var count = $('<div>').addClass('card-count').text('1');
					$(div).append(img);
					$(div).append(count);
					$(lrigDeck).append(div);
				});
			},
		};

		// Show cards from search results, or all on init. Also, shows more cards on button press.

		function showCards(start = 0, end = 19) {
			var from = start;
			var to = end;
			visibleCount = to + 1;
			if (visibleCount < visibleCards.length) {
				$('#more-button').removeClass('js-none');
			} else {
				$('#more-button').addClass('js-none');
				to = visibleCards.length - 1;
			}
			$('#search-result').empty();
			for (var i = from; i <= to; i++) {

				var img = $('<img>').attr({
					src: visibleCards[i].image,
					'data-num': visibleCards[i].number,
				});
				$('#search-result').append(img);
				if (i >= visibleCards.length) {
					$('#more_button').addClass('js-none');
					break;
				}
			};
		};

		socket.on('db-init', function (data) {
			database = data;
			for (var n = 0; n < database.length; n++) {
				database[n].number = n;
			}
			console.log(database);
			visibleCards = database;
			showCards();
		});

		$('#more-button').on('click', function (event) {
			showCards(0, visibleCount + 19)
		});

		// Cards hover

		function cardHover (event) {
			if ($(event.target).prop('tagName') == 'IMG') {

				$('#info-name').empty();
				$('#info-props').empty();
				$('#info-class').empty();
				$('#info-cost').empty();
				$('#info-timing').empty();
				$('#info-power').empty();
				$('#info-limit-con').empty();
				$('#info-text').empty();

				var card = database[$(event.target).attr('data-num')];
				$('#info-img').attr('src', $(event.target).attr('src'));

				var nameString = card.name;
				nameString = nameString.replace(/&#xD7;/g, " \u00D7 ").replace(/&apos;/g, "\u0027");
				console.log(nameString);
				$('#info-name').text(nameString);

				var props = card.type + '/' + card.color;

				if (card.type == 'LRIG') {
					props += '/level ' + card.level;
					if (isNaN(card.limit)) {
						props += '/limit \u221E';
					} else {
						props += '/limit ' + card.limit;
					}

					if (card.type == 'LRIG' && card.cost == null) {
						$('#info-cost').text('Grow cost: -');
					}
					else {
						var arr = card.cost.split(' ');
						arr.pop();
						costArr = [];
						arr.forEach((elem) => {
							if(elem == '') {
								return;
							}
							costArr.push(elem);
						});
						var costNum = costArr.slice(0, costArr.length / 2);
						var costEner = costArr.slice(costArr.length / 2);
						var string = '';

						for (var i = 0; i < costNum.length; i++) {
							string += ' ' + costNum[i] + ' ' + costEner[i];
						}

						$('#info-cost').text('Grow cost: ' + string);
					}
					$('#info-class').text('LRIG Type: ' + card.lrigType);
				} 
				else if (card.type == 'SIGNI' || card.type == 'Resona') {
					props += '/level ' + card.level;
					$('#info-power').text('Power: ' + card.power);
					$('#info-class').text('Class: ' + card.class);
				}
				else if (card.type == 'ARTS') {
					var arr = card.cost.split(' ');
					arr.pop();
					costArr = [];
					arr.forEach((elem) => {
						if(elem == '') {
							return;
						}
						costArr.push(elem);
					});
					var costNum = costArr.slice(0, costArr.length / 2);
					var costEner = costArr.slice(costArr.length / 2);
					var string = '';

					for (var i = 0; i < costNum.length; i++) {
						string += ' ' + costNum[i] + ' ' + costEner[i];
					}

					$('#info-cost').text('Cost: ' + string);

					$('#info-timing').text('Use timing: ' + card.timing);
				}
				else if (card.type == 'Key' || card.type == 'Spell') {
					var arr = card.cost.split(' ');
					arr.pop();
					costArr = [];
					arr.forEach((elem) => {
						if(elem == '') {
							return;
						}
						costArr.push(elem);
					});
					var costNum = costArr.slice(0, costArr.length / 2);
					var costEner = costArr.slice(costArr.length / 2);
					var string = '';

					for (var i = 0; i < costNum.length; i++) {
						string += ' ' + costNum[i] + ' ' + costEner[i];
					}

					$('#info-cost').text('Cost: ' + string);
				}

				if (card.limitingCondition != null) {
					$('#info-limit-con').text('Limiting condition: ' + card.limitingCondition);
				}
				
				$('#info-props').text(props);
				$('#info-text').html(card.effect);
				$('#info-text a').each(function () {
					var span = $('<span>').html($(this).html());
					$(this).replaceWith(span);
				})
				
				$('#info-text img').each(function () {
					var img = $('<img>');
					switch ($(this).attr('alt')) {
						case 'Heaven':
							img.attr({
								src: '/files/img/heaven.png',
								width: '22',
								height: '22',
								alt: 'Heaven',
							});
							break;
						case 'Life Burst':
							img.attr({
								src: '/files/img/life-burst.png',
								width: '22',
								height: '22',
								alt: 'Life Burst',
							});
							break;
						case 'RedIcon':
						case 'Red':
							img.attr({
								src: '/files/img/red.png',
								width: '22',
								height: '22',
								alt: 'Red',
							});
							break;
						case 'BlueIcon':
						case 'Blue':
							img.attr({
								src: '/files/img/blue.png',
								width: '22',
								height: '22',
								alt: 'Blue',
							});
							break;
						case 'GreenIcon':
						case 'Green':
							img.attr({
								src: '/files/img/green.png',
								width: '22',
								height: '22',
								alt: 'Green',
							});
							break;
						case 'WhiteIcon':
						case 'White':
							img.attr({
								src: '/files/img/white.png',
								width: '22',
								height: '22',
								alt: 'White',
							});
							break;
						case 'BlackIcon':
						case 'Black':
							img.attr({
								src: '/files/img/black.png',
								width: '22',
								height: '22',
								alt: 'Black',
							});
							break;
						case 'ColorlessIcon':
						case 'Colorless':
							img.attr({
								src: '/files/img/colorless.png',
								width: '22',
								height: '22',
								alt: 'Colorless',
							});
							break;
						case 'CoinIcon':
						case 'Coin':
							img.attr({
								src: '/files/img/coin.png',
								width: '22',
								height: '22',
								alt: 'Coin',
							});
							break;
					}			
					$(this).replaceWith(img);
				});
			}
		};

		$('#search-result').on('mouseover', cardHover);
		$('.main-deck').on('mouseover', cardHover);
		$('.lrig-deck').on('mouseover', cardHover);

		// Add cards to deck by clicking card in search zone.

		function addToDeck (event) {
			if ($(event.target).prop('tagName') == 'IMG') {
				cardInDeck = '.card img[data-num="' + $(event.target).attr('data-num') + '"] + .card-count';
				if ($(cardInDeck).length != 0 && +$(cardInDeck).text() >= 4) {
					return;
				}
				var card = Object.assign({}, database[$(event.target).attr('data-num')]);

				if (card.type == 'SIGNI' || card.type == 'Spell') {
					deck.main.push(card);
				} else {
					deck.lrig.push(card);
				}

				deck.render();
			}	
		};

		$('#search-result').on('click', addToDeck);

		// Remove cards from deck by clicking card in deck zone.

		function removeFromDeck (event) {
			if ($(event.target).prop('tagName') == 'IMG') {
				if ($(event.target).parents('.main-deck').length !== 0) {
					for (var i = 0; i < deck.main.length; i++) {
						if ($(event.target).attr('data-num') == deck.main[i].number) {
							deck.main.splice(i, 1);
							break;
						}
					}
				}
				else if ($(event.target).parents('.lrig-deck').length !== 0) {
					for (var i = 0; i < deck.lrig.length; i++) {
						if ($(event.target).attr('data-num') == deck.lrig[i].number) {
							deck.lrig.splice(i, 1);
							break;
						}
					}
				}
				
				deck.render();
			}	
		};

		$('.main-deck').on('click', removeFromDeck);
		$('.lrig-deck').on('click', removeFromDeck);

		// Name filter.

		function nameFilter (event) {
			if ($(event.target).val() == '') {
				createFilter(event);
			} else {
				createFilter(event);
				var arr = [];
				visibleCards.forEach(function(card) {
					if (card.name === null) {
						return;
					}
					if (card.name.match($(event.target).val()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
				showCards();
			}	
		}

		$('#name-filter').on('input change', nameFilter);

		// Main filter.

		function toggleFilter (event) {
			event.preventDefault();
			$('#filter-block').toggleClass('filter-visible');
		};

		function createFilter (event) {
			event.preventDefault();
			$('#filter-block').removeClass('filter-visible');

			var filter = {
				color: null,
				type: null,
				class: null,
				lrigType: null,
				level: null,
				limit: null,
				power: null,
				cost: null,
				timing: null,
				limitingCondition: null,
				effect: null,
				boosterSet: null,
				ksLegal: null,
			};

			// Main props.

			filter.ksLegal = $('#card-kslegal').prop('checked');

			if ($('#card-color').val() != '') {
				filter.color = $('#card-color').val();
			}

			if ($('#card-type').val() != 'Any') {
				filter.type = $('#card-type').val();
			}

			if ($('#card-effect').val() != '') {
				filter.effect = $('#card-effect').val();
			}
			if ($('#card-set').val() != '') {
				filter.boosterSet = $('#card-set').val();
			}

			// Secondary props.

			if ($('#card-limcon').val() != '') {
				filter.limitingCondition = $('#card-limcon').val();
			}

			if ($('#card-class').val() != '') {
				filter.class = $('#card-class').val();
			}

			if ($('#card-level').val() != '' && !isNaN(+$('#card-level').val())) {
				filter.level = $('#card-level').val();
			}

			if ($('#card-power').val() != '' && !isNaN(+$('#card-power').val())) {
				filter.power = $('#card-power').val();
			}

			if ($('#card-lrigtype').val() != '') {
				filter.lrigType = $('#card-lrigtype').val();
			}

			if ($('#card-limit').val() != '' && !isNaN(+$('#card-limit').val())) {
				filter.limit = $('#card-limit').val();
			}

			if ($('#card-timing').val() != '') {
				filter.timing = $('#card-timing').val();
			}

			applyFilter(filter);

		};

		function applyFilter (filter) {

			// Type filter.

			if (filter.type == null) {
				visibleCards = Object.assign([], database);
			} else {
				visibleCards = [];

				database.forEach(function(card) {
					if (card.type === null) {
						return;
					}
					if (card.type.match(filter.type)) {
						visibleCards.push(card);
					}
				});
			};

			// Format filter.

			if (filter.ksLegal !== null && filter.ksLegal == true) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.ksLegal === true) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Set filter.

			if (filter.boosterSet !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.boosterSet.toLowerCase().match(filter.boosterSet.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Color filter.

			if (filter.color !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.color === null) {
						return;
					}
					if (card.color.toLowerCase().match(filter.color.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Limiting condition filter.

			if (filter.limitingCondition !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.limitingCondition === null) {
						return;
					}
					if (card.limitingCondition.toLowerCase().match(filter.limitingCondition.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Signi Class filter.

			if (filter.class !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.class === null) {
						return;
					}
					if (card.class.toLowerCase().match(filter.class.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Level filter.

			if (filter.level !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.level === null) {
						return;
					}
					if (+card.level == +filter.level) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Power filter.

			if (filter.power !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.power === null) {
						return;
					}
					if (+card.power == +filter.power) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Lrig Type filter.

			if (filter.lrigType !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.lrigType === null) {
						return;
					}
					if (card.lrigType.toLowerCase().match(filter.lrigType.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Limit filter.

			if (filter.limit !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.limit === null) {
						return;
					}
					if (+card.limit == +filter.limit) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Use timing filter.

			if (filter.timing !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.timing === null) {
						return;
					}
					if (card.timing.toLowerCase().match(filter.timing.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			// Card text filter.

			if (filter.effect !== null) {
				var arr = [];
				visibleCards.forEach(function(card, index) {
					if (card.effect === null) {
						return;
					}
					if (card.effect.toLowerCase().match(filter.effect.toLowerCase()) !== null) {
						arr.push(card);
					}
				})
				visibleCards = arr;
			}

			showCards();
			
		};

		$('#search-filter').on('click', toggleFilter);
		$('#filter-send').on('click', createFilter);

		// Saving Deck.

		function toggleSaveDeck (event) {
			$('#save-deck-block').toggleClass('save-active');
		};

		function checkSaveName (event) {
			if($('#save-deck-name').val().match(/^[a-zA-Z\-_]{3,}/)) {
				saveDeck(event);
			} else {
				console.log('Enter valid name');
			};
		};

		function saveDeck(event) {
			event.preventDefault();
			var main = [];
			var lrig = [];

			for (var i = 0; i < deck.main.length; i++) {
				main.push(deck.main[i].number);
				console.log(deck.main[i].number);
			}

			for (var i = 0; i < deck.lrig.length; i++) {
				lrig.push(deck.lrig[i].number);
			}

			var saved = {
				name: $('#save-deck-name').val(),
				mainDeck: main,
				lrigDeck: lrig,
			};

			socket.emit('save-deck', saved);

		};

		$('#save-deck').on('click', toggleSaveDeck);
		$('#save-deck-submit').on('click', checkSaveName);

		// Load deck.

		function showDecksList (event) {
			if ($('#deck-list-block').hasClass('deck-list-active')) {
				$('#deck-list-block').removeClass('deck-list-active');
				return;
			}
			socket.emit('show-decks', 'user');
		};

		socket.on('decks-rdy', function (list) {
			$('#deck-list').empty();
			list.forEach((deck) => {
				$('#deck-list-block').addClass('deck-list-active');
				let string = deck.slice(0, deck.indexOf('.'));
				let li = $('<li>').text(string);
				$('#deck-list').append(li);
			});
			$('#deck-list').append($('<li>').text('Cancel'));
		});

		function loadDeck (event) {
			if ($(event.target).prop('tagName') !== 'LI') {
				return;
			} else if ($(event.target).text() === 'Cancel') {
				$('#deck-list-block').removeClass('deck-list-active');
				return;
			}
			socket.emit('load-deck', $(event.target).text());
		};

		socket.on('loaded-deck', function(result){
			let loadedDeck = JSON.parse(result);
			deck.main = [];
			deck.lrig = [];
			loadedDeck.mainDeck.forEach(function (num) {
				for (let i = 0; i < database.length; i++) {
					if (+database[i].number === +num) {
						deck.main.push(database[i]);
						break;
					}
				}
			});
			loadedDeck.lrigDeck.forEach(function (num) {
				for (let i = 0; i < database.length; i++) {
					if (+database[i].number === +num) {
						deck.lrig.push(database[i]);
						break;
					}
				}
			});
			deck.render();
			$('#deck-list-block').removeClass('deck-list-active');
		});

		$('#load-deck').on('click', showDecksList);
		$('#deck-list').on('click', loadDeck);

		/* Clear deck */

		function clearDeck () {
			deck.main = [];
			deck.lrig = [];
			deck.render();
		}

		$('#create-deck').on('click', clearDeck);

		/* Delete deck */

		function showDecksToDelete (event) {
			if ($('#delete-list-block').hasClass('delete-list-active')) {
				$('#delete-list-block').removeClass('delete-list-active');
				return;
			}
			socket.emit('show-decks-delete', 'user');
		}

		socket.on('rdy-to-delete', function (list) {
			$('#delete-list').empty();
			list.forEach((deck) => {
				$('#delete-list-block').addClass('delete-list-active');
				let string = deck.slice(0, deck.indexOf('.'));
				let li = $('<li>').text(string);
				$('#delete-list').append(li);
			});
			$('#delete-list').append($('<li>').text('Cancel'));
		})

		function deleteDeck (event) {
			if ($(event.target).prop('tagName') !== 'LI') {
				return;
			} else if ($(event.target).text() === 'Cancel') {
				$('#delete-list-block').removeClass('delete-list-active');
				return;
			}
			socket.emit('delete-deck', $(event.target).text());
		};

		socket.on('deleted-deck', function (string) {
			console.log(string);
			socket.emit('show-decks-delete', 'user');
		})

		$('#delete-deck').on('click', showDecksToDelete);
		$('#delete-list').on('click', deleteDeck);

	});