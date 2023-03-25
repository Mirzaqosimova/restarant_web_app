const express = require('express');
const bodyParser = require('body-parser');
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { BOT_TOKEN, PORT } from './shared/const';
import AppDataSource from './shared/db/db.config';
const app = express();

const bot = new Telegraf(BOT_TOKEN);

app.use(bodyParser.json());

bot.start((ctx) => ctx.reply('Welcome to the bot!'));

bot.on(message("text"), (ctx) => {
  const message = ctx.update.message.text;
  console.log(`Received message: ${message}`);
  ctx.reply(`You sent: ${message}`);
});

app.use(bot.webhookCallback('/bot'));

bot.telegram.setWebhook('https://cfca-213-230-88-185.eu.ngrok.io/bot');

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

app.listen(PORT, () => {
  console.log(`Bot listening at http://localhost:${PORT}`);
});