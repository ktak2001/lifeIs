const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const lifeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true
		},
		pronounce: {
			type: String,
			// required: true,
			default: 'a',
			max: 32,
			trim: true
		},
		type: {
			type: String,
			default: 'life'
		},
		content: {
			type: {},
			min: 20,
			max: 2000000
		},
		postedBy: {
			type: ObjectId,
			ref: "User"
		},
		categories: [
			{
				type: ObjectId,
				ref: "Category"
			}
		],
		slug: {
			type: String,
			lowercase: true,
			unique: true,
			index: true
		},
		image: {
			url: String,
			key: String
		},
		likedBy: [
			{
				type: ObjectId,
				ref: 'User'
			}
		]
	},
	{ timestamps: true }
);

lifeSchema.methods = {
	objectType: function () {
		return 'Life'
	}
}

module.exports = mongoose.models.Life || mongoose.model("Life", lifeSchema);