const { check } = require('express-validator');

exports.lifeCreateValidator = [
	check('name')
		.not()
		.isEmpty()
		.withMessage('Name is required')
];

exports.lifeUpdateValidator = [
	check('name')
		.not()
		.isEmpty()
		.withMessage('Name is required')
];

