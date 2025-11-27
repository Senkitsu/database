const express = require('express');
const router = express.Router();
const scheduleController = require('../Controllers/scheduleController');

// Расписание занятий
router.get('/', scheduleController.getSchedule);
router.get('/add', scheduleController.getAddSchedule);
router.post('/add', scheduleController.postAddSchedule);
router.get('/:id/edit', scheduleController.getEditSchedule);
router.post('/:id/edit', scheduleController.postEditSchedule);
router.post('/:id/delete', scheduleController.deleteSchedule);
router.get('/:id/details', scheduleController.getScheduleDetails);

// Дисциплины
router.get('/courses', scheduleController.getCourses);
router.get('/courses/add', scheduleController.getAddCourse);
router.post('/courses/add', scheduleController.postAddCourse);
router.get('/courses/:id/edit', scheduleController.getEditCourse);
router.post('/courses/:id/edit', scheduleController.postEditCourse);
router.post('/courses/:id/delete', scheduleController.deleteCourse);

// Учебные группы
router.get('/groups', scheduleController.getGroups);
router.get('/groups/add', scheduleController.getAddGroup);
router.post('/groups/add', scheduleController.postAddGroup);
router.get('/groups/:id/edit', scheduleController.getEditGroup);
router.post('/groups/:id/edit', scheduleController.postEditGroup);
router.post('/groups/:id/delete', scheduleController.deleteGroup);

// Аудитории
router.get('/classrooms', scheduleController.getClassrooms);
router.get('/classrooms/add', scheduleController.getAddClassroom);
router.post('/classrooms/add', scheduleController.postAddClassroom);
router.get('/classrooms/:id/edit', scheduleController.getEditClassroom);
router.post('/classrooms/:id/edit', scheduleController.postEditClassroom);
router.post('/classrooms/:id/delete', scheduleController.deleteClassroom);

module.exports = router;