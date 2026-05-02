'use strict';

const { Router } = require('express');
const { migrate } = require('../controllers/setupController');

const router = Router();

// POST /api/setup/migrate — Run database migrations
// Requires: Authorization: Bearer <SETUP_TOKEN> header
router.post('/migrate', migrate);

module.exports = router;
