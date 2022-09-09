const Life = require('../models/life')
const Category = require('../models/category')
const User = require('../models/user')
const _ = require("lodash")
const slugify = require('slugify');
const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const mongoose = require('mongoose')


const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});

exports.filter = async(req, res, next) => {
	const { categories, getSimilarLives, thisId } = req.body
	const livesId = {}
	const livesFullData = {}
	let sortable = []
	try {
		if (categories.length === 0) {
			if (getSimilarLives) {
				console.log('inside')
				res.locals.sortable = []
				res.locals.livesFullData = {}
				return next()
			}
			Life.find({}).exec((err, data) => {
				return res.json({ filteredLives: data })
			})
		}
		for (let idx = 0; idx < categories.length; idx++) {
			const id = categories[idx];
			const cat = await Category.findById(id).populate('lives')
			console.log('cat', cat)
			cat.lives.forEach(el => {
				livesId[el.id] !== undefined ? livesId[el.id] += 1 : livesId[el.id] = 1
				if (livesFullData[el.id] === undefined) {
					livesFullData[el.id] = el
				}
			})
		}
		Object.keys(livesId).forEach(id => {
			sortable.push([id, livesId[id]])
		})
		console.log('sortable1', sortable)
		sortable.sort((a, b) => (b[1] - a[1]))
		if (getSimilarLives) {
			res.locals.sortable = sortable
			res.locals.livesFullData = livesFullData
			return next()
		}
		console.log('sortable2', sortable)
		const filteredLives = sortable.map(el => livesFullData[el[0]])
		console.log('livesFullData', livesFullData)
		console.log('filteredLives', filteredLives)
		res.json({ filteredLives })
	} catch (err) {
		console.log('err', err)
		res.status(400).json({
			error: err.response
		})
	}
}

exports.similarLives = async (req, res) => {
	const { sortable, livesFullData } = res.locals
	const { thisId } = req.body
	try {
		const lf = await Life.find({})
		for (let idx = 0; sortable.length < 12 && idx < lf.length; idx++) {
			if (livesFullData[lf[idx]._id] === undefined) {
				sortable.push([lf[idx]._id, 0])
				livesFullData[lf[idx]._id] = lf[idx]
			}
		}
		sortable.forEach((el, idx1) => {
			let tmp = el
			let idx2 = Math.floor(Math.random() * (sortable.length - idx1) + idx1)
			sortable[idx1] = sortable[idx2]
			sortable[idx2] = tmp
		})
		const similarLives = sortable.map(el => livesFullData[el[0]._id])
		// console.log('similarLives', similarLives)
		const filteredSimilarLives = similarLives.filter(el => typeof el !== 'undefined' && el !== null)
		const idx = filteredSimilarLives.findIndex(el => el._id === thisId)
		if (idx > -1) {
			filteredSimilarLives.splice(idx, 1)
		}
		res.json({ similarLives: filteredSimilarLives })
	} catch (err) {
		res.status(400).json({
			error: 'error retrieving'
		})
	}
}

exports.readAll = (req, res) => {
	Life.find({})
		.sort({ name: 1 })
		.exec((err, lives) => {
			if (err) {
				console.log("err in finding Lives: ", err)
				res.status(400).json({ error: "error retrieving Lives." })
			} else {
				res.json({ lives: lives !== undefined ? lives : [] })
			}
		})
}

exports.content = async (req, res) => {
	const { slug } = req.body
	try {
		const lifeData = await Life.findOne({ slug }).populate("categories")
		res.json({ lifeData })
	} catch (err) {
		console.log(err)
		throw new Error('err in life content')
	}
}

exports.ranking = (req, res) => {
	// console.log("ranking:")
	Life.find({})
		.sort({ ViewedCount: -1 })
		.exec((err, lives) => {
			if (err) {
				return res.status(400).json({
					error: "Could not find datas."
				});
			}
			res.json({lives});
		});
};

exports.create = async (req, res) => {
	const { name, image, content, categories } = req.body
	const slug = slugify(name + uuidv4())
	let life = new Life({ name, content, slug, categories })
	try {
		if (image) {
			const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
			const type = image.split(';')[0].split('/')[1];
			const params = {
				Bucket: 'lifeisktak',
				Key: `life/${uuidv4()}.${type}`,
				Body: base64Data,
				ACL: 'public-read',
				ContentEncoding: 'base64',
				ContentType: `image/${type}`
			};
			const data = await s3.upload(params).promise()
			life.image.url = data.Location
			life.image.key = data.Key
		}
		life.postedBy = req.auth._id
		const lifeData = await life.save()
		const categoryDoc = await Category.updateMany({ _id: categories }, { '$push': { lives: lifeData._id } }, { new: true })
		console.log('categoryDoc', categoryDoc)
		res.json(lifeData)
	} catch (err) {
		console.log(err)
		res.status(400).json({ error: 'error' })
	}
}

exports.update = async (req, res) => {
	const { name, image, content, categories, slug } = req.body
	const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	const type = image.split(';')[0].split('/')[1];

	try {
		const lifeQuery = await Life.findOneAndUpdate({ slug }, { name, content, categories }, { new: true })
		await Category.updateMany({ lives: { '$in': lifeQuery._id } }, { '$pullAll': { lives: [lifeQuery._id] } })
		await Category.updateMany({ _id: categories }, { '$push': { lives: lifeQuery._id }})
		if (!image) {
			return res.json(lifeQuery)
		}
		if (lifeQuery.image.url) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${lifeQuery.image.key}`
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
		lifeQuery.image.url = s3Data.Location;
		lifeQuery.image.key = s3Data.Key;
		await lifeQuery.save()
		res.json(lifeQuery)
	} catch(err) {
		res.status(400).json({ error: 'error' })
	}
}

exports.remove = async (req, res) => {
	const { slug } = req.params
	try {
		const data = await Life.findOneAndDelete({ slug })
		if (data.image.key) {
			const deleteParams = {
				Bucket: 'lifeisktak',
				Key: `${data.image.key}`
			}
			s3.deleteObject(deleteParams)
		}
		await User.updateMany({ livesILiked: { '$in': data._id } }, { '$pullAll': { livesILiked: [data._id] } })
		await Category.updateMany({ lives: { '$in': data._id } }, { '$pullAll': { lives: [data._id] } })
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