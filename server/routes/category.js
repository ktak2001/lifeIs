const express = require('express');
const router = express.Router();

const {
	readAll, create, content, update, containedLives, getFromIds, remove
} = require("../controllers/category")

const { register, registerActivate, login, requireSignin, authMiddleware, isAdmin } = require('../controllers/auth');
const { runValidation } = require("../validators")
const { categoryCreateValidator, categoryUpdateValidator } = require("../validators/category")

router.get("/categories", readAll);
router.post("/category/create", categoryCreateValidator, runValidation, requireSignin, authMiddleware, isAdmin, create)
router.post("/category/content", content)
router.post("/category/update", categoryUpdateValidator, runValidation, requireSignin, authMiddleware, isAdmin, update)
router.post('/category/containedLives', containedLives)
router.post('/categories/getByIds', getFromIds)
router.delete('/category/:slug', requireSignin, authMiddleware, isAdmin, remove)

module.exports = router;