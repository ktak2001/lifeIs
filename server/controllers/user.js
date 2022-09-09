const User = require('../models/User')
const Life = require('../models/life')
const Category = require('../models/category')

exports.updatePassword = (req, res) => {
	const { name, password } = req.body;
	switch (true) {
		case password && password.length < 6:
			return res.status(400).json({ error: 'Password must be at least 6 characters long' });
	}

	User.findOneAndUpdate({ _id: req.user._id }, { name, password }, { new: true }).exec((err, updated) => {
		if (err) {
			return res.staus(400).json({
				error: 'Could not find user to update'
			});
		}
		updated.hashed_password = undefined;
		updated.salt = undefined;
		res.json(updated);
	});
};

exports.content = async (req, res) => {
	const { slug } = req.body
	try {
		const userQuery = await User.findOne({ slug }).populate('livesILiked').populate('likedBy').populate('categories')
		res.json({ user: userQuery })
	} catch (err) {
		console.log(err)
		res.status(400).json({ error: 'error retrieving user data' })
	}
}

exports.updateLifeLike = async (req, res) => {
	const { liked, id: lifeId } = req.body
	try {
		const userQuery = await User.updateOne({ _id: req.auth._id }, { [liked ? '$push': '$pullAll']: { livesILiked: (liked ? lifeId : [lifeId]) } }, { new: true })
		await Life.findOneAndUpdate({ _id: lifeId }, { [liked ? '$push' : '$pullAll']: { likedBy: liked ? req.auth._id : [req.auth._id] }}, {new: true})
		return res.json(userQuery)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: 'error in updateLifeLike' })
	}
}

exports.updateUserLike = async (req, res) => {
	const {liked, id: userId} = req.body
	try {
		await User.updateOne({ _id: req.auth._id }, { [liked ? '$push': '$pullAll']: { livesILiked: (liked ? userId : [userId]) } }, { new: true }) // me
		await User.updateOne({ _id: userId }, { [liked ? '$push' : '$pullAll']: { likedMe: liked ? req.auth._id : [req.auth._id] }}, {new: true}) // the user
	} catch(err) {
		console.log(err)
		return res.status(400).json({ error: 'error in updateLifeLike' })
	}
}