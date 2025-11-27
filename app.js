const express = require('express');
const app = express();

// Импорт роутеров
const homeRoutes = require('./Routes/home');
const facultiesRoutes = require('./Routes/faculties');
const teachersRoutes = require('./Routes/teachers');
const scheduleRoutes = require('./Routes/schedule');

// Использование роутеров
app.use('/', homeRoutes);
app.use('/faculties', facultiesRoutes);
app.use('/teachers', teachersRoutes);
app.use('/schedule', scheduleRoutes);

module.exports = app;