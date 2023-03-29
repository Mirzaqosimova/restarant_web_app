/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import path from 'path';
import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { BotService } from './bot/bot.service';
import { BotAction } from './bot/const/button-action';
import { BOT_TOKEN, PORT } from './shared/const';
import AppDataSource from './shared/db/db.config';
import TelegrafI18n from 'telegraf-i18n';
import { BotUserStatus } from './bot/const/user-status';
import { ValidationError } from 'express-validation';
const categoryRoute = require('./router/category-router');
const productRoute = require('./router/product-router');
const orderRoute = require('./router/order-router');

const app = express();

app.use(express.json());
app.use(express.urlencoded());

//* Error Handler
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

const bot = new Telegraf(BOT_TOKEN);
const botService = BotService.getInstance();
bot.use(session());
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, // Default true
  directory: path.resolve(__dirname, 'locales'),
});

bot.use(i18n.middleware());
/**
 * sessionda status bormi yoqmi tekshiradi agar yoq bosa databasega murojaat qiladi
 * databasede bu user bor bosa status MENU ga ozgaradi
 */
bot.use(async (ctx: any, next) => {
  botService.ctx = ctx;
  if (ctx.message) {
    botService.chatId = ctx.message.chat.id;
  } else {
    botService.chatId = ctx.callbackQuery.message.chat.id;
  }
  if (ctx.session === undefined) {
    ctx.session = {};
    ctx.session['status'] = await botService.setSession();
  }

  botService.userStatus = ctx.session['status'];

  await next();
});
bot.start(() => {
  return botService.start();
});

bot.on(message('text'), () => {
  if (botService.userStatus === BotUserStatus.SETTING) {
    return botService.settings();
  } else if (botService.userStatus === BotUserStatus.SEND_PHONE) {
    return botService.getPhoneNumberSendMenu(false);
  }
  if (botService.userStatus === BotUserStatus.SET_SEND_PHONE) {
    return botService.setPhoneNumber(false);
  }
  if (botService.userStatus === BotUserStatus.MENU) {
    return botService.menuResponse();
  } else if (botService.userStatus === BotUserStatus.SET_SEND_NAME) {
    return botService.setName();
  } else if (botService.userStatus === BotUserStatus.CHOOSE_ORDER_TYPE) {
    return botService.chooseOrderType();
  } else if (botService.userStatus === BotUserStatus.CHOOSE_LOCATION) {
    return botService.chooseLocations();
  } else if (botService.userStatus === BotUserStatus.CONFIRM_LOCATION) {
    return botService.setUserLocation();
  } else if (botService.userStatus === BotUserStatus.ORDER_MENU) {
    return botService.getMenu();
  } else if (botService.userStatus === BotUserStatus.CHOOSE_SAVED_LOCATION) {
    return botService.setSavedLocation();
  }
});

bot.action(Object.values(BotAction), async () => {
  return botService.setLanguageAskPhoneNumber();
});

bot.on(message('contact'), () => {
  if (botService.userStatus === BotUserStatus.SET_SEND_PHONE) {
    return botService.setPhoneNumber(true);
  }
  return botService.getPhoneNumberSendMenu(true);
});

bot.on(message('location'), (ctx: any) => {
  if (
    botService.userStatus === BotUserStatus.CONFIRM_LOCATION ||
    botService.userStatus === BotUserStatus.CHOOSE_LOCATION
  ) {
    return botService.userGetLocation();
  }
  return ctx.reply('This action not exists');
});

app.use(bot.webhookCallback('/bot'));

bot.telegram.setWebhook('https://6d83-84-54-94-192.eu.ngrok.io/bot');

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
