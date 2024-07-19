/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import path from 'path';
import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotAction } from './bot/const/button-action';
import { BOT_TOKEN, PORT } from './shared/const';
import AppDataSource from './shared/db/db.config';
import TelegrafI18n from 'telegraf-i18n';
import { ValidationError } from 'express-validation';
const categoryRoute = require('./router/category-router');
const productRoute = require('./router/product-router');
const orderRoute = require('./router/order-router');
const mediaRoute = require('./router/media-router');
const {
  botText,
  botAction,
  botStart,
  botContact,
  botLocation,
  botSession,
} = require('./bot/bot-module');

const app = express();
app.use(express.static('../assets/'));
app.use(express.json());
app.use(express.urlencoded());

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});
app.use(function (err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
  return res.status(500).json(err);
});
app.use('/category', categoryRoute);
app.use('/product', productRoute);
app.use('/order', orderRoute);
app.use('/media', mediaRoute);

const bot = new Telegraf(BOT_TOKEN);

const i18n = new TelegrafI18n({
  defaultLanguage: 'pt',
  allowMissing: false, // Default true
  directory: path.resolve(__dirname, 'locales'),
});
bot.use(session());
bot.use(i18n.middleware());
bot.use(botSession);
bot.start(botStart);
bot.on(message('text'), botText);
bot.action(Object.values(BotAction), botAction);
bot.on(message('contact'), botContact);
bot.on(message('location'), (ctx: any) => botLocation(ctx));

app.use(bot.webhookCallback('/bot'));
bot.telegram.setWebhook('https://0466-84-54-76-234.ngrok-free.app/bot');

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

app.listen(PORT, () => {
  console.log(`Bot listening at http://localhost:${PORT}`);
});
