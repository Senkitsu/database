const path = require('path');

console.log('=== Тест импорта контроллера ===');

try {
    require('./db');
    console.log('✓ db.js загружен');
} catch (err) {
    console.error('✗ Ошибка db.js:', err.message);
}

console.log('\n=== Импорт контроллера ===');
try {
    const controllerPath = require.resolve('./Controllers/scheduleController');
    delete require.cache[controllerPath];
    
    const controller = require('./Controllers/scheduleController');
    console.log('✓ Контроллер загружен');
    console.log('  Тип:', typeof controller);
    console.log('  Ключи:', Object.keys(controller || {}));
    console.log('  getSchedule тип:', typeof (controller && controller.getSchedule));
} catch (err) {
    console.error('✗ Ошибка контроллера:', err.message);
    console.error('  Стек:', err.stack.split('\n')[0]);
}

console.log('\n=== Импорт маршрута ===');
try {
    const routePath = require.resolve('./Routes/schedule');
    delete require.cache[routePath];
    require('./Routes/schedule');
    console.log('✓ Маршрут загружен');
} catch (err) {
    console.error('✗ Ошибка маршрута:', err.message);
    console.error('  Стек:', err.stack);
}
