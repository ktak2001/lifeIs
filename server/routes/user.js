const express = require('express');
const router = express.Router();

const {
	updateLifeLike, updateUserLike, content
} = require("../controllers/user.js")

const { register, registerActivate, login, requireSignin, authMiddleware, isAdmin } = require('../controllers/auth');

router.post("/user/update/likelife", requireSignin, authMiddleware, updateLifeLike)
router.post("/user/update/likeuser", requireSignin, authMiddleware, updateUserLike)
router.post('/user/content', content)

module.exports = router;