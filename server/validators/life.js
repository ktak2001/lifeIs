const { check } = require('express-validator');

exports.lifeCreateValidator = [
	check('name')
		.not()
		.isEmpty()
		.withMessage('Name is required'),
	check('image')
		.not()
		.isEmpty()
		.withMessage('Image is required'),
	check('content')
		.isLength({ min: 20 })
		.withMessage('Content is required and should be at least 20 characters long')
];

exports.lifeUpdateValidator = [
	check('name')
		.not()
		.isEmpty()
		.withMessage('Name is required'),
	check('content')
		.isLength({ min: 20 })
		.withMessage('Content is required')
];

