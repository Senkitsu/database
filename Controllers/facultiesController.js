const pool = require('../db');

exports.getFaculties = async (req, res) => {
    try {
        const query = `
            SELECT f.*, 
                   COUNT(DISTINCT d.id) as department_count,
                   COUNT(DISTINCT g.id) as group_count
            FROM faculties f
            LEFT JOIN departments d ON f.id = d.faculty_id
            LEFT JOIN student_groups g ON f.id = g.faculty_id
            GROUP BY f.id
            ORDER BY f.name
        `;

        const result = await pool.query(query);

        res.render('Faculties/Faculties', {
            title: 'Факультеты',
            faculties: result.rows,
            activePage: 'faculties'
        });
    } catch (err) {
        console.error('Ошибка при получении списка факультетов:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getAddFaculty = (req, res) => {
    res.render('Faculties/addFaculty', {
        title: 'Добавить факультет',
        activePage: 'faculties'
    });
};

exports.postAddFaculty = async (req, res) => {
    const { name, dean, dean_position, phone, email, description } = req.body;

    try {
        const query = 'INSERT INTO faculties (name, dean, dean_position, phone, email, description) VALUES ($1, $2, $3, $4, $5, $6)';
        await pool.query(query, [name, dean, dean_position, phone, email, description || null]);

        res.redirect('/faculties');
    } catch (err) {
        console.error('Ошибка при добавлении факультета:', err);

        if (err.code === '23505') {
            res.status(400).send('Факультет с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при добавлении факультета');
        }
    }
};

exports.getEditFaculty = async (req, res) => {
    try {
        const facultyId = req.params.id;
        const result = await pool.query('SELECT * FROM faculties WHERE id = $1', [facultyId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Факультет не найден');
        }

        res.render('Faculties/editFaculty', {
            title: 'Редактировать факультет',
            faculty: result.rows[0],
            activePage: 'faculties'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования факультета:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditFaculty = async (req, res) => {
    const facultyId = req.params.id;
    const { name, dean, dean_position, phone, email, description } = req.body;

    try {
        const query = 'UPDATE faculties SET name = $1, dean = $2, dean_position = $3, phone = $4, email = $5, description = $6 WHERE id = $7';
        await pool.query(query, [name, dean, dean_position, phone, email, description || null, facultyId]);

        res.redirect('/faculties');
    } catch (err) {
        console.error('Ошибка при редактировании факультета:', err);

        if (err.code === '23505') {
            res.status(400).send('Факультет с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при редактировании факультета');
        }
    }
};

exports.deleteFaculty = async (req, res) => {
    const facultyId = req.params.id;

    try {
        const departmentsCheck = await pool.query('SELECT COUNT(*) FROM departments WHERE faculty_id = $1', [facultyId]);
        const groupsCheck = await pool.query('SELECT COUNT(*) FROM student_groups WHERE faculty_id = $1', [facultyId]);

        const departmentCount = parseInt(departmentsCheck.rows[0].count);
        const groupCount = parseInt(groupsCheck.rows[0].count);

        if (departmentCount > 0 || groupCount > 0) {
            let errorMessage = 'Невозможно удалить факультет, так как:';
            if (departmentCount > 0) errorMessage += `\n- Привязано кафедр: ${departmentCount}`;
            if (groupCount > 0) errorMessage += `\n- Привязано групп: ${groupCount}`;
            errorMessage += '\nСначала удалите или переместите связанные записи.';
            
            return res.status(400).send(errorMessage);
        }

        await pool.query('DELETE FROM faculties WHERE id = $1', [facultyId]);
        res.redirect('/faculties');
    } catch (err) {
        console.error('Ошибка при удалении факультета:', err);
        res.status(500).send('Ошибка при удалении факультета');
    }
};
module.exports = exports;
