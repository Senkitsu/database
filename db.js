const { Pool } = require('pg');

console.log('🔐 Инициализация базы данных...');

// Создаем пул подключений
const adminPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '76384poveroZ',
    port: 5432
});

let appPool = null;

// Главная функция инициализации
async function initializeDatabase() {
    const client = await adminPool.connect();
    
    try {
        console.log('✅ Подключение к PostgreSQL успешно');
        
        // Проверяем существование нашей БД
        const checkResult = await client.query(
            `SELECT datname FROM pg_database WHERE datname = 'university_schedule'`
        );
        
        if (checkResult.rows.length === 0) {
            console.log('📝 Создаем базу данных "university_schedule"...');
            await client.query('CREATE DATABASE university_schedule');
            console.log('✅ База данных создана');
        } else {
            console.log('✅ База данных уже существует');
        }
        
        // Важно: release клиента перед созданием нового пула
        client.release();
        
        // Создаем новый пул для нашей БД
        appPool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'university_schedule',
            password: '76384poveroZ',
            port: 5432
        });
        
        // Теперь создаем таблицы в новой БД
        await createTables();
        
    } catch (err) {
        console.error('❌ Ошибка при создании БД:', err.message);
        client.release(); // Важно: освобождаем клиента даже при ошибке
        throw err;
    }
}

// Функция создания таблиц
async function createTables() {
    const client = await appPool.connect();
    
    try {
        console.log('📝 Создаем таблицы...');
        
        // 1. Таблица courses (дисциплины)
        await client.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                hours_lecture INTEGER DEFAULT 0,
                hours_practice INTEGER DEFAULT 0,
                hours_lab INTEGER DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 2. Таблица teachers (преподаватели)
        await client.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 3. Таблица student_groups (группы)
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                student_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 4. Таблица classrooms (аудитории)
        await client.query(`
            CREATE TABLE IF NOT EXISTS classrooms (
                id SERIAL PRIMARY KEY,
                number VARCHAR(10) NOT NULL,
                type VARCHAR(20),
                capacity INTEGER,
                equipment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // 5. Таблица schedules (расписание)
        await client.query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id SERIAL PRIMARY KEY,
                course_id INTEGER,
                teacher_id INTEGER,
                group_id INTEGER,
                classroom_id INTEGER,
                day_of_week INTEGER,
                start_time TIME,
                end_time TIME,
                lesson_type VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('✅ Все таблицы созданы');
        
        // Добавляем тестовые данные
        await addTestData(client);
        
    } catch (err) {
        console.error('❌ Ошибка при создании таблиц:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Функция для добавления тестовых данных
async function addTestData(client) {
    try {
        console.log('📝 Добавляем тестовые данные...');
        
        // Проверяем, есть ли уже данные в courses
        const courseCheck = await client.query('SELECT COUNT(*) as count FROM courses');
        
        if (parseInt(courseCheck.rows[0].count) === 0) {
            console.log('➡️  Добавляем основные данные...');
            
            // 1. Добавляем дисциплины
            await client.query(`
                INSERT INTO courses (name, hours_lecture, hours_practice, hours_lab, description) 
                VALUES 
                ('Математика', 72, 36, 0, 'Базовый курс математики'),
                ('Программирование', 36, 72, 36, 'Основы программирования'),
                ('Базы данных', 54, 0, 54, 'Проектирование и работа с БД'),
                ('Веб-разработка', 36, 36, 72, 'Современная веб-разработка')
                RETURNING id;
            `);
            
            // 2. Добавляем преподавателей
            await client.query(`
                INSERT INTO teachers (first_name, last_name, email, phone) 
                VALUES 
                ('Иван', 'Иванов', 'ivanov@university.ru', '+79991234567'),
                ('Светлана', 'Петрова', 'petrova@university.ru', '+79991234568'),
                ('Александр', 'Сидоров', 'sidorov@university.ru', '+79991234569')
                RETURNING id;
            `);
            
            // 3. Добавляем группы
            await client.query(`
                INSERT INTO student_groups (name, student_count) 
                VALUES 
                ('ПИ-21-1', 25),
                ('ПИ-21-2', 28),
                ('ИВТ-21-1', 30)
                RETURNING id;
            `);
            
            // 4. Добавляем аудитории
            await client.query(`
                INSERT INTO classrooms (number, type, capacity, equipment) 
                VALUES 
                ('101', 'Лекционная', 50, 'Проектор, доска'),
                ('102', 'Лекционная', 40, 'Проектор, интерактивная доска'),
                ('201', 'Лабораторная', 25, 'Компьютеры, проектор')
                RETURNING id;
            `);
            
            console.log('✅ Основные данные добавлены');
            console.log('📅 Добавляем расписание...');
            
            // 5. Добавляем расписание (самое важное!)
            await client.query(`
                INSERT INTO schedules 
                (course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type) 
                VALUES 
                (1, 1, 1, 1, 1, '09:00', '10:30', 'Лекция'),
                (2, 2, 1, 3, 1, '10:45', '12:15', 'Практика'),
                (3, 3, 2, 2, 2, '09:00', '10:30', 'Лекция'),
                (1, 1, 3, 1, 3, '13:00', '14:30', 'Лекция'),
                (4, 2, 2, 3, 4, '10:45', '12:15', 'Лабораторная'),
                (2, 3, 1, 2, 3, '15:00', '16:30', 'Практика'),
                (3, 1, 3, 3, 5, '11:00', '12:30', 'Лабораторная')
            `);
            
            console.log('🎉 Все тестовые данные добавлены (включая расписание!)');
            
        } else {
            console.log('📊 Основные данные уже существуют');
            
            // Проверяем, есть ли расписание
            const scheduleCheck = await client.query('SELECT COUNT(*) as count FROM schedules');
            const scheduleCount = parseInt(scheduleCheck.rows[0].count);
            
            if (scheduleCount === 0) {
                console.log('📅 Добавляем расписание (основные данные уже есть)...');
                
                await client.query(`
                    INSERT INTO schedules 
                    (course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type) 
                    VALUES 
                    (1, 1, 1, 1, 1, '09:00', '10:30', 'Лекция'),
                    (2, 2, 1, 3, 1, '10:45', '12:15', 'Практика'),
                    (3, 3, 2, 2, 2, '09:00', '10:30', 'Лекция'),
                    (1, 1, 3, 1, 3, '13:00', '14:30', 'Лекция'),
                    (4, 2, 2, 3, 4, '10:45', '12:15', 'Лабораторная')
                `);
                
                console.log('✅ Расписание добавлено!');
            } else {
                console.log(`📅 В базе уже есть ${scheduleCount} записей расписания`);
            }
        }
        
        // Выводим статистику
        console.log('\n📊 Статистика базы данных:');
        
        const tables = [
            {name: 'courses', label: 'Дисциплины'},
            {name: 'teachers', label: 'Преподаватели'},
            {name: 'student_groups', label: 'Группы'},
            {name: 'classrooms', label: 'Аудитории'},
            {name: 'schedules', label: 'Записи расписания'}
        ];
        
        for (const table of tables) {
            try {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table.name}`);
                console.log(`   ${table.label}: ${result.rows[0].count}`);
            } catch (err) {
                console.log(`   ${table.label}: таблица не доступна`);
            }
        }
        
    } catch (err) {
        console.error('❌ Ошибка при добавлении данных:', err.message);
        console.error('Подробности:', err);
    }
}

// Инициализируем БД (асинхронно)
initializeDatabase()
    .then(() => {
        console.log('\n🎉 База данных готова к работе!');
        console.log('🌐 Сервер доступен по адресу: http://localhost:3000');
        console.log('📅 Проверьте расписание по адресу: http://localhost:3000/schedule\n');
    })
    .catch(err => {
        console.error('💥 Критическая ошибка инициализации БД:', err.message);
        
        // Создаем упрощенный пул для тестирования
        appPool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres', // подключаемся к стандартной БД
            password: '76384poveroZ',
            port: 5432
        });
        
        console.log('⚠️  Используем стандартную БД postgres для тестирования');
    });

// Экспортируем
module.exports = {
    getPool: () => {
        if (!appPool) {
            // Создаем пул по умолчанию
            appPool = new Pool({
                user: 'postgres',
                host: 'localhost',
                database: 'university_schedule',
                password: '76384poveroZ',
                port: 5432
            });
        }
        return appPool;
    },
    
    ready: new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            if (appPool) {
                clearInterval(checkInterval);
                resolve(appPool);
            }
        }, 100);
        
        // Таймаут на 5 секунд
        setTimeout(() => {
            if (!appPool) {
                clearInterval(checkInterval);
                console.log('⚠️  Таймаут ожидания БД, создаем пул по умолчанию...');
                appPool = new Pool({
                    user: 'postgres',
                    host: 'localhost',
                    database: 'postgres',
                    password: '76384poveroZ',
                    port: 5432
                });
                resolve(appPool);
            }
        }, 5000);
    })
};