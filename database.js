import sqlite3 from 'sqlite3';

// Инициализация базы данных
const db = new sqlite3.Database('./bot.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
    process.exit(1);
  }
  console.log('База данных подключена');
});

// Инициализация таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      source TEXT DEFAULT 'danbooru',
      is_subscriber INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0
    )
  `);

  // Проверка и назначение главного администратора
  const masterAdminId = parseInt(process.env.MASTER_ADMIN_ID);
  if (!isNaN(masterAdminId)) {
    db.get('SELECT is_admin FROM users WHERE id = ?', [masterAdminId], (err, row) => {
      if (err) {
        console.error('Ошибка проверки главного администратора:', err);
        return;
      }
      if (!row) {
        // Пользователь не существует, создаём с is_admin = 1
        db.run(
          'INSERT OR REPLACE INTO users (id, source, is_subscriber, is_admin, is_banned) VALUES (?, ?, ?, ?, ?)',
          [masterAdminId, 'danbooru', 0, 1, 0],
          (err) => {
            if (err) {
              console.error('Ошибка назначения главного администратора:', err);
            } else {
              console.log(`Главный администратор ${masterAdminId} назначен`);
            }
          }
        );
      } else if (row.is_admin !== 1) {
        // Пользователь существует, но не админ, обновляем
        db.run(
          'UPDATE users SET is_admin = 1 WHERE id = ?',
          [masterAdminId],
          (err) => {
            if (err) {
              console.error('Ошибка обновления главного администратора:', err);
            } else {
              console.log(`Главный администратор ${masterAdminId} обновлён`);
            }
          }
        );
      }
    });
  }
});

// Получение настроек пользователя
export const getUserSettings = (userId) => new Promise((resolve, reject) => {
  db.get('SELECT source, is_subscriber, is_admin, is_banned FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Ошибка получения настроек:', err);
      return reject(err);
    }
    const settings = row || { source: 'danbooru', is_subscriber: 0, is_admin: 0, is_banned: 0 };
    console.log(`Настройки пользователя ${userId}:`, settings);
    resolve(settings);
  });
});

// Обновление настроек пользователя
export const updateUserSettings = (userId, source, isSubscriber = 0, isAdmin = 0, isBanned = 0) => new Promise((resolve, reject) => {
  db.run(
    'INSERT OR REPLACE INTO users (id, source, is_subscriber, is_admin, is_banned) VALUES (?, ?, ?, ?, ?)',
    [userId, source, isSubscriber, isAdmin, isBanned],
    (err) => {
      if (err) {
        console.error('Ошибка обновления настроек:', err);
        return reject(err);
      }
      console.log(`Настройки обновлены для ${userId}: source=${source}, is_subscriber=${isSubscriber}, is_admin=${isAdmin}, is_banned=${isBanned}`);
      resolve();
    }
  );
});

// Закрытие базы данных при завершении процесса
process.once('SIGINT', () => db.close());
process.once('SIGTERM', () => db.close());