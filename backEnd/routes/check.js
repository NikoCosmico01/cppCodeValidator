// routes/check.js
const express = require('express');
const router = express.Router();
const checkController = require('../controllers/checkController');

// POST - Check C++ code
router.post('/check', checkController.checkCode.bind(checkController));

// GET - Health check
router.get('/health', checkController.health.bind(checkController));

// GET - Cppcheck version
router.get('/version', checkController.version.bind(checkController));

module.exports = router;