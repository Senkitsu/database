const express = require('express');
const router = express.Router();
const facultiesController = require('../Controllers/facultiesController');

router.get('/', facultiesController.getFaculties);
router.get('/add', facultiesController.getAddFaculty);
router.post('/add', facultiesController.postAddFaculty);
router.get('/:id/edit', facultiesController.getEditFaculty);
router.post('/:id/edit', facultiesController.postEditFaculty);
router.post('/:id/delete', facultiesController.deleteFaculty);

module.exports = router;