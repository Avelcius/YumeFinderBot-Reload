# YumeFinderReload

A Telegram bot for searching artworks from various sources. Supports inline tag search, access management, and admin functions.

## Features

- 🔎 Inline artwork search by tags (e.g., @YumeFinderBot cat ears)
- 🖌️ Source selection via /settings
- 👤 Admin panel with user management commands
- 🔒 Restricted access to some sources (requires access)
- 🖼️ Image captions contain only the artist's name

## Installation

1. Clone the repository:
```bash
git clone <repository_url>
cd YumeFinderReload
```

2. Install dependencies:
```bash
npm install telegraf sqlite3 axios dotenv
```

3. Create a `.env` file:
```env
BOT_TOKEN=your_bot_token
MASTER_ADMIN_ID=your_telegram_id
```

- **BOT_TOKEN**: Obtain from @BotFather
- **MASTER_ADMIN_ID**: Your Telegram ID (find it: send /start to the bot, check logs)

4. Run the bot:
```bash
node bot.js
```

## Usage

### User Commands
- `/start` — Start the bot and receive a welcome message
- `/settings` — Select a source for artwork search
- Inline search: `@BotName <tags>` (e.g., @BotName cat ears blue_hair)

### Admin Commands
- `/admin` — Show a list of all admin commands
- `/makeadmin <userId>` — Assign admin status to a user
- `/grantaccess <userId>` — Grant a user access to all sources
- `/ban <userId>` — Ban a user
- `/unban <userId>` — Unban a user

### Secret Command
- `/getaccess` — Gain access to all sources (not mentioned in /admin)

## Project Structure
- `bot.js` — Main bot logic (commands, inline queries)
- `database.js` — SQLite database management (bot.db)
- `sources.js` — Source configuration (Danbooru, Gelbooru, etc.)
- `utils.js` — Helper functions (access checks, tag processing)
- `bot.db` — SQLite database for storing user settings
- `.env` — Configuration file (token, admin ID)

## Requirements
- Node.js v22.14.0 or higher
- SQLite3 for data storage
- Internet connection for source API requests

## TODO
- [x] Inline tag search
- [x] Multi-tag support
- [x] Source management via /settings
- [x] Admin commands (/makeadmin, /grantaccess, /ban, /unban)
- [x] Secret /getaccess command
- [ ] Group chat support (bot functionality in groups)
- [ ] /random command (random artwork from the current source)
- [ ] Scheduled automatic /random
- [ ] Add more sources (e.g., Pixiv, DeviantArt)

## Debugging

Logs are printed to the console:
```
Queries: Inline query from <userId>: source=<source>, query=<query>, page=<page>
Errors: Error for <updateType>: <error>
```

Check the database:
```bash
sqlite3 bot.db
SELECT * FROM users;
```

## Notes
- Restricted sources (e.g., e621) require subscriber status (is_subscriber = 1)
- Multi-tags are supported: enter tags separated by spaces (e.g., cat ears)
- The .env file should be in .gitignore to prevent token leaks

## License
MIT License