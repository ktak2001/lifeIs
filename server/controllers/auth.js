const User = require('../models/user');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const { registerEmailParams, forgotPasswordEmailParams } = require('../helpers/email');
const shortId = require('shortid');
const _ = require('lodash');
const slugify = require('slugify');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

exports.register = (req, res) => {
	// console.log('REGISTER CONTROLLER', req.body);
	const { name, email, password } = req.body;
	// check if user exists in our db
	User.findOne({ email }).exec((err, user) => {
		if (user) {
			return res.status(400).json({
				error: 'Email is taken'
			});
		}
		// generate token with user name email and password
		const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
			expiresIn: '10m'
		});

		// send email
		const params = registerEmailParams(email, token);

		const sendEmailOnRegister = ses.sendEmail(params).promise();

		sendEmailOnRegister
			.then(data => {
				console.log('email submitted to SES', data);
				res.json({
					message: `Email has been sent to ${email}, Follow the instructions to complete your registration`
				});
			})
			.catch(error => {
				console.log('ses email on register', error);
				res.json({
					message: `We could not verify your email. Please try again`
				});
			});
	});
};

exports.registerActivate = (req, res) => {
	const { token } = req.body;
	// console.log(token);
	jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
		if (err) {
			return res.status(401).json({
				error: 'Expired link. Try again'
			});
		}

		const { name, email, password } = jwt.decode(token);
		const user_id = shortId.generate();
		const slug = slugify(user_id)

		User.findOne({ email }).exec((err, user) => {
			if (user) {
				return res.status(401).json({
					error: 'Email is taken'
				});
			}
			// register new user
			const newUser = new User({ user_id, name, email, password, slug, image: { key: '', url: '' }, content: '' });
			console.log("newUser: ", newUser);
			newUser.save((err, result) => {
				if (err) {
					return res.status(401).json({
						error: err.message
					});
				}
				return res.json({
					message: 'Registration success. Please login.'
				});
			});
		});
	});
};

exports.login = (req, res) => {
	const { email, password } = req.body;
	console.table({ email, password });
	User.findOne({ email }).exec((err, user) => {
		// console.log("Login error: ", err.message)
		console.log('err in login', err)
		console.log('user', user)
		if (err || !user) {
			return res.status(400).json({
				error: "error in logging in."
			});
		}
		// authenticate
		if (!user.authenticate(password)) {
			return res.status(400).json({
				error: 'Email and password do not match'
			});
		}

		const { _id, name, email, role } = user;
		console.log('ddddddddddddddddd')
		const token = jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '7d' });

		return res.json({
			token,
			user: { _id, name, email, role }
		});
	});
};

exports.requireSignin = expressjwt({
	secret: process.env.JWT_SECRET,
	algorithms: ["HS256"]
}); // decode the token in the header, and attach to req.auth. tokenにはauth._idの情報のみ入っている

// the token is made in login func(in this file)
// const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.authMiddleware = async (req, res, next) => {
	console.log("req in server:", req.auth._id)
	const authUserId = req.auth._id;
	try {
		const user = await User.findOne({ _id: authUserId })
		req.profile = user
		if (user !== null) {
			req.profile.hashed_password = undefined;
			req.profile.salt = undefined;
		}
		next()
	} catch (err) {
		console.log('err in authMiddleware', err)
		throw err
	}
};

exports.isAdmin = (req, res, next) => {
		if (req.profile.role !== 'admin') {
			return res.status(401).json({
				error: 'Admin resource. Access denied'
			});
		}
		next();
};

exports.forgotPassword = (req, res) => {
	const { email } = req.body;
	// check if user exists with that email
	User.findOne({ email }).exec((err, user) => {
		if (err || !user) {
			return res.json({
				error: 'User with that email does not exist'
			});
		}
		// generate token and email to user
		const token = jwt.sign({ name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });
		// send email
		const params = forgotPasswordEmailParams(email, token);

		// populate the db > user > resetPasswordLink
		return user.updateOne({ resetPasswordLink: token }, (err, success) => {
			if (err) {
				return res.status(400).json({
					error: 'Password reset failed. Try later.'
				});
			}
			const sendEmail = ses.sendEmail(params).promise();
			sendEmail
				.then(data => {
					console.log('ses reset pw success', data);
					return res.json({
						message: `Email has been sent to ${email}. Click on the link to reset your password`
					});
				})
				.catch(error => {
					console.log('ses reset pw failed', error);
					return res.json({
						message: `We could not vefiry your email. Try later.`
					});
				});
		});
	});
};

exports.resetPassword = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body;
	if (resetPasswordLink) {
		// check if expired.
		jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, success) => {
			if (err) {
				return res.status(400).json({
					error: 'Expired Link. Try again.'
				});
			}

			User.findOne({ resetPasswordLink }).exec((err, user) => {
				if (err || !user) {
					return res.status(400).json({
						error: 'Invalid token. Try again'
					});
				}

				const updatedFields = {
					password: newPassword,
					resetPasswordLink: ''
				};

				user = _.extend(user, updatedFields);

				user.save((err, result) => {
					if (err) {
						return res.status(400).json({
							error: 'Password reset failed. Try again'
						});
					}

					res.json({
						message: `Great! Now you can login with your new password`
					});
				});
			});
		});
	}
};
