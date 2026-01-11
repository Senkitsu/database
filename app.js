const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express(); // ← ЭТОЙ СТРОКИ НЕ ХВАТАЛО!

// Настройка EJS
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');
app.set('view options', { layout: false });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Логирование
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
    next();
});

// Подключаем роутеры
try {
    const scheduleRoutes = require('./Routes/schedule');
    app.use('/schedule', scheduleRoutes);
    console.log('✅ Роутер schedule загружен');
} catch (err) {
    console.error('❌ Ошибка загрузки роутера schedule:', err.message);
}

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Расписание института</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { 
                    background-color: #f8f9fa; 
                    padding: 20px;
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }
                .dashboard-card {
                    background: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-decoration: none;
                    color: inherit;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                    border-left: 4px solid #667eea;
                }
                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                }
                .hero {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 40px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="hero">
                    <h1>Расписание института</h1>
                    <p class="lead">Система управления учебным расписанием</p>
                </header>
                
                <div class="dashboard-grid">
                    <a href="/schedule" class="dashboard-card">
                        <h3>📅 Расписание занятий</h3>
                        <p>Просмотр и управление расписанием занятий</p>
                    </a>
                    
                    <a href="/schedule/courses" class="dashboard-card">
                        <h3>📚 Дисциплины</h3>
                        <p>Управление учебными дисциплинами</p>
                    </a>
                    
                    <a href="/schedule/groups" class="dashboard-card">
                        <h3>👥 Учебные группы</h3>
                        <p>Управление учебными группами</p>
                    </a>
                    
                    <a href="/schedule/classrooms" class="dashboard-card">
                        <h3>🏫 Аудитории</h3>
                        <p>Управление аудиторным фондом</p>
                    </a>
                    
                    <a href="/schedule/add" class="dashboard-card">
                        <h3>➕ Добавить занятие</h3>
                        <p>Добавить новое занятие в расписание</p>
                    </a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Обработка 404
app.use((req, res) => {
    res.status(404).send('404 - Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('🔥 Ошибка:', err.stack);
    res.status(500).send('500 - Ошибка сервера: ' + err.message);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});