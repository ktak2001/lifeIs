const Category = require("../models/category")
const Life = require('../models/life')
const slugify = require("slugify")
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});

exports.getFromIds = (req, res) => {
	const { categories } = req.body
	Category.find({ _id: { '$in': categories }}).exec((err, data) => {
		if (err) {
			console.log('err', err)
			return res.status(400).json({ error: 'error getFromIds' })
		}
		console.log('data gtfromids', data)
		res.json({ categories: data })
	})
}

exports.containedLives = async (req, res) => {
	const { category } = req.body
	try {
		const selectedLives = await Life.find({ _id: category.lives })
		console.log('selectedLives', selectedLives)
		console.log('selectedLives', typeof selectedLives)
		res.json({ selectedLives })
	} catch (err) {
		res.status(400).json({
			error: 'error retrieving lifeData'
		})
	}
}

exports.update = async (req, res) => {
	const { name, image, content, lives, slug } = req.body
	const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	const type = image.split(';')[0].split('/')[1];

	try {
		const categoryQuery = await Category.findOneAndUpdate({ slug }, { name, content, lives }, { new: true })
		await Life.updateMany({ categories: { '$in': categoryQuery._id } }, { '$pullAll': { categories: [categoryQuery._id] } })
		await Life.updateMany({ _id: lives }, { '$push': { categories: categoryQuery._id } })
		if (!image) {
			return res.json(categoryQuery)
		}
		if (categoryQuery.image.url) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${categoryQuery.image.key}`
			};
			s3.deleteObject(deleteParams, function (err, data) {
				if (err) console.log('S3 DELETE ERROR DURING UPDATE', err);
				else console.log('S3 DELETED DURING UPDATE', data);
			});
		}
		const params = {
			Bucket: 'lifeisktak',
			Key: `category/${uuidv4()}.${type}`,
			Body: base64Data,
			ACL: 'public-read',
			ContentEncoding: 'base64',
			ContentType: `image/${type}`
		};
		const s3Data = await s3.upload(params).promise()
		categoryQuery.image.url = s3Data.Location;
		categoryQuery.image.key = s3Data.Key;
		await categoryQuery.save()
		res.json(categoryQuery)
	} catch (err) {
		res.status(400).json({ error: 'error' })
	}
}

exports.content = async (req, res) => {
	const { slug } = req.body
	console.log("slug: ", slug)
	try {
		const categoryData = await Category.findOne({ slug }).populate("lives")
		res.json({ categoryData })
	} catch (err) {
		throw new Error('category content error')
	}
}

exports.read = (req, res) => {
	console.log("reading categories")
	Category.find({})
		.sort({ name: 1 })
		.exec((err, categories) => {
			if (err) {
				console.log("err in finding Categories: ", err)
				res.status(400).json({ error: "error retrieving Category." })
			} else {
				res.json({ categories: categories !== undefined ? categories : [] })
			}
		})
}

exports.create = async (req, res) => {
	const { name, image, content, lives } = req.body
	const slug = slugify(name + uuidv4())
	let category = new Category({ name, content, slug, lives })
	try {
		if (image) {
			const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
			const type = image.split(';')[0].split('/')[1];
			const params = {
				Bucket: 'lifeisktak',
				Key: `category/${uuidv4()}.${type}`,
				Body: base64Data,
				ACL: 'public-read',
				ContentEncoding: 'base64',
				ContentType: `image/${type}`
			};
			const data = await s3.upload(params).promise()
			category.image.url = data.Location
			category.image.key = data.Key
		}
		category.postedBy = req.auth._id
		const categoryData = await category.save()
		const lifeDoc = await Life.updateMany({ _id: lives }, {'$push': { categories: categoryData._id } }, {new: true})
		console.log('lifeDoc', lifeDoc)
		res.json(categoryData)
	} catch (err) {
		console.log(err)
		res.status(400).json({ error: 'error' })
	}
}

exports.remove = async (req, res) => {
	const { slug } = req.params
	try {
		const data = await Category.findOneAndDelete({ slug })
		if (data.image.key) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${data.image.key}`
			}
			s3.deleteObject(deleteParams)
		}
		await User.updateMany({ categories: { '$in': data._id }} , { '$pullAll': { categories : [data._id] }})
		await Life.updateMany({ categories: { '$in': data._id } }, { '$pullAll': { categories: [data._id] }})
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