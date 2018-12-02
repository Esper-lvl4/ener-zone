$(function () {
		var socket = io('/auth', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
			},
		});

		// If already logged in.

		socket.on('success-auth', function (data) {
			window.location.href = '../';
		})

		// Show/hide login popup.

		$('#login').on('click', function (event) {
			event.preventDefault();

			$('#login-wrap').removeClass(['js-none', 'js-dissolve']);
		});

		$('#login-wrap').on('click', function (event) {
			if ($(event.target).parents('form').length === 0) {
				$('#login-wrap').addClass(['js-none', 'js-dissolve']);
			}
		});

		// Show/hide sign up popup.

		$('#sign-up').on('click', function (event) {
			event.preventDefault();

			$('#sign-up-wrap').removeClass(['js-none', 'js-dissolve']);
		});

		$('#sign-up-wrap').on('click', function (event) {
			if ($(event.target).parents('form').length === 0) {
				$('#sign-up-wrap').addClass(['js-none', 'js-dissolve']);
			}
		});

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
		};

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
		});

		// Login success.

		socket.on('success-login', function (res) {
			$('#login-wrap').addClass(['js-none', 'js-dissolve']);
			localStorage.removeItem('EnerZoneToken');
			localStorage.setItem('EnerZoneToken', res.token);
			window.location.href = '../';
		});

		// Validate sign up form. Emit.

		$('#sign-up-username').on('input', function (event) {
			$(event.target).siblings('.info').empty();
			$(event.target).val(
				$(event.target).val().replace(/[\W\s]/, '')
			);
		});

		$('#sign-up-password').on('input', function (event) {
			$(event.target).siblings('.info').empty();
			$(event.target).val(
				$(event.target).val().replace(/[а-яА-Я\s]/, '')
			);
		});

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
			console.log('hmm');
			socket.emit('sign-up-user', user);
		});

		socket.on('success-sign-up', function (res) {
			$('#sign-up-wrap').addClass(['js-none', 'js-dissolve']);
			localStorage.removeItem('EnerZoneToken');
			localStorage.setItem('EnerZoneToken', res.token);
			window.location.href = '../';
		});

		socket.on('failed-sign-up', function (res) {
			console.log(res);
		});
	})