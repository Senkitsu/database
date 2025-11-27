const pool = require('../db');

exports.getSchedule = async (req, res) => {
    try {
        const groupId = req.query.group_id;
        const teacherId = req.query.teacher_id;

        let query;
        let params = [];
        
        if (groupId) {
            query = `
                SELECT s.*, 
                       c.name as course_name,
                       t.first_name || ' ' || t.last_name as teacher_name,
                       g.name as group_name,
                       cr.number as classroom_number,
                       cr.type as classroom_type
                FROM schedules s
                JOIN courses c ON s.course_id = c.id
                JOIN teachers t ON s.teacher_id = t.id
                JOIN student_groups g ON s.group_id = g.id
                JOIN classrooms cr ON s.classroom_id = cr.id
                WHERE s.group_id = $1
                ORDER BY s.day_of_week, s.start_time
            `;
            params = [groupId];
        } else if (teacherId) {
            query = `
                SELECT s.*, 
                       c.name as course_name,
                       t.first_name || ' ' || t.last_name as teacher_name,
                       g.name as group_name,
                       cr.number as classroom_number,
                       cr.type as classroom_type
                FROM schedules s
                JOIN courses c ON s.course_id = c.id
                JOIN teachers t ON s.teacher_id = t.id
                JOIN student_groups g ON s.group_id = g.id
                JOIN classrooms cr ON s.classroom_id = cr.id
                WHERE s.teacher_id = $1
                ORDER BY s.day_of_week, s.start_time
            `;
            params = [teacherId];
        } else {
            query = `
                SELECT s.*, 
                       c.name as course_name,
                       t.first_name || ' ' || t.last_name as teacher_name,
                       g.name as group_name,
                       cr.number as classroom_number,
                       cr.type as classroom_type
                FROM schedules s
                JOIN courses c ON s.course_id = c.id
                JOIN teachers t ON s.teacher_id = t.id
                JOIN student_groups g ON s.group_id = g.id
                JOIN classrooms cr ON s.classroom_id = cr.id
                ORDER BY s.day_of_week, s.start_time
            `;
        }

        const scheduleResult = await pool.query(query, params);
        const groupsResult = await pool.query('SELECT * FROM student_groups ORDER BY name');
        const teachersResult = await pool.query('SELECT * FROM teachers ORDER BY first_name, last_name');

        res.render('Schedule/Schedule', {
            title: 'Расписание занятий',
            schedule: scheduleResult.rows,
            groups: groupsResult.rows,
            teachers: teachersResult.rows,
            selectedGroup: groupId,
            selectedTeacher: teacherId,
            activePage: 'schedule'
        });
    } catch (err) {
        console.error('Ошибка при получении расписания:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getCourses = async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
                   COUNT(s.id) as schedule_count,
                   d.name as department_name
            FROM courses c
            LEFT JOIN schedules s ON c.id = s.course_id
            LEFT JOIN departments d ON c.department_id = d.id
            GROUP BY c.id, d.name
            ORDER BY c.name
        `;

        const result = await pool.query(query);

        res.render('Schedule/Courses', {
            title: 'Дисциплины',
            courses: result.rows,
            activePage: 'courses'
        });
    } catch (err) {
        console.error('Ошибка при получении списка дисциплин:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getGroups = async (req, res) => {
    try {
        const query = `
            SELECT g.*, 
                   COUNT(s.id) as schedule_count,
                   f.name as faculty_name
            FROM student_groups g
            LEFT JOIN schedules s ON g.id = s.group_id
            LEFT JOIN faculties f ON g.faculty_id = f.id
            GROUP BY g.id, f.name
            ORDER BY g.name
        `;

        const result = await pool.query(query);

        res.render('Schedule/Groups', {
            title: 'Учебные группы',
            groups: result.rows,
            activePage: 'groups'
        });
    } catch (err) {
        console.error('Ошибка при получении списка групп:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
                   COUNT(s.id) as schedule_count
            FROM classrooms c
            LEFT JOIN schedules s ON c.id = s.classroom_id
            GROUP BY c.id
            ORDER BY c.number
        `;

        const result = await pool.query(query);

        res.render('Schedule/Classrooms', {
            title: 'Аудитории',
            classrooms: result.rows,
            activePage: 'classrooms'
        });
    } catch (err) {
        console.error('Ошибка при получении списка аудиторий:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getAddSchedule = async (req, res) => {
    try {
        const coursesResult = await pool.query('SELECT * FROM courses ORDER BY name');
        const teachersResult = await pool.query('SELECT * FROM teachers ORDER BY first_name, last_name');
        const groupsResult = await pool.query('SELECT * FROM student_groups ORDER BY name');
        const classroomsResult = await pool.query('SELECT * FROM classrooms ORDER BY number');

        res.render('Schedule/addSchedule', {
            title: 'Добавить занятие',
            courses: coursesResult.rows,
            teachers: teachersResult.rows,
            groups: groupsResult.rows,
            classrooms: classroomsResult.rows,
            activePage: 'schedule'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления занятия:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postAddSchedule = async (req, res) => {
    const { course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const checkConflictQuery = `
            SELECT COUNT(*) FROM schedules 
            WHERE (teacher_id = $1 OR group_id = $2 OR classroom_id = $3) 
            AND day_of_week = $4 
            AND (
                (start_time <= $5 AND end_time > $5) OR
                (start_time < $6 AND end_time >= $6) OR
                (start_time >= $5 AND end_time <= $6)
            )
        `;
        
        const conflictResult = await client.query(checkConflictQuery, [
            teacher_id, group_id, classroom_id, day_of_week, start_time, end_time
        ]);

        if (parseInt(conflictResult.rows[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).send('Обнаружен конфликт расписания');
        }

        const insertQuery = `
            INSERT INTO schedules (course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        await client.query(insertQuery, [
            course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type
        ]);

        await client.query('COMMIT');
        res.redirect('/schedule');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка при добавлении занятия:', err);
        res.status(500).send('Ошибка при добавлении занятия');
    } finally {
        client.release();
    }
};

exports.getAddCourse = async (req, res) => {
    try {
        const departmentsResult = await pool.query('SELECT * FROM departments ORDER BY name');
        res.render('Schedule/addCourse', {
            title: 'Добавить дисциплину',
            departments: departmentsResult.rows,
            activePage: 'courses'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления дисциплины:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postAddCourse = async (req, res) => {
    const { name, department_id, hours_lecture, hours_practice, hours_lab, description } = req.body;

    try {
        const query = 'INSERT INTO courses (name, department_id, hours_lecture, hours_practice, hours_lab, description) VALUES ($1, $2, $3, $4, $5, $6)';
        await pool.query(query, [name, department_id, hours_lecture, hours_practice, hours_lab, description]);

        res.redirect('/courses');
    } catch (err) {
        console.error('Ошибка при добавлении дисциплины:', err);
        res.status(500).send('Ошибка при добавлении дисциплины');
    }
};

exports.getAddGroup = async (req, res) => {
    try {
        const facultiesResult = await pool.query('SELECT * FROM faculties ORDER BY name');
        res.render('Schedule/addGroup', {
            title: 'Добавить группу',
            faculties: facultiesResult.rows,
            activePage: 'groups'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления группы:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postAddGroup = async (req, res) => {
    const { name, faculty_id, student_count } = req.body;

    try {
        const query = 'INSERT INTO student_groups (name, faculty_id, student_count) VALUES ($1, $2, $3)';
        await pool.query(query, [name, faculty_id, student_count]);

        res.redirect('/groups');
    } catch (err) {
        console.error('Ошибка при добавлении группы:', err);
        res.status(500).send('Ошибка при добавлении группы');
    }
};

exports.getAddClassroom = (req, res) => {
    res.render('Schedule/addClassroom', {
        title: 'Добавить аудиторию',
        activePage: 'classrooms'
    });
};

exports.postAddClassroom = async (req, res) => {
    const { number, type, capacity, equipment } = req.body;

    try {
        const query = 'INSERT INTO classrooms (number, type, capacity, equipment) VALUES ($1, $2, $3, $4)';
        await pool.query(query, [number, type, capacity, equipment]);

        res.redirect('/classrooms');
    } catch (err) {
        console.error('Ошибка при добавлении аудитории:', err);
        res.status(500).send('Ошибка при добавлении аудитории');
    }
};

exports.getEditSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const scheduleResult = await pool.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);

        if (scheduleResult.rows.length === 0) {
            return res.status(404).send('Занятие не найдено');
        }

        const coursesResult = await pool.query('SELECT * FROM courses ORDER BY name');
        const teachersResult = await pool.query('SELECT * FROM teachers ORDER BY first_name, last_name');
        const groupsResult = await pool.query('SELECT * FROM student_groups ORDER BY name');
        const classroomsResult = await pool.query('SELECT * FROM classrooms ORDER BY number');

        res.render('Schedule/editSchedule', {
            title: 'Редактировать занятие',
            schedule: scheduleResult.rows[0],
            courses: coursesResult.rows,
            teachers: teachersResult.rows,
            groups: groupsResult.rows,
            classrooms: classroomsResult.rows,
            activePage: 'schedule'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditSchedule = async (req, res) => {
    const scheduleId = req.params.id;
    const { course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const checkConflictQuery = `
            SELECT COUNT(*) FROM schedules 
            WHERE id != $1 
            AND (teacher_id = $2 OR group_id = $3 OR classroom_id = $4) 
            AND day_of_week = $5 
            AND (
                (start_time <= $6 AND end_time > $6) OR
                (start_time < $7 AND end_time >= $7) OR
                (start_time >= $6 AND end_time <= $7)
            )
        `;
        
        const conflictResult = await client.query(checkConflictQuery, [
            scheduleId, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time
        ]);

        if (parseInt(conflictResult.rows[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).send('Обнаружен конфликт расписания');
        }

        const updateQuery = `
            UPDATE schedules
            SET course_id = $1, teacher_id = $2, group_id = $3, classroom_id = $4,
                day_of_week = $5, start_time = $6, end_time = $7, lesson_type = $8
            WHERE id = $9
        `;
        
        await client.query(updateQuery, [
            course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type, scheduleId
        ]);

        await client.query('COMMIT');
        res.redirect('/schedule');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка при редактировании занятия:', err);
        res.status(500).send('Ошибка при редактировании занятия');
    } finally {
        client.release();
    }
};

exports.getEditCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);

        if (courseResult.rows.length === 0) {
            return res.status(404).send('Дисциплина не найдена');
        }

        const departmentsResult = await pool.query('SELECT * FROM departments ORDER BY name');

        res.render('Schedule/editCourse', {
            title: 'Редактировать дисциплину',
            course: courseResult.rows[0],
            departments: departmentsResult.rows,
            activePage: 'courses'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования дисциплины:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditCourse = async (req, res) => {
    const courseId = req.params.id;
    const { name, department_id, hours_lecture, hours_practice, hours_lab, description } = req.body;

    try {
        const query = 'UPDATE courses SET name = $1, department_id = $2, hours_lecture = $3, hours_practice = $4, hours_lab = $5, description = $6 WHERE id = $7';
        await pool.query(query, [name, department_id, hours_lecture, hours_practice, hours_lab, description, courseId]);

        res.redirect('/courses');
    } catch (err) {
        console.error('Ошибка при редактировании дисциплины:', err);
        res.status(500).send('Ошибка при редактировании дисциплины');
    }
};

exports.getEditGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const groupResult = await pool.query('SELECT * FROM student_groups WHERE id = $1', [groupId]);

        if (groupResult.rows.length === 0) {
            return res.status(404).send('Группа не найдена');
        }

        const facultiesResult = await pool.query('SELECT * FROM faculties ORDER BY name');

        res.render('Schedule/editGroup', {
            title: 'Редактировать группу',
            group: groupResult.rows[0],
            faculties: facultiesResult.rows,
            activePage: 'groups'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования группы:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditGroup = async (req, res) => {
    const groupId = req.params.id;
    const { name, faculty_id, student_count } = req.body;

    try {
        const query = 'UPDATE student_groups SET name = $1, faculty_id = $2, student_count = $3 WHERE id = $4';
        await pool.query(query, [name, faculty_id, student_count, groupId]);

        res.redirect('/groups');
    } catch (err) {
        console.error('Ошибка при редактировании группы:', err);
        res.status(500).send('Ошибка при редактировании группы');
    }
};

exports.getEditClassroom = async (req, res) => {
    try {
        const classroomId = req.params.id;
        const classroomResult = await pool.query('SELECT * FROM classrooms WHERE id = $1', [classroomId]);

        if (classroomResult.rows.length === 0) {
            return res.status(404).send('Аудитория не найдена');
        }

        res.render('Schedule/editClassroom', {
            title: 'Редактировать аудиторию',
            classroom: classroomResult.rows[0],
            activePage: 'classrooms'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования аудитории:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditClassroom = async (req, res) => {
    const classroomId = req.params.id;
    const { number, type, capacity, equipment } = req.body;

    try {
        const query = 'UPDATE classrooms SET number = $1, type = $2, capacity = $3, equipment = $4 WHERE id = $5';
        await pool.query(query, [number, type, capacity, equipment, classroomId]);

        res.redirect('/classrooms');
    } catch (err) {
        console.error('Ошибка при редактировании аудитории:', err);
        res.status(500).send('Ошибка при редактировании аудитории');
    }
};

exports.deleteSchedule = async (req, res) => {
    const scheduleId = req.params.id;

    try {
        await pool.query('DELETE FROM schedules WHERE id = $1', [scheduleId]);
        res.redirect('/schedule');
    } catch (err) {
        console.error('Ошибка при удалении занятия:', err);
        res.status(500).send('Ошибка при удалении занятия');
    }
};

exports.deleteCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        const checkResult = await pool.query('SELECT COUNT(*) FROM schedules WHERE course_id = $1', [courseId]);
        const scheduleCount = parseInt(checkResult.rows[0].count);

        if (scheduleCount > 0) {
            return res.status(400).send(`Невозможно удалить дисциплину, так как она используется в расписании (${scheduleCount} занятий)`);
        }

        await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
        res.redirect('/courses');
    } catch (err) {
        console.error('Ошибка при удалении дисциплины:', err);
        res.status(500).send('Ошибка при удалении дисциплины');
    }
};

exports.deleteGroup = async (req, res) => {
    const groupId = req.params.id;

    try {
        const checkResult = await pool.query('SELECT COUNT(*) FROM schedules WHERE group_id = $1', [groupId]);
        const scheduleCount = parseInt(checkResult.rows[0].count);

        if (scheduleCount > 0) {
            return res.status(400).send(`Невозможно удалить группу, так как она используется в расписании (${scheduleCount} занятий)`);
        }

        await pool.query('DELETE FROM student_groups WHERE id = $1', [groupId]);
        res.redirect('/groups');
    } catch (err) {
        console.error('Ошибка при удалении группы:', err);
        res.status(500).send('Ошибка при удалении группы');
    }
};

exports.deleteClassroom = async (req, res) => {
    const classroomId = req.params.id;

    try {
        const checkResult = await pool.query('SELECT COUNT(*) FROM schedules WHERE classroom_id = $1', [classroomId]);
        const scheduleCount = parseInt(checkResult.rows[0].count);

        if (scheduleCount > 0) {
            return res.status(400).send(`Невозможно удалить аудиторию, так как она используется в расписании (${scheduleCount} занятий)`);
        }

        await pool.query('DELETE FROM classrooms WHERE id = $1', [classroomId]);
        res.redirect('/classrooms');
    } catch (err) {
        console.error('Ошибка при удалении аудитории:', err);
        res.status(500).send('Ошибка при удалении аудитории');
    }
};