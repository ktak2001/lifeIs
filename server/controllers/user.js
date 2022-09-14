const User = require('../models/user')
const Life = require('../models/life')
const Category = require('../models/category');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});

exports.read = (req, res) => {
	res.json({ user: req.profile })
}

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
		const userQuery = await User.findOne({ slug }).populate('livesILiked').populate('likedBy').populate('categories').populate('usersILiked')
		console.log('livesIliked', userQuery.livesILiked)
		res.json({ user: userQuery })
	} catch (err) {
		console.log(err)
		res.status(400).json({ error: 'error retrieving user data' })
	}
}

exports.updateLifeLike = async (req, res) => {
	const { liked, id } = req.body
	try {
		const userQuery = await User.updateOne({ _id: req.auth._id }, { [liked ? '$push': '$pullAll']: { livesILiked: (liked ? id : [id]) } }, { new: true })
		await Life.findOneAndUpdate({ _id: id }, { [liked ? '$push' : '$pullAll']: { likedBy: liked ? req.auth._id : [req.auth._id] }}, {new: true})
		return res.json(userQuery)
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: 'error in updateLifeLike' })
	}
}

exports.updateUserLike = async (req, res) => {
	const {liked, id: userId} = req.body
	try {
		await User.updateOne({ _id: req.auth._id }, { [liked ? '$push': '$pullAll']: { usersILiked: (liked ? userId : [userId]) } }, { new: true }) // me
		await User.updateOne({ _id: userId }, { [liked ? '$push' : '$pullAll']: { likedBy: liked ? req.auth._id : [req.auth._id] }}, {new: true}) // the user
	} catch(err) {
		console.log(err)
		return res.status(400).json({ error: 'error in updateLifeLike' })
	}
}

exports.update = async (req, res) => {
	const { user, name, image, content, categories, slug } = req.body
	const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	const type = image.split(';')[0].split('/')[1];
	console.log('inside update')
	
	try {
		if (user.slug !== slug && user.role !== 'admin') {
			throw new Error('not permitted.')
		}
		const userQuery = await User.findOneAndUpdate({ slug }, { name, content, categories }, { new: true })
		await Category.updateOne({ users: userQuery._id }, { '$pullAll': { users: [userQuery._id] } })
		await Category.updateMany({ _id: categories }, { '$push': { users: userQuery._id } })
		if (!image) {
			return res.json(userQuery)
		}
		if (userQuery.image.url) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${updated.image.key}`
			};
			s3.deleteObject(deleteParams, function (err, data) {
				if (err) console.log('S3 DELETE ERROR DURING UPDATE', err);
				else console.log('S3 DELETED DURING UPDATE', data);
			});
		}
		const params = {
			Bucket: 'lifeisktak',
			Key: `life/${uuidv4()}.${type}`,
			Body: base64Data,
			ACL: 'public-read',
			ContentEncoding: 'base64',
			ContentType: `image/${type}`
		};
		const s3Data = await s3.upload(params).promise()
		userQuery.image.url = s3Data.Location;
		userQuery.image.key = s3Data.Key;
		await userQuery.save()
		res.json(userQuery)
	} catch (err) {
		console.log(err)
		res.status(400).json({ error: 'error' })
	}
}

exports.remove = async (req, res) => {
	const { slug } = req.params
	const { user } = req.body
	try {
		if (user.admin !== 'admin' && user.slug !== slug) {
			throw new Error('not permitted')
		}
		console.log('in remove')
		const data = await User.findOneAndDelete({ slug })
		console.log('data in remove', data)
		if (data.image.key) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${data.image.key}`
			}
			s3.deleteObject(deleteParams)
		}
		await User.updateMany({ _id: data.likedBy }, { '$pullAll': { usersILiked: [data._id] } })
		await User.updateMany({ likedBy: { '$in': data._id } }, { '$pullAll': { likedBy: [data._id] } })
		await Category.updateMany({ _id: data.categories }, { '$pullAll': { users: [data._id] } })
		await Life.updateMany({ likedBy: { '$in': data._id } }, {'$pullAll': { likedBy: [data._id] }})
		res.json({
			success: 'successfuly deleted'
		})
	} catch (err) {
		console.log('err removing', err)
		res.status(400).json({
			error: 'failed deleting'
		})
	}
}