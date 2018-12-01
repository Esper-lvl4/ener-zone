$(function () {
		var socket = io('/main-menu');

		// Run if user if logged in.

		function isAuthenticated () {
			console.log('check');
		}

		// Show/hide login popup.

		$('#login').on('click', function (event) {
			event.preventDefault();

			$('#login-wrap').removeClass(['js-none', 'js-dissolve']);
		});

		$('#login-wrap').on('click', function (event) {
			if ($(event.target).parents('form').length === 0) {
				$('#login-wrap').addClass(['js-none', 'js-dissolve']);
			}
		})

		// Show/hide sign up popup.

		$('#sign-up').on('click', function (event) {
			event.preventDefault();

			$('#sign-up-wrap').removeClass(['js-none', 'js-dissolve']);
		});

		$('#sign-up-wrap').on('click', function (event) {
			if ($(event.target).parents('form').length === 0) {
				$('#sign-up-wrap').addClass(['js-none', 'js-dissolve']);
			}
		})

		// Function for validation forms.

		function validateUserPass(event) {
			var username = $(event.target).find('[name="username"]').val();
			var password = $(event.target).find('[name="password"]').val();
			var result = true;
			
			if (username.length < 4) {
				result = false;
			}

			if (password.length < 6) {
				result = false;
			}

			return result;
		}

		// Submit login form.

		$('#login-form').on('submit', function (event) {
			event.preventDefault();
			var user = {
				name: $('#login-username').val(),
				password: $('#login-password').val(),
				remember: $('#login-password').prop('checked'),
			}
			socket.emit('login', user);
		});

		// Login failure.

		socket.on('failed-login', function (data) {
			$('#login-form .info').text('Wrong username or password! Check is Caps lock is on.');
		})

		// Login success.

		socket.on('success-login', function (res) {
			$('#login-wrap').addClass(['js-none', 'js-dissolve']);
			console.log(res);
		})

		// Validate sign up form. Emit.

		$('#sign-up-username').on('input', function (event) {
			$(event.target).siblings('.info').empty();
			$(event.target).val(
				$(event.target).val().replace(/[\W\s]/, '')
			);
		})

		$('#sign-up-password').on('input', function (event) {
			$(event.target).siblings('.info').empty();
			$(event.target).val(
				$(event.target).val().replace(/[а-яА-Я\s]/, '')
			);
		})

		// Submit sign up form.

		$('#sign-up-form').on('submit', function (event) {
			event.preventDefault();

			if (!validateUserPass(event)) {
				$(event.target).find('.info').text(
					'Username must be at least 4 characters long. \nPassword must be at least 6 characters long.'
				);
				return false;
			};

			var user = {
				name: $('#sign-up-username').val(),
				password: $('#sign-up-password').val(),
			}

			socket.emit('sign-up-user', user);
		});

		socket.on('success-sign-up', function (res) {
			console.log(res);
		})

		socket.on('failed-sign-up', function (res) {
			console.log(res);
		})

		// Logout.

		socket.on('success-logout', function (res) {
			console.log(res);
		})



		
		
		/*
		$('#parsing-db').submit(function() {
			socket.emit('parse', $('#parse').val());
			return false;
		})
		$('#show-db').submit(function() {
			socket.emit('showDB', $('#show-db').val());
			return false;
		})
		socket.on('showingDB', function (database) {
			console.log('Showing db');
			database.forEach((card) => {
				$('#output').append('- ' + card.name + '\n');
			});
		})
		socket.on('link-list', function(list) {
			console.log(list);
			list.forEach((url) => {
				$('#link-list').append($('<li>').text(url));
			});
		})
		socket.on('parsed', function(database) {
			console.log('Parsed');
			console.info(database);
			$('#output').text('Database is ready :)\n');
		})
		*/
	})