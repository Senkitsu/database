# Docker инструкции для проекта "Система управления меню столовой"

## Быстрый старт

```bash
docker-compose up
```

Приложение будет доступно на http://localhost:3000

## Что включено в Docker Compose

### Сервисы:

1. **postgres** - PostgreSQL 15
   - Внешний порт: **10748** (нестандартный для безопасности)
   - Внутренний порт: 5432
   - База данных: canteen_db
   - Автоматическая инициализация с тестовыми данными

2. **app** - Node.js приложение
   - Порт: 3000
   - Автоматическое подключение к PostgreSQL
   - Ожидает готовности базы данных перед запуском

## Подробные команды

### Запуск

**Обычный запуск (с выводом логов):**
```bash
docker-compose up
```

**Запуск в фоновом режиме:**
```bash
docker-compose up -d
```

**Запуск с пересборкой:**
```bash
docker-compose up --build
```

### Остановка

**Остановка контейнеров:**
```bash
docker-compose down
```

**Остановка с удалением volumes (БД будет очищена):**
```bash
docker-compose down -v
```

### Просмотр логов

**Все логи:**
```bash
docker-compose logs
```

**Следить за логами в реальном времени:**
```bash
docker-compose logs -f
```

**Логи конкретного сервиса:**
```bash
docker-compose logs app
docker-compose logs postgres
```

### Управление контейнерами

**Список запущенных контейнеров:**
```bash
docker-compose ps
```

**Перезапуск сервисов:**
```bash
docker-compose restart
```

**Перезапуск конкретного сервиса:**
```bash
docker-compose restart app
```

### Работа с контейнерами

**Войти в контейнер приложения:**
```bash
docker-compose exec app sh
```

**Войти в контейнер PostgreSQL:**
```bash
docker-compose exec postgres bash
```

**Подключиться к psql:**
```bash
docker-compose exec postgres psql -U postgres -d canteen_db
```

## Подключение к PostgreSQL снаружи

Вы можете подключиться к PostgreSQL с хоста используя нестандартный порт **10748**:

**Через psql:**
```bash
psql -h localhost -p 10748 -U postgres -d canteen_db
```

**Через DBeaver/pgAdmin:**
- Host: localhost
- Port: 10748
- Database: canteen_db
- User: postgres
- Password: postgres

## Переменные окружения

Вы можете изменить настройки в файле `.env`:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=canteen_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
NODE_ENV=production
```

**Важно:** Не изменяйте `DATABASE_HOST` - внутри Docker это имя сервиса.

## Volumes (Хранение данных)

**postgres_data** - volume для хранения данных PostgreSQL

**Просмотр volumes:**
```bash
docker volume ls
```

**Удаление конкретного volume:**
```bash
docker volume rm canteenmenu_postgres_data
```

## Устранение проблем

### Порт уже занят

Если порт 3000 или 10748 занят, измените в `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # для app
  - "10749:5432" # для postgres
```

### База данных не инициализируется

Удалите volume и пересоздайте:
```bash
docker-compose down -v
docker-compose up
```

### Приложение не подключается к БД

Проверьте логи:
```bash
docker-compose logs postgres
docker-compose logs app
```

### Пересборка после изменения кода

```bash
docker-compose down
docker-compose up --build
```

## Разработка с Docker

### Hot reload (автоматическая перезагрузка)

Файлы проекта смонтированы как volume, изменения отображаются автоматически.

Для автоматической перезагрузки используйте nodemon:

1. Обновите `Dockerfile`:
```dockerfile
CMD ["npx", "nodemon", "app.js"]
```

2. Пересоберите:
```bash
docker-compose up --build
```

### Установка новых зависимостей

После добавления пакета в `package.json`:

```bash
docker-compose down
docker-compose up --build
```

## Production deployment

Для production рекомендуется:

1. Использовать secrets для паролей
2. Настроить reverse proxy (nginx)
3. Использовать volume backups
4. Настроить мониторинг

### Пример с docker secrets:

```yaml
version: '3.8'
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## Резервное копирование

### Создать backup БД:

```bash
docker-compose exec postgres pg_dump -U postgres canteen_db > backup.sql
```

### Восстановить из backup:

```bash
docker-compose exec -T postgres psql -U postgres canteen_db < backup.sql
```

## Полезные ссылки

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Hub](https://hub.docker.com/_/node)

## Краткая справка

| Команда | Описание |
|---------|----------|
| `docker-compose up` | Запустить |
| `docker-compose up -d` | Запустить в фоне |
| `docker-compose down` | Остановить |
| `docker-compose down -v` | Остановить + удалить данные |
| `docker-compose logs -f` | Смотреть логи |
| `docker-compose ps` | Список контейнеров |
| `docker-compose restart` | Перезапустить |
| `docker-compose exec app sh` | Войти в контейнер app |
| `docker-compose exec postgres psql -U postgres -d canteen_db` | Подключиться к БД |
