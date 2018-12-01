var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var key = {
	'secret': 'kappadin',
}

router.post('/register', function (req, res) {
	var hashedPassword = bcrypt.hashSync(req.body.password, 8);

	User.create({
		name: req.body.name,
		email: req.body.email,
		password: hashedPassword,
	},
	function (err, user) {
		if (err) return res.status(500).send('There was a problem registering the user.')

		var token = jwt.sign({id: user._id}, key.secret, {
			expiresIn: 86400,
		});
		res.status(200).send({auth: true, token: token});
	});
});

router.get('/me', function (req, res) {
	var token = req.headers['x-access-token'];
	if (!token) return res.status(401).send({auth: false, message: 'No token provided.'});

	jwt.verify(token, key.secret, function(err, decoded) {
		if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token.'})
		res.status(200).send(decoded);
	})
});

router.post('/login', function (req, res) {
	User.findOne({email: req.body.email}, function (err, user) {
		if (err) {return res.status(500).send('Error on the server.')};
		if (!user) {return res.status (404).send('No user found.')};
		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

		if (!passwordIsValid) {return res.status(401).send({auth: false, token: null})};
		var token = jwt.sign({id: user._id}, key.secret, {
			expiresIn: 86400, // expires in a day.
		});
		res.status(200).send({auth: true, token: token});
	});
});

module.exports = router;
