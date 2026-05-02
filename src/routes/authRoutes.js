'use strict';

const { Router } = require('express');
const { register, login } = require('../controllers/authController');
const { registerRules, loginRules } = require('../middlewares/validationMiddleware');

const router = Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);

module.exports = router;
