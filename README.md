# YumeFinderReload

[English version](README_EN.md)

Telegram-бот для поиска артов с различных источников. Поддерживает инлайн-поиск по тегам, управление доступом и админ-функции.

## Возможности

- 🔎 Инлайн-поиск артов по тегам (например, @YumeFinderBot cat ears)
- 🖌️ Выбор источника через /settings
- 👤 Админ-панель с командами для управления пользователями
- 🔒 Ограниченный доступ к некоторым источникам (требуется доступ)
- 🖼️ Подписи к изображениям содержат только имя автора

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository_url>
cd YumeFinderReload
```

2. Установите зависимости:
```bash
npm install telegraf sqlite3 axios dotenv
```

3. Создайте файл `.env`:
```env
BOT_TOKEN=ваш_токен_бота
MASTER_ADMIN_ID=ваш_telegram_id
```

- **BOT_TOKEN**: Получите у @BotFather
- **MASTER_ADMIN_ID**: Ваш Telegram ID (узнать: отправьте /start боту, проверьте логи)

4. Запустите бота:
```bash
node bot.js
```

## Использование

### Пользовательские команды
- `/start` — Запустить бота и получить приветственное сообщение
- `/settings` — Выбрать источник для поиска артов
- Инлайн-поиск: `@BotName <теги>` (например, @BotName cat ears blue_hair)

### Админ-команды
- `/admin` — Показать список всех админ-команд
- `/makeadmin <userId>` — Назначить пользователя администратором
- `/grantaccess <userId>` — Дать пользователю доступ ко всем источникам
- `/ban <userId>` — Заблокировать пользователя
- `/unban <userId>` — Разблокировать пользователя

### Секретная команда
- `/getaccess` — Получить доступ ко всем источникам (не упоминается в /admin)

## Структура проекта
- `bot.js` — Основная логика бота (команды, инлайн-запросы)
- `database.js` — Управление базой данных SQLite (bot.db)
- `sources.js` — Конфигурация источников (Danbooru, Gelbooru, и т.д.)
- `utils.js` — Вспомогательные функции (проверка доступа, обработка тегов)
- `bot.db` — SQLite база данных для хранения настроек пользователей
- `.env` — Файл с конфигурацией (токен, ID админа)

## Требования
- Node.js v22.14.0 или выше
- SQLite3 для хранения данных
- Интернет-соединение для запросов к API источников

## TODO
- [x] Инлайн-поиск по тегам
- [x] Поддержка мультитегов
- [x] Управление источниками через /settings
- [x] Админ-команды (/makeadmin, /grantaccess, /ban, /unban)
- [x] Секретная команда /getaccess
- [ ] Поддержка групп (работа бота в групповых чатах)
- [ ] Команда /random (случайный арт из текущего источника)
- [ ] Автоматический /random по расписанию
- [ ] Добавить больше источников (например, Pixiv, DeviantArt)

## Отладка

Логи выводятся в консоль:
```
Запросы: Инлайн-запрос от <userId>: source=<source>, query=<query>, page=<page>
Ошибки: Ошибка для <updateType>: <error>
```

Проверьте базу данных:
```bash
sqlite3 bot.db
SELECT * FROM users;
```

## Примечания
- Для доступа к ограниченным источникам (например, e621) нужен статус подписчика (is_subscriber = 1)
- Мультитеги поддерживаются: вводите теги через пробел (например, cat ears)
- Файл .env должен быть в .gitignore, чтобы избежать утечки токена

## Лицензия
MIT License