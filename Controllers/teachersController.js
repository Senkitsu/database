const pool = require('../db');

exports.getTeachers = async (req, res) => {
    try {
        const query = `
            SELECT t.*, 
                   COUNT(s.id) as schedule_count,
                   d.name as department_name
            FROM teachers t
            LEFT JOIN schedules s ON t.id = s.teacher_id
            LEFT JOIN departments d ON t.department_id = d.id
            GROUP BY t.id, d.name
            ORDER BY t.first_name, t.last_name
        `;

        const result = await pool.query(query);

        res.render('Teachers/Teachers', {
            title: 'Преподаватели',
            teachers: result.rows,
            activePage: 'teachers'
        });
    } catch (err) {
        console.error('Ошибка при получении списка преподавателей:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const query = `
            SELECT d.*, 
                   COUNT(t.id) as teacher_count,
                   f.name as faculty_name
            FROM departments d
            LEFT JOIN teachers t ON d.id = t.department_id
            LEFT JOIN faculties f ON d.faculty_id = f.id
            GROUP BY d.id, f.name
            ORDER BY d.name
        `;

        const result = await pool.query(query);

        res.render('Teachers/Departments', {
            title: 'Кафедры',
            departments: result.rows,
            activePage: 'departments'
        });
    } catch (err) {
        console.error('Ошибка при получении списка кафедр:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getAddTeacher = async (req, res) => {
    try {
        const departmentsResult = await pool.query('SELECT * FROM departments ORDER BY name');
        
        res.render('Teachers/addTeacher', {
            title: 'Добавить преподавателя',
            departments: departmentsResult.rows,
            activePage: 'teachers'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления преподавателя:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postAddTeacher = async (req, res) => {
    const { first_name, last_name, email, phone, department_id, position, degree } = req.body;

    try {
        const query = 'INSERT INTO teachers (first_name, last_name, email, phone, department_id, position, degree) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await pool.query(query, [first_name, last_name, email, phone, department_id, position, degree]);

        res.redirect('/teachers');
    } catch (err) {
        console.error('Ошибка при добавлении преподавателя:', err);

        if (err.code === '23505') {
            res.status(400).send('Преподаватель с таким email уже существует');
        } else {
            res.status(500).send('Ошибка при добавлении преподавателя');
        }
    }
};

exports.getAddDepartment = async (req, res) => {
    try {
        const facultiesResult = await pool.query('SELECT * FROM faculties ORDER BY name');
        res.render('Teachers/addDepartment', {
            title: 'Добавить кафедру',
            faculties: facultiesResult.rows,
            activePage: 'departments'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления кафедры:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postAddDepartment = async (req, res) => {
    const { name, faculty_id, head_name, phone, email } = req.body;

    try {
        const query = 'INSERT INTO departments (name, faculty_id, head_name, phone, email) VALUES ($1, $2, $3, $4, $5)';
        await pool.query(query, [name, faculty_id, head_name, phone, email]);

        res.redirect('/departments');
    } catch (err) {
        console.error('Ошибка при добавлении кафедры:', err);
        res.status(500).send('Ошибка при добавлении кафедры');
    }
};

exports.getEditTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const result = await pool.query('SELECT * FROM teachers WHERE id = $1', [teacherId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Преподаватель не найден');
        }

        const departmentsResult = await pool.query('SELECT * FROM departments ORDER BY name');

        res.render('Teachers/editTeacher', {
            title: 'Редактировать преподавателя',
            teacher: result.rows[0],
            departments: departmentsResult.rows,
            activePage: 'teachers'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования преподавателя:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditTeacher = async (req, res) => {
    const teacherId = req.params.id;
    const { first_name, last_name, email, phone, department_id, position, degree } = req.body;

    try {
        const query = 'UPDATE teachers SET first_name = $1, last_name = $2, email = $3, phone = $4, department_id = $5, position = $6, degree = $7 WHERE id = $8';
        await pool.query(query, [first_name, last_name, email, phone, department_id, position, degree, teacherId]);

        res.redirect('/teachers');
    } catch (err) {
        console.error('Ошибка при редактировании преподавателя:', err);

        if (err.code === '23505') {
            res.status(400).send('Преподаватель с таким email уже существует');
        } else {
            res.status(500).send('Ошибка при редактировании преподавателя');
        }
    }
};

exports.getEditDepartment = async (req, res) => {
    try {
        const departmentId = req.params.id;
        const result = await pool.query('SELECT * FROM departments WHERE id = $1', [departmentId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Кафедра не найдена');
        }

        const facultiesResult = await pool.query('SELECT * FROM faculties ORDER BY name');

        res.render('Teachers/editDepartment', {
            title: 'Редактировать кафедру',
            department: result.rows[0],
            faculties: facultiesResult.rows,
            activePage: 'departments'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования кафедры:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditDepartment = async (req, res) => {
    const departmentId = req.params.id;
    const { name, faculty_id, head_name, phone, email } = req.body;

    try {
        const query = 'UPDATE departments SET name = $1, faculty_id = $2, head_name = $3, phone = $4, email = $5 WHERE id = $6';
        await pool.query(query, [name, faculty_id, head_name, phone, email, departmentId]);

        res.redirect('/departments');
    } catch (err) {
        console.error('Ошибка при редактировании кафедры:', err);
        res.status(500).send('Ошибка при редактировании кафедры');
    }
};

exports.deleteTeacher = async (req, res) => {
    const teacherId = req.params.id;

    try {
        const checkResult = await pool.query('SELECT COUNT(*) FROM schedules WHERE teacher_id = $1', [teacherId]);
        const scheduleCount = parseInt(checkResult.rows[0].count);

        if (scheduleCount > 0) {
            return res.status(400).send(`Невозможно удалить преподавателя, так как у него есть занятия в расписании (${scheduleCount} шт.). Сначала удалите его занятия.`);
        }

        await pool.query('DELETE FROM teachers WHERE id = $1', [teacherId]);
        res.redirect('/teachers');
    } catch (err) {
        console.error('Ошибка при удалении преподавателя:', err);
        res.status(500).send('Ошибка при удалении преподавателя');
    }
};

exports.deleteDepartment = async (req, res) => {
    const departmentId = req.params.id;

    try {
        const teachersCheck = await pool.query('SELECT COUNT(*) FROM teachers WHERE department_id = $1', [departmentId]);
        const coursesCheck = await pool.query('SELECT COUNT(*) FROM courses WHERE department_id = $1', [departmentId]);

        const teachersCount = parseInt(teachersCheck.rows[0].count);
        const coursesCount = parseInt(coursesCheck.rows[0].count);

        if (teachersCount > 0 || coursesCount > 0) {
            let errorMessage = 'Невозможно удалить кафедру, так как:';
            if (teachersCount > 0) errorMessage += `\n- Привязано преподавателей: ${teachersCount}`;
            if (coursesCount > 0) errorMessage += `\n- Привязано дисциплин: ${coursesCount}`;
            errorMessage += '\nСначала удалите или переместите связанные записи.';
            
            return res.status(400).send(errorMessage);
        }

        await pool.query('DELETE FROM departments WHERE id = $1', [departmentId]);
        res.redirect('/departments');
    } catch (err) {
        console.error('Ошибка при удалении кафедры:', err);
        res.status(500).send('Ошибка при удалении кафедры');
    }
};