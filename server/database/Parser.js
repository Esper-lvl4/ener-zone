const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Card = require('./Card');
const CardDB = require('./CardDB');

const parser = {
	// Getting an array of links from wiki API.

	getDatabase: function () {
		var linkList = [];

		let cardTypes = [
		'SIGNI',
		'LRIG',
		'ARTS',
		'Resona',
		'Spell',
		'Key',
		];

		for (let t = 0; t < cardTypes.length; t++) {
			linkList.push(this.wikiQuery(cardTypes[t], linkList));
		}
		return linkList;
	},

	// Requests to API

	wikiQuery: function (type, linkList, number = 10000) {
		return new Promise((resolve, reject) => {
			const reqUrl = 'https://wixoss.wikia.com/wiki/Special:CategoryIntersection?category_1=Category%3A+' + type
			+ '&limit=' + number + '&wpSubmit=Find+matches';
			let result = [];
			request(reqUrl, (err, res, body) => {
				if (err) {
					reject(err);
				}
				const $ = cheerio.load(body);
				const links = $('.ci_results ul li a');
				for (let i = 0; i < links.length; i++) {
					result.push($(links[i]).attr('href'));
				}
				resolve(result);
			});
		})
	},

	// Parse cards.

	parseCards: function (list, from, to) {
		let cardArray = [];

			for (let m = from; m < to; m++) {
				if (m == list.length) {
					console.log('Stopped at ' + m + 'th card.');
					return cardArray;
				}
				cardArray.push(this.getCard(list[m]));
			}
		console.log(to);
		return cardArray;
	},

	// Request to card pages.

	getCard: function (link) {
		return new Promise((resolve, reject) => {
			let url = link;
			let card = new Card(url);

			request(url, (err, res, body) => {
				if (err) {
					console.error(error);
					reject(err);
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
	},

	setDatabase: function (cardArray) {
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
}

module.exports = parser;
