const express = require('express');
const router = express.Router();

const {
	ranking, create, content, readAll, similarLives, update, filter, remove
} = require("../controllers/life.js")

const { register, registerActivate, login, requireSignin, authMiddleware, isAdmin } = require('../controllers/auth');
const { runValidation } = require("../validators")
const { lifeCreateValidator, lifeUpdateValidator } = require("../validators/life")

router.get("/ranking", ranking);
router.post("/life/create", lifeCreateValidator, runValidation, requireSignin, authMiddleware, isAdmin, create)
router.post("/life/content", content);
router.get("/lives", readAll)
router.post('/similarLives', filter, similarLives)
router.post("/life/update", lifeUpdateValidator, runValidation, requireSignin, authMiddleware, isAdmin, update)
router.post('/lives/filter', filter)
router.delete('/life/:slug', requireSignin, authMiddleware, isAdmin, remove)

module.exports = router;