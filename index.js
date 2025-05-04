import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import { getUserSettings, updateUserSettings } from './database.js';
import { SOURCES } from './sources.js';
import { checkAccess, isAdmin, isBanned, fetchPosts } from './utils.js';

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start(async (ctx) => {
  if (await isBanned(ctx.from.id)) {
    return ctx.reply('❌ Вы заблокированы');
  }
  ctx.reply(
    'Добро пожаловать! Используйте /settings для выбора источника.\n' +
    'Для поиска изображений введите теги в инлайн-режиме (@BotName теги)'
  );
});

// Команда /settings
bot.command('settings', async (ctx) => {
  if (await isBanned(ctx.from.id)) {
    return ctx.reply('❌ Вы заблокированы');
  }
  const user = await getUserSettings(ctx.from.id);
  const buttons = Object.entries(SOURCES).map(([key, { name, restricted }]) => 
    Markup.button.callback(
      restricted ? `${name} (доступ)` : name,
      `set_source_${key}`
    )
  );

  ctx.reply(
    `Текущий источник: ${SOURCES[user.source].name}\nВыберите источник:`,
    Markup.inlineKeyboard(buttons, { columns: 1 })
  );
});

// Обработка выбора источника
bot.action(/set_source_(.+)/, async (ctx) => {
  if (await isBanned(ctx.from.id)) {
    return ctx.reply('❌ Вы заблокированы');
  }
  const source = ctx.match[1];
  if (!SOURCES[source]) return ctx.reply('❌ Неверный источник');

  if (!(await checkAccess(ctx.from.id, source))) {
    return ctx.reply('❌ Требуется доступ для этого источника');
  }

  const userSettings = await getUserSettings(ctx.from.id);
  await updateUserSettings(ctx.from.id, source, userSettings.is_subscriber, userSettings.is_admin, userSettings.is_banned);
  ctx.reply(`✅ Источник изменен на ${SOURCES[source].name}`);
});

// Команда /makeadmin
bot.command('makeadmin', async (ctx) => {
  if (!(await isAdmin(ctx.from.id))) {
    return ctx.reply('❌ Только администраторы могут использовать эту команду');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Использование: /makeadmin <userId>');
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('❌ Неверный ID пользователя');
  }

  const user = await getUserSettings(targetUserId);
  await updateUserSettings(targetUserId, user.source, user.is_subscriber, 1, user.is_banned);
  ctx.reply(`✅ Пользователь ${targetUserId} назначен администратором`);
});

// Команда /grantaccess
bot.command('grantaccess', async (ctx) => {
  if (!(await isAdmin(ctx.from.id))) {
    return ctx.reply('❌ Только администраторы могут использовать эту команду');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Использование: /grantaccess <userId>');
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('❌ Неверный ID пользователя');
  }

  const user = await getUserSettings(targetUserId);
  await updateUserSettings(targetUserId, user.source, 1, user.is_admin, user.is_banned);
  ctx.reply(`✅ Пользователь ${targetUserId} получил доступ ко всем источникам`);
});

// Команда /ban
bot.command('ban', async (ctx) => {
  if (!(await isAdmin(ctx.from.id))) {
    return ctx.reply('❌ Только администраторы могут использовать эту команду');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Использование: /ban <userId>');
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('❌ Неверный ID пользователя');
  }

  const user = await getUserSettings(targetUserId);
  await updateUserSettings(targetUserId, user.source, user.is_subscriber, user.is_admin, 1);
  ctx.reply(`✅ Пользователь ${targetUserId} заблокирован`);
});

// Команда /unban
bot.command('unban', async (ctx) => {
  if (!(await isAdmin(ctx.from.id))) {
    return ctx.reply('❌ Только администраторы могут использовать эту команду');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('Использование: /unban <userId>');
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('❌ Неверный ID пользователя');
  }

  const user = await getUserSettings(targetUserId);
  await updateUserSettings(targetUserId, user.source, user.is_subscriber, user.is_admin, 0);
  ctx.reply(`✅ Пользователь ${targetUserId} разблокирован`);
});

// Инлайн-поиск
bot.on('inline_query', async (ctx) => {
  const userId = ctx.inlineQuery.from.id;
  if (await isBanned(userId)) {
    return ctx.answerInlineQuery([{
      type: 'article',
      id: 'banned',
      title: '❌ Вы заблокированы',
      input_message_content: {
        message_text: 'Вы заблокированы и не можете использовать бота'
      }
    }]);
  }

  const { query } = ctx.inlineQuery;
  const page = parseInt(ctx.inlineQuery.offset) || 1;
  if (!query.trim()) return;

  const { source } = await getUserSettings(userId);
  console.log(`Инлайн-запрос от ${userId}: source=${source}, query=${query}, page=${page}`);

  if (!(await checkAccess(userId, source))) {
    return ctx.answerInlineQuery([{
      type: 'article',
      id: 'no_access',
      title: '❌ Доступ ограничен',
      input_message_content: {
        message_text: 'Требуется доступ для этого источника'
      }
    }]);
  }

  const data = await fetchPosts(source, query.trim(), page);
  if (!data || !data.results.length) {
    return ctx.answerInlineQuery([{
      type: 'article',
      id: 'no_results',
      title: 'Ничего не найдено',
      input_message_content: {
        message_text: 'По вашему запросу ничего не найдено'
      }
    }]);
  }

  const results = data.results.map((post, i) => ({
    type: 'photo',
    id: `${source}_${post.id || i}_${Date.now()}`,
    photo_url: post.file_url || post.file?.url,
    thumb_url: post.preview_url || post.preview?.url || post.file_url,
    caption: SOURCES[source].caption(post)
  }));

  ctx.answerInlineQuery(results, {
    next_offset: data.nextPage?.toString() || '',
    cache_time: 30
  });
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}:`, err);
  ctx.reply?.('Произошла ошибка, попробуйте позже');
});

// Запуск бота
bot.launch().then(() => console.log('Бот запущен'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));