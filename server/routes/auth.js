const express = require('express');
const router = express.Router();

// import validators
const { userRegisterValidator, userLoginValidator } = require('../validators/auth');
const { runValidation } = require('../validators');

// import from controllers
const { register, registerActivate, login, requireSignin, authMiddleware } = require('../controllers/auth');

router.get("/auth", requireSignin, authMiddleware)
router.post('/register', userRegisterValidator, runValidation, register);
router.post('/register/activate', registerActivate);
router.post('/login', userLoginValidator, runValidation, login);

module.exports = router;