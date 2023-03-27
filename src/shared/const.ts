import dotenv from 'dotenv';
dotenv.config();
const { env } = process;

export const PORT = env.PORT;
export const BOT_SERVER_URL = env.BOT_SERVER_URL;
export const BOT_TOKEN = env.BOT_TOKEN;
export const DB_USER = env.DB_USER;
export const DB_NAME = env.DB_NAME;
export const DB_PASSWORD = env.DB_PASSWORD;
export const YANDEX_TOKEN = env.YANDEX_TOKEN;
export const YANDEX_URL = env.YANDEX_URL;
