const mongoose = require("mongoose")
const crypto = require("crypto")
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
	user_id: {
		type: String,
		trim: true,
		required: true,
		max: 12,
		unique: true,
	},
	type: {
		type: String,
		default: 'user'
	},
	pronounce: {
		type: String,
		// required: true,
		default: 'a',
		max: 32,
		trim: true
	},
	content: {
		type: {},
		min: 20,
		max: 2000000
	},
	image: {
		url: String,
		key: String
	},
	name: {
		type: String,
		trim: true,
		required: true,
		max: 32
	},
	slug: {
		type: String,
		lowercase: true,
		unique: true,
		index: true
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		lowercase: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: String,
	role: {
		type: String,
		default: "subscriber"
	},
	resetPasswordLink: {
		data: String,
		default: ""
	},
	livesILiked: [
		{
			type: ObjectId,
			required: true,
			ref: 'Life'
		}
	],
	usersILiked: [
		{
			type: ObjectId,
			required: true,
			ref: 'User'
		}
	],
	likedBy: [
		{
			type: ObjectId,
			ref: "User"
		}
	],
	categories: [
		{
			type: ObjectId,
			ref: "Category"
		}
	]
})

userSchema
	.virtual("password")
	.set(function(pass) {
		this._password = pass;
		this.salt = this.makeSalt();
		this.hashed_password = this.encryptPassword(pass);
	})
	.get(function() {
		return this._password
	})

userSchema.methods = {
	authenticate: function (pass) {
		return this.encryptPassword(pass) === this.hashed_password
	},

	encryptPassword: function (pass) {
		if (!pass) return ""
		try {
			return crypto
				.createHmac("sha1", this.salt)
				.update(pass)
				.digest("hex")
		} catch (err) {
			console.log("mongoDB error: ", err)
			return ""
		}
	},

	makeSalt: function () {
		return Math.round(new Date().valueOf() * Math.random()) + ""
	},

	objectType: function () {
		return 'User'
	}
}

module.exports = mongoose.models.User || mongoose.model("User", userSchema)