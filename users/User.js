const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	nickname: String,
	avatarPath: String,
	options: {
		infoPosition: String,
		clientColor: String,
	},
}, {
	collection: 'users',
});

const UserDB = mongoose.model('users', userSchema);

module.exports = UserDB;