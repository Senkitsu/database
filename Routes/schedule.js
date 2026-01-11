const express = require('express');
const router = express.Router(); // ← ЭТОЙ СТРОКИ НЕ ХВАТАЛО!
const scheduleController = require('../Controllers/scheduleController');

console.log('schedule.js загружается...');
console.log('Контроллер загружен:', Object.keys(scheduleController));

// Основные маршруты
router.get('/', scheduleController.getSchedule);
router.get('/courses', scheduleController.getCourses);
router.get('/groups', scheduleController.getGroups);
router.get('/classrooms', scheduleController.getClassrooms);

// Формы добавления
router.get('/add', scheduleController.getAddSchedule);
router.get('/courses/add', scheduleController.getAddCourse);
router.get('/groups/add', scheduleController.getAddGroup);
router.get('/classrooms/add', scheduleController.getAddClassroom);

// Редактирование
router.get('/:id/edit', scheduleController.getEditSchedule);
router.get('/courses/:id/edit', scheduleController.getEditCourse);
router.get('/groups/:id/edit', scheduleController.getEditGroup);
router.get('/classrooms/:id/edit', scheduleController.getEditClassroom);

// Удаление (POST запросы)
router.post('/:id/delete', scheduleController.deleteSchedule);
router.post('/courses/:id/delete', scheduleController.deleteCourse);
router.post('/groups/:id/delete', scheduleController.deleteGroup);
router.post('/classrooms/:id/delete', scheduleController.deleteClassroom);

// Добавление (POST запросы)
router.post('/add', scheduleController.postAddSchedule);
router.post('/courses/add', scheduleController.postAddCourse);
router.post('/groups/add', scheduleController.postAddGroup);
router.post('/classrooms/add', scheduleController.postAddClassroom);

// Редактирование (POST запросы)
router.post('/:id/edit', scheduleController.postEditSchedule);
router.post('/courses/:id/edit', scheduleController.postEditCourse);
router.post('/groups/:id/edit', scheduleController.postEditGroup);
router.post('/classrooms/:id/edit', scheduleController.postEditClassroom);

console.log('✅ Маршруты зарегистрированы');

module.exports = router;