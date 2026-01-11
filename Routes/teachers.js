const express = require('express');
const router = express.Router();
const teachersController = require('../Controllers/teachersController');

// ====================== ПРЕПОДАВАТЕЛИ ======================
// Главная страница - список преподавателей
router.get('/', teachersController.getTeachers);

// Добавление нового преподавателя
router.get('/add', teachersController.getAddTeacher);
router.post('/add', teachersController.postAddTeacher);

// Редактирование преподавателя (RESTful стиль: /resource/:id/edit)
router.get('/:id/edit', teachersController.getEditTeacher);
router.post('/:id/edit', teachersController.postEditTeacher);

// Удаление преподавателя
router.post('/:id/delete', teachersController.deleteTeacher);

// Просмотр деталей преподавателя (если нужно)
router.get('/:id', teachersController.getTeacherDetails);

// ====================== КАФЕДРЫ ======================
// Список кафедр
router.get('/departments', teachersController.getDepartments);

// Добавление новой кафедры
router.get('/departments/add', teachersController.getAddDepartment);
router.post('/departments/add', teachersController.postAddDepartment);

// Редактирование кафедры
router.get('/departments/:id/edit', teachersController.getEditDepartment);
router.post('/departments/:id/edit', teachersController.postEditDepartment);

// Удаление кафедры
router.post('/departments/:id/delete', teachersController.deleteDepartment);

// Просмотр деталей кафедры (если нужно)
router.get('/departments/:id', teachersController.getDepartmentDetails);

module.exports = router;