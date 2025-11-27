const express = require('express');
const router = express.Router();
const homeController = require('../Controllers/homeController');

router.get('/', homeController.getIndex);
router.get('/about', homeController.getAbout);

module.exports = router;