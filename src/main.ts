const express = require("express");
const bodyParser = require("body-parser");
import path from "path";
import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { BotService } from "./bot/bot.service";
import { BotAction } from "./bot/const/button-action";
import { BOT_TOKEN, PORT } from "./shared/const";
import AppDataSource from "./shared/db/db.config";
const { match } = require("telegraf-i18n");
import TelegrafI18n from "telegraf-i18n";
import { BotUserStatus } from "./bot/const/user-status";

const app = express();

const bot = new Telegraf(BOT_TOKEN);
const botService = BotService.getInstance();
app.use(bodyParser.json());
bot.use(session());
const i18n = new TelegrafI18n({
  defaultLanguage: "en",
  allowMissing: false, // Default true
  directory: path.resolve(__dirname, "locales"),
});

bot.use(i18n.middleware());
/**
 * sessionda status bormi yoqmi tekshiradi agar yoq bosa databasega murojaat qiladi
 * databasede bu user bor bosa status MENU ga ozgaradi
 */
bot.use(async (ctx: any, next) => {
  botService.ctx = ctx
  if (ctx.session === undefined) {
    ctx.session = {};
    ctx.session["status"] = await botService.setSession();
  }
  botService.userStatus = ctx.session["status"];

  await next();
});
bot.start(() => {
  return botService.start();
});


//nameRegex.test(name)

bot.on(message("text"), () => {
  if(botService.userStatus === BotUserStatus.SETTING){
    return botService.settings();
  }else if(botService.userStatus === BotUserStatus.SEND_PHONE){
 return botService.getPhoneNumberSendMenu(false)
  }else if(botService.userStatus === BotUserStatus.SEND_NAME){
 return botService.setName()
  }
});

bot.action(Object.values(BotAction), async () => {
  return botService.setLanguageAskPhoneNumber();
});
bot.on(message('contact'), () => {
  return botService.getPhoneNumberSendMenu(true)
});
app.use(bot.webhookCallback("/bot"));

bot.telegram.setWebhook("https://678b-84-54-94-192.eu.ngrok.io/bot");

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

app.listen(PORT, () => {
  console.log(`Bot listening at http://localhost:${PORT}`);
});
