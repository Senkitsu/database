const db = require('../db');

exports.getSchedule = async (req, res) => {
    try {
        console.log('📋 getSchedule вызван');
        
        const pool = await db.ready;
        
        // Простой тестовый запрос
        const scheduleResult = await pool.query('SELECT * FROM schedules ORDER BY id LIMIT 10');
        console.log('📊 Найдено занятий:', scheduleResult.rows.length);
        
        // Простые данные
        const testData = {
            title: 'Тест - Расписание',
            schedule: scheduleResult.rows,
            groups: [{id: 1, name: 'Тестовая группа'}],
            teachers: [{id: 1, first_name: 'Иван', last_name: 'Иванов'}],
            selectedGroup: '',
            selectedTeacher: ''
        };
        
        console.log('🎯 Отправляю данные:', Object.keys(testData));
        
        // Рендерим тестовый шаблон
        res.render('Schedule/Test', testData);
        
    } catch (err) {
        console.error('❌ Ошибка в getSchedule:', err);
        console.error('🔍 Детали ошибки:', err.stack);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
};

// Остальные функции пока заглушки
exports.getAddSchedule = (req, res) => res.send('Форма добавления');
exports.postAddSchedule = (req, res) => res.redirect('/schedule');
exports.getEditSchedule = (req, res) => res.send('Форма редактирования');
exports.postEditSchedule = (req, res) => res.redirect('/schedule');
exports.deleteSchedule = (req, res) => res.redirect('/schedule');

exports.getCourses = async (req, res) => {
    try {
        console.log('📚 getCourses вызван');
        
        const pool = await db.ready;
        const result = await pool.query('SELECT * FROM courses ORDER BY id LIMIT 10');
        console.log('📊 Найдено дисциплин:', result.rows.length);
        
        res.render('Schedule/CoursesTest', {
            title: 'Тест - Дисциплины',
            courses: result.rows
        });
        
    } catch (err) {
        console.error('❌ Ошибка в getCourses:', err);
        res.status(500).send('Ошибка сервера: ' + err.message);
    }
};
exports.getAddCourse = (req, res) => res.send('Добавить дисциплину');
exports.postAddCourse = (req, res) => res.redirect('/schedule/courses');
exports.getEditCourse = (req, res) => res.send('Редактировать дисциплину');
exports.postEditCourse = (req, res) => res.redirect('/schedule/courses');
exports.deleteCourse = (req, res) => res.redirect('/schedule/courses');

exports.getGroups = (req, res) => res.send('Группы');
exports.getAddGroup = (req, res) => res.send('Добавить группу');
exports.postAddGroup = (req, res) => res.redirect('/schedule/groups');
exports.getEditGroup = (req, res) => res.send('Редактировать группу');
exports.postEditGroup = (req, res) => res.redirect('/schedule/groups');
exports.deleteGroup = (req, res) => res.redirect('/schedule/groups');

exports.getClassrooms = (req, res) => res.send('Аудитории');
exports.getAddClassroom = (req, res) => res.send('Добавить аудиторию');
exports.postAddClassroom = (req, res) => res.redirect('/schedule/classrooms');
exports.getEditClassroom = (req, res) => res.send('Редактировать аудиторию');
exports.postEditClassroom = (req, res) => res.redirect('/schedule/classrooms');
exports.deleteClassroom = (req, res) => res.redirect('/schedule/classrooms');