import axios from 'axios';
import { getUserSettings } from './database.js';
import { SOURCES } from './sources.js';

// Проверка доступа к источнику
export const checkAccess = async (userId, source) => {
  const user = await getUserSettings(userId);
  return !SOURCES[source].restricted || user.is_subscriber;
};

// Проверка статуса администратора
export const isAdmin = async (userId) => {
  const user = await getUserSettings(userId);
  return user.is_admin === 1;
};

// Проверка статуса блокировки
export const isBanned = async (userId) => {
  const user = await getUserSettings(userId);
  return user.is_banned === 1;
};

// Проверка валидности URL изображения
export const isValidImageUrl = (url) => {
  if (!url) return false;
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

// Получение постов
export const fetchPosts = async (source, tags, page = 1) => {
  try {
    const { url, params, parser, headers } = SOURCES[source];
    console.log(`Запрос к ${source}:`, { url, tags, page });
    const { data } = await axios.get(url, { params: params(tags, page), headers });
    const results = parser(data) || [];
    return {
      results: results.filter(post => 
        isValidImageUrl(post.file_url || post.file?.url) && 
        isValidImageUrl(post.preview_url || post.preview?.url || post.file_url)
      ),
      nextPage: results.length ? page + 1 : null
    };
  } catch (error) {
    console.error(`[${source}] Ошибка:`, error.message);
    return null;
  }
};