import { BotService } from './bot.service';
import { SessionObjects } from './const/session-const';
import { BotUserStatus } from './const/user-status';

const botService = BotService.getInstance();

function botText() {
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
}

function botStart() {
  return botService.start();
}

function botAction() {
  return botService.setLanguageAskPhoneNumber();
}

function botContact() {
  if (botService.userStatus === BotUserStatus.SET_SEND_PHONE) {
    return botService.setPhoneNumber(true);
  }
  return botService.getPhoneNumberSendMenu(true);
}

function botLocation(ctx) {
  if (
    botService.userStatus === BotUserStatus.CONFIRM_LOCATION ||
    botService.userStatus === BotUserStatus.CHOOSE_LOCATION
  ) {
    return botService.userGetLocation();
  }
  return ctx.reply('This action not exists');
}

async function botSession(ctx, next) {
  botService.ctx = ctx;
  if (ctx.message) {
    botService.chatId = ctx.message.chat.id;
  } else if (ctx.callbackQuery) {
    botService.chatId = ctx.callbackQuery.message.chat.id;
  } else {
    return ctx.reply('Oops something went wrong');
  }
  if (ctx.session === undefined) {
    ctx.session = {};
    await botService.setSession();
  }

  botService.userStatus = ctx.session[SessionObjects.STATUS];
  ctx.i18n.languageCode = ctx.session[SessionObjects.LANG];
  await next();
}

module.exports = {
  botText,
  botAction,
  botContact,
  botLocation,
  botSession,
  botStart,
};
