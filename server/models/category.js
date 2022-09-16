const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			max: 32
		},
		pronounce: {
			type: String,
			default: 'a',
			max: 32,
			trim: true
		},
		type: {
			type: String,
			default: 'category'
		},
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
		content: {
			type: {},
			min: 20,
			max: 2000000
		},
		postedBy: {
			type: ObjectId,
			ref: 'User'
		},
		lives: [
			{
				type: ObjectId,
				required: true,
				ref: 'Life'
			}
		],
		users: [
			{
				type: ObjectId,
				required: true,
				ref: 'User'
			}
		],
	},
	{ timestamps: true }
);

categorySchema.methods = {
	objectType: function () {
		return 'Category'
	}
}

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
