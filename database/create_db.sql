DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;

CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    dean VARCHAR(100),
    dean_position VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    description TEXT
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    faculty_id INTEGER NOT NULL,
    head_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);

CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department_id INTEGER NOT NULL,
    position VARCHAR(100),
    degree VARCHAR(100),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department_id INTEGER NOT NULL,
    hours_lecture INTEGER DEFAULT 0,
    hours_practice INTEGER DEFAULT 0,
    hours_lab INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE student_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    faculty_id INTEGER NOT NULL,
    student_count INTEGER DEFAULT 0,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);

CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    equipment TEXT
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lesson_type VARCHAR(20) NOT NULL CHECK (lesson_type IN ('lecture', 'practice', 'lab')),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

INSERT INTO faculties (name, dean, dean_position, phone, email, description) VALUES
('Факультет информационных технологий', 'Иванов Петр Сергеевич', 'Профессор', '+7-495-111-11-11', 'dean-it@university.ru', 'Подготовка специалистов в области IT и компьютерных наук'),
('Факультет экономики и управления', 'Сидорова Мария Ивановна', 'Доцент', '+7-495-222-22-22', 'dean-economics@university.ru', 'Подготовка экономистов и управленцев'),
('Инженерный факультет', 'Петров Алексей Владимирович', 'Профессор', '+7-495-333-33-33', 'dean-engineering@university.ru', 'Подготовка инженеров различных специальностей');

INSERT INTO departments (name, faculty_id, head_name, phone, email) VALUES
('Кафедра программирования', 1, 'Козлов Дмитрий Анатольевич', '+7-495-111-11-12', 'programming@university.ru'),
('Кафедра информационных систем', 1, 'Николаева Елена Викторовна', '+7-495-111-11-13', 'is@university.ru'),
('Кафедра экономической теории', 2, 'Федоров Сергей Петрович', '+7-495-222-22-23', 'econ-theory@university.ru'),
('Кафедра менеджмента', 2, 'Волкова Анна Михайловна', '+7-495-222-22-24', 'management@university.ru'),
('Кафедра машиностроения', 3, 'Тихонов Андрей Николаевич', '+7-495-333-33-34', 'mech@university.ru');

INSERT INTO teachers (first_name, last_name, email, phone, department_id, position, degree) VALUES
('Александр', 'Смирнов', 'a.smirnov@university.ru', '+7-495-111-11-14', 1, 'Профессор', 'Доктор технических наук'),
('Ольга', 'Петрова', 'o.petrova@university.ru', '+7-495-111-11-15', 1, 'Доцент', 'Кандидат технических наук'),
('Михаил', 'Васильев', 'm.vasiliev@university.ru', '+7-495-111-11-16', 2, 'Старший преподаватель', 'Кандидат технических наук'),
('Екатерина', 'Морозова', 'e.morozova@university.ru', '+7-495-222-22-25', 3, 'Профессор', 'Доктор экономических наук'),
('Денис', 'Кузнецов', 'd.kuznetsov@university.ru', '+7-495-222-22-26', 4, 'Доцент', 'Кандидат экономических наук'),
('Наталья', 'Попова', 'n.popova@university.ru', '+7-495-333-33-35', 5, 'Профессор', 'Доктор технических наук');

INSERT INTO courses (name, department_id, hours_lecture, hours_practice, hours_lab, description) VALUES
('Программирование на Java', 1, 36, 36, 18, 'Основы программирования на языке Java'),
('Базы данных', 2, 36, 18, 36, 'Проектирование и работа с базами данных'),
('Веб-разработка', 1, 24, 48, 12, 'Создание веб-приложений'),
('Экономическая теория', 3, 54, 36, 0, 'Основы экономической теории'),
('Менеджмент организации', 4, 36, 36, 0, 'Основы управления организациями'),
('Теория механизмов и машин', 5, 48, 24, 24, 'Основы теории механизмов'),
('Алгоритмы и структуры данных', 1, 36, 24, 12, 'Изучение основных алгоритмов и структур данных');

INSERT INTO student_groups (name, faculty_id, student_count) VALUES
('ИТ-20-1', 1, 25),
('ИТ-20-2', 1, 28),
('ИТ-21-1', 1, 30),
('ЭК-20-1', 2, 22),
('ЭК-21-1', 2, 24),
('ИН-20-1', 3, 20),
('ИН-21-1', 3, 18);

INSERT INTO classrooms (number, type, capacity, equipment) VALUES
('101', 'lecture', 100, 'Проектор, экран, микрофон'),
('102', 'lecture', 80, 'Проектор, экран'),
('201', 'practice', 30, 'Маркерная доска'),
('202', 'practice', 25, 'Маркерная доска'),
('301', 'lab', 20, 'Компьютеры, проектор'),
('302', 'lab', 15, 'Компьютеры, специализированное оборудование'),
('401', 'lecture', 120, 'Проектор, экран, звуковая система');

INSERT INTO schedules (course_id, teacher_id, group_id, classroom_id, day_of_week, start_time, end_time, lesson_type) VALUES
(1, 1, 1, 1, 1, '09:00', '10:30', 'lecture'),
(1, 1, 1, 3, 1, '10:45', '12:15', 'practice'),
(2, 3, 2, 5, 1, '13:00', '14:30', 'lab'),
(3, 2, 1, 4, 2, '09:00', '10:30', 'practice'),
(4, 4, 4, 2, 2, '10:45', '12:15', 'lecture'),
(5, 5, 4, 4, 3, '13:00', '14:30', 'practice'),
(6, 6, 6, 6, 3, '09:00', '10:30', 'lab'),
(7, 1, 3, 1, 4, '10:45', '12:15', 'lecture');

CREATE INDEX idx_schedules_group ON schedules(group_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedules_classroom ON schedules(classroom_id);
CREATE INDEX idx_schedules_day_time ON schedules(day_of_week, start_time);
CREATE INDEX idx_teachers_department ON teachers(department_id);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_groups_faculty ON student_groups(faculty_id);
CREATE INDEX idx_departments_faculty ON departments(faculty_id);