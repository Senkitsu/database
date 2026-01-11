// Основные утилиты для приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initAutoSubmitForms();
    initTimeInputs();
    initConfirmationDialogs();
    initDynamicFilters();
});

// Авто-сабмит форм фильтрации
function initAutoSubmitForms() {
    const autoSubmitSelects = document.querySelectorAll('select[onchange*="submit"]');
    autoSubmitSelects.forEach(select => {
        select.addEventListener('change', function() {
            this.form.submit();
        });
    });
}

// Валидация времени для форм расписания
function initTimeInputs() {
    const startTimeInputs = document.querySelectorAll('input[name="start_time"]');
    const endTimeInputs = document.querySelectorAll('input[name="end_time"]');
    
    startTimeInputs.forEach((startInput, index) => {
        const endInput = endTimeInputs[index];
        if (startInput && endInput) {
            startInput.addEventListener('change', function() {
                validateTimeRange(startInput, endInput);
            });
            endInput.addEventListener('change', function() {
                validateTimeRange(startInput, endInput);
            });
        }
    });
}

function validateTimeRange(startInput, endInput) {
    const startTime = startInput.value;
    const endTime = endInput.value;
    
    if (startTime && endTime) {
        if (startTime >= endTime) {
            alert('Время окончания должно быть позже времени начала');
            endInput.value = '';
            endInput.focus();
        }
    }
}

// Подтверждение удаления
function initConfirmationDialogs() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
                e.preventDefault();
            }
        });
    });
}

// Динамические фильтры
function initDynamicFilters() {
    // Пример: фильтрация преподавателей по кафедрам
    const departmentFilter = document.getElementById('department-filter');
    const teacherFilter = document.getElementById('teacher-filter');
    
    if (departmentFilter && teacherFilter) {
        departmentFilter.addEventListener('change', function() {
            filterTeachersByDepartment(this.value, teacherFilter);
        });
    }
}

function filterTeachersByDepartment(departmentId, teacherSelect) {
    // Здесь можно добавить AJAX запрос для динамической загрузки преподавателей
    // Пока просто скрываем/показываем options
    const options = teacherSelect.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === '' || option.dataset.departmentId === departmentId) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
    
    // Сбрасываем выбор преподавателя
    teacherSelect.value = '';
}

// Утилиты для работы с датами
const DateUtils = {
    getDayName: function(dayNumber) {
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        return days[dayNumber - 1] || 'Неизвестно';
    },
    
    getLessonType: function(type) {
        const types = {
            'lecture': 'Лекция',
            'practice': 'Практика', 
            'lab': 'Лабораторная'
        };
        return types[type] || type;
    },
    
    formatTime: function(timeString) {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Обрезаем секунды если есть
    }
};

// Функции для работы с формами
const FormUtils = {
    showLoading: function(button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner"></span> Сохранение...';
        return originalText;
    },
    
    hideLoading: function(button, originalText) {
        button.disabled = false;
        button.textContent = originalText;
    },
    
    validateForm: function(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        return isValid;
    }
};

// AJAX функции
const ApiClient = {
    async checkScheduleConflict(data) {
        try {
            const response = await fetch('/api/schedule/check-conflict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error checking schedule conflict:', error);
            return { hasConflict: false };
        }
    },
    
    async getTeachersByDepartment(departmentId) {
        try {
            const response = await fetch(`/api/teachers/department/${departmentId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching teachers:', error);
            return [];
        }
    }
};

// Обработчики для специфичных страниц
function initSchedulePage() {
    const scheduleForm = document.querySelector('form');
    if (scheduleForm && scheduleForm.action.includes('/schedule/')) {
        scheduleForm.addEventListener('submit', async function(e) {
            if (!FormUtils.validateForm(this)) {
                e.preventDefault();
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = FormUtils.showLoading(submitButton);
            
            // Проверка конфликта расписания
            const formData = new FormData(this);
            const scheduleData = {
                teacher_id: formData.get('teacher_id'),
                group_id: formData.get('group_id'),
                classroom_id: formData.get('classroom_id'),
                day_of_week: formData.get('day_of_week'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time')
            };
            
            try {
                const conflictCheck = await ApiClient.checkScheduleConflict(scheduleData);
                if (conflictCheck.hasConflict) {
                    e.preventDefault();
                    alert('Обнаружен конфликт расписания: ' + conflictCheck.message);
                    FormUtils.hideLoading(submitButton, originalText);
                }
            } catch (error) {
                console.error('Error during conflict check:', error);
                // Продолжаем отправку формы даже при ошибке проверки
            }
        });
    }
}

// Инициализация специфичных страниц
if (window.location.pathname.includes('/schedule')) {
    initSchedulePage();
}

// Утилиты для таблиц
const TableUtils = {
    sortTable: function(table, columnIndex, isNumeric = false) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isAscending = !table.dataset.sortedAsc;
        
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            if (isNumeric) {
                return isAscending ? aValue - bValue : bValue - aValue;
            } else {
                return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
        });
        
        // Удаляем существующие строки
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        
        // Добавляем отсортированные строки
        rows.forEach(row => tbody.appendChild(row));
        
        // Обновляем состояние сортировки
        table.dataset.sortedAsc = isAscending;
    },
    
    filterTable: function(table, searchTerm) {
        const rows = table.querySelectorAll('tbody tr');
        const searchLower = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchLower) ? '' : 'none';
        });
    }
};

// Глобальное подключение утилит
window.DateUtils = DateUtils;
window.FormUtils = FormUtils;
window.TableUtils = TableUtils;
window.ApiClient = ApiClient;