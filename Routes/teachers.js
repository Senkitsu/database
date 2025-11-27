const express = require('express');
const router = express.Router();
const teachersController = require('../Controllers/teachersController');

router.get('/', teachersController.getTeachers);
router.get('/add', teachersController.getAddTeacher);
router.post('/add', teachersController.postAddTeacher);
router.get('/:id/edit', teachersController.getEditTeacher);
router.post('/:id/edit', teachersController.postEditTeacher);
router.post('/:id/delete', teachersController.deleteTeacher);

router.get('/departments', teachersController.getDepartments);
router.get('/departments/add', teachersController.getAddDepartment);
router.post('/departments/add', teachersController.postAddDepartment);
router.get('/departments/:id/edit', teachersController.getEditDepartment);
router.post('/departments/:id/edit', teachersController.postEditDepartment);
router.post('/departments/:id/delete', teachersController.deleteDepartment);

module.exports = router;