import { Markup } from 'telegraf';
import { BotAction } from './const/button-action';
import { BotUserStatus } from './const/user-status';
import { Message } from './const/message';
import { Address } from '../entity/adress.entity';
import { YandexService } from './yandex.connect';
import { UserService } from '../service/user-service';
import { AddressService } from '../service/address-service';
import { SessionObjects } from './const/session-const';
import { Not } from 'typeorm';

export class BotService {
  private static instance = new BotService();
  public userStatus;
  public ctx;
  public phoneRegex1 = /^\+998[3789]{1}[013456789]{1}[0-9]{7}$/;
  public phoneRegex2 = /^998[3789]{1}[013456789]{1}[0-9]{7}$/;
  public nameRegex = /^[a-zA-Z]{2,20}$/;
  public chatId;
  private userService = UserService.getInstance();
  private addressService = AddressService.getInstance();

  public static getInstance() {
    return this.instance;
  }

  async setSession(): Promise<any> {
    const user = await this.userService.findOneBy({ chat_id: this.chatId });
    if (user !== null) {
      this.ctx.session[SessionObjects.LANG] = user.language;
      this.ctx.session[SessionObjects.STATUS] = BotUserStatus.MENU;
    } else {
      this.ctx.session[SessionObjects.STATUS] = BotUserStatus.START;
    }
  }

  async start() {
    if (
      this.userStatus !== BotUserStatus.START &&
      this.userStatus !== BotUserStatus.SEND_PHONE
    ) {
      return this.menu();
    }

    return this.chooseLanguage();
  }

  chooseLanguage() {
    return this.ctx.reply(Message.CHOOSE_LANGUAGE, this.getInline());
  }

  async setLanguageAskPhoneNumber() {
    await this.deleteMessageOrCallback();
    this.ctx.i18n.languageCode = this.ctx.callbackQuery.data;
    this.ctx.session[SessionObjects.LANG] = this.ctx.callbackQuery.data;
    this.userService.update(
      { chat_id: this.chatId },
      { language: this.ctx.callbackQuery.data },
    );
    this.ctx.reply(this.ctx.i18n.t(Message.LANGUAGE_SETTES));
    if (this.userStatus === BotUserStatus.START) {
      await this.changeSessionStatus(BotUserStatus.SEND_PHONE);
      return this.ctx
        .reply(
          this.ctx.i18n.t(Message.ASK_PHONE_NUMBER),
          this.getReplyButtons(),
        )
        .then((sentMessage) => {
          this.ctx.session[SessionObjects.MESSAGE_ID] = sentMessage.message_id;
        });
    } else if (this.userStatus === BotUserStatus.SET_SEND_LANGUAGE) {
      console.log('as');

      this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx
        .reply(this.ctx.i18n.t(Message.CHOOSE_ACTION), this.getReplyButtons())
        .then((sentMessage) => {
          this.ctx.session[SessionObjects.MESSAGE_ID] = sentMessage.message_id;
        });
    }
  }

  async getPhoneNumberSendMenu(action: boolean) {
    const phone = await this.validationPhoneNumber(action);
    if (!phone) {
      return this.ctx.reply(this.ctx.i18n.t(Message.RESET));
    }

    await this.userService.create({
      chat_id: this.chatId,
      phone_number: phone,
      full_name:
        String(this.ctx.message.contact.first_name) +
        String(
          this.ctx.message.contact.last_name
            ? this.ctx.message.contact.last_name
            : ' ',
        ),
      language: this.ctx.i18n.languageCode,
    });

    await this.ctx.reply(this.ctx.i18n.t(Message.SUCCESFULLY_DONE));

    return this.menu();
  }

  async menu() {
    await this.changeSessionStatus(BotUserStatus.MENU);
    return this.ctx.reply(
      this.ctx.i18n.t(Message.CHOOSE_ACTION),
      this.getReplyButtons(),
    );
  }

  async menuResponse() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_SETTINGS)) {
      await this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getReplyButtons(),
      );
    } else if (
      this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_ORDER)
    ) {
      await this.changeSessionStatus(BotUserStatus.CHOOSE_ORDER_TYPE);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ORDER_TYPE),
        this.getReplyButtons(),
      );
    }
  }
  async chooseOrderType() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_DELIVERY)) {
      this.changeSessionStatus(BotUserStatus.CHOOSE_LOCATION);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.SEND_LOCATION),
        this.getReplyButtons(),
      );
    } else if (
      this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_PICKUP)
    ) {
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      const user = await this.userService.findOneBy({ chat_id: this.chatId });
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getOrderMenuWebAppButton(user.id),
      );
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      return this.menu();
    }
  }
  async chooseLocations() {
    if (
      this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_MY_LOCATIONS)
    ) {
      const data = await this.addressService.findForBot(this.chatId);
      this.changeSessionStatus(BotUserStatus.CHOOSE_SAVED_LOCATION);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.MY_LOCATION),
        this.addressButtonList(data),
      );
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      return this.menu();
    }
  }

  /**
   *
   * @returns order integratsiya
   */
  getMenu() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_HISTORY)) {
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      // return this.ctx.reply('kak vam udobna?: ', this.getReplyButtons());
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      return this.menu();
    }
  }

  async userGetLocation() {
    const latitude = this.ctx.message.location.latitude;
    const longitude = this.ctx.message.location.longitude;
    const data = await YandexService.getInstance().getAddress(
      longitude,
      latitude,
    );
    const address = data.response.GeoObjectCollection.featureMember;
    if (address.length < 1) {
      return this.ctx.reply(Message.RESET);
    }
    const address_text =
      address[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
    this.changeSessionStatus(BotUserStatus.CONFIRM_LOCATION);
    return this.ctx.reply(address_text, this.getReplyButtons()).then(() => {
      this.ctx.session[SessionObjects.ADDRESS] = address_text;
      this.ctx.session[SessionObjects.LAT] = latitude;
      this.ctx.session[SessionObjects.LONG] = longitude;
    });
  }

  async setUserLocation() {
    const address_text = this.ctx.session[SessionObjects.ADDRESS];
    const longitude = this.ctx.session[SessionObjects.LONG];
    const latitude = this.ctx.session[SessionObjects.LAT];

    if (!(address_text && latitude && longitude)) {
      this.ctx.reply(this.ctx.i18n.t(Message.CLICK_START));
    } else {
      delete this.ctx.session.address;
      delete this.ctx.session.longitude;
      delete this.ctx.session.latitude;
    }
    const address = await this.addressService.findOneBy({
      address: address_text,
    });
    const user = await this.userService.findOneBy({ chat_id: this.chatId });
    let address_id;
    if (address !== null) {
      address_id = address.id;
    } else {
      await this.addressService
        .create(new Address(address_text, longitude, latitude, user))
        .then((res) => {
          address_id = res.id;
        });
    }
    this.changeSessionStatus(BotUserStatus.ORDER_MENU);
    return this.ctx.reply(
      this.ctx.i18n.t(Message.CHOOSE_ACTION),
      this.getOrderMenuWebAppButton(user.id, address_id),
    );
  }

  async setSavedLocation() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      this.changeSessionStatus(BotUserStatus.CHOOSE_LOCATION);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getReplyButtons(),
      );
    } else {
      const address = await this.addressService.findOneBy({
        address: this.ctx.message.text,
      });
      if (address === null) {
        return this.ctx.reply(this.ctx.i18n.t(Message.ADDRESS_NOT_FOUND));
      }
      const user = await this.userService.findOneBy({ chat_id: this.chatId });
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getOrderMenuWebAppButton(user.id, address.id),
      );
    }
  }

  async settings() {
    if (
      this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_SETTINGS_NAME)
    ) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_NAME);

      return this.ctx.reply(
        this.ctx.i18n.t(Message.SEND_NAME),
        this.getReplyButtons(),
      );
    } else if (
      this.ctx.message.text ===
      this.ctx.i18n.t(Message.BUTTON_ASK_SETTINGS_PHONE)
    ) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_PHONE);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.SEND_PHONE),
        this.getReplyButtons(),
      );
    } else if (
      this.ctx.message.text ===
      this.ctx.i18n.t(Message.BUTTON_SETTINGS_LAGNUAGE)
    ) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_LANGUAGE);
      return this.chooseLanguage();
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      return this.menu();
    }
  }

  async setName() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      await this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getReplyButtons(),
      );
    }
    const name = this.ctx.message.text;
    if (!this.nameRegex.test(name)) {
      return this.ctx.reply(this.ctx.i18n.t(Message.WRONG_FORMAT));
    }
    await this.userService.update(
      { chat_id: this.chatId },
      { full_name: String(name) },
    );
    this.changeSessionStatus(BotUserStatus.SETTING);
    return this.ctx.reply(
      this.ctx.i18n.t(Message.SUCCESFULLY_DONE),
      this.getReplyButtons(),
    );
  }
  async setPhoneNumber(action: boolean) {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BUTTON_BACK)) {
      await this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx.reply(
        this.ctx.i18n.t(Message.CHOOSE_ACTION),
        this.getReplyButtons(),
      );
    }
    const phone = await this.validationPhoneNumber(action);
    if (!phone) {
      return this.ctx.reply(this.ctx.i18n.t(Message.RESET));
    }
    await this.userService.update(
      { chat_id: this.chatId },
      { phone_number: String(phone) },
    );
    this.changeSessionStatus(BotUserStatus.SETTING);

    return this.ctx.reply(
      this.ctx.i18n.t(Message.CHOOSE_ACTION),
      this.getReplyButtons(),
    );
  }

  async validationPhoneNumber(action: boolean) {
    let phone;
    if (action) {
      phone = String(this.ctx.message.contact.phone_number);
    } else {
      phone = String(this.ctx.message.text);
    }

    if (!(this.phoneRegex1.test(phone) || this.phoneRegex2.test(phone))) {
      await this.ctx.reply(this.ctx.i18n.t(Message.WRONG_PHONE_NUMBER));
      return false;
    }

    if (this.phoneRegex2.test(phone)) {
      phone = '+' + phone;
    }

    const check = await this.userService.findOneBy({
      phone_number: phone,
      chat_id: Not(this.chatId),
    });

    if (check !== null) {
      await this.ctx.reply(
        this.ctx.i18n.t(Message.PHONE_NUMBER_ALREADY_EXISTS),
      );
      return undefined;
    }
    return phone;
  }

  changeSessionStatus(status: BotUserStatus) {
    this.userStatus = status;
    return (this.ctx.session.status = status);
  }

  deleteMessageOrCallback() {
    if (this.ctx.session.messageId) {
      return this.ctx.deleteMessage(this.ctx.session.messageId).then(() => {
        this.ctx.session.messageId = undefined;
      });
    }
    if (this.ctx.message) {
      return this.ctx.deleteMessage(this.ctx.message.message_id);
    }
    return this.ctx.deleteMessage(this.ctx.callbackQuery.message.message_id);
  }

  getInline() {
    if (
      this.userStatus === BotUserStatus.START ||
      this.userStatus === BotUserStatus.SET_SEND_LANGUAGE
    ) {
      return Markup.inlineKeyboard([
        [
          Markup.button.callback('Uzbek', BotAction.UZBEK),
          Markup.button.callback('English', BotAction.ENGLISH),
        ],
        [Markup.button.callback('Rus', BotAction.RUSSIAN)],
      ]);
    }
  }

  getOrderMenuWebAppButton(user_id: number, address_id?: number) {
    return {
      reply_markup: {
        keyboard: [
          [
            Markup.button.webApp(
              this.ctx.i18n.t(Message.BUTTON_MENU),
              `https://orkhan.gitbook.io/typeorm/docs/select-query-builder#joining-relations?address_id=${address_id}&user_id=${user_id}`,
            ),
          ],
          [{ text: this.ctx.i18n.t(Message.BUTTON_HISTORY) }],
          [{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }

  getReplyButtons() {
    if (
      this.userStatus === BotUserStatus.SEND_PHONE ||
      this.userStatus === BotUserStatus.SET_SEND_PHONE
    ) {
      const back =
        this.userStatus === BotUserStatus.SET_SEND_PHONE
          ? [{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }]
          : [];

      return {
        reply_markup: {
          keyboard: [
            [
              {
                text: this.ctx.i18n.t(Message.BUTTON_ASK_PHONE_NUMBER),
                request_contact: true,
              },
            ],
            back,
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.SETTING) {
      return {
        reply_markup: {
          keyboard: [
            [
              { text: this.ctx.i18n.t(Message.BUTTON_SETTINGS_NAME) },
              { text: this.ctx.i18n.t(Message.BUTTON_ASK_SETTINGS_PHONE) },
            ],
            [{ text: this.ctx.i18n.t(Message.BUTTON_SETTINGS_LAGNUAGE) }],
            [{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.MENU) {
      return {
        reply_markup: {
          keyboard: [
            [{ text: this.ctx.i18n.t(Message.BUTTON_ORDER) }],
            [{ text: this.ctx.i18n.t(Message.BUTTON_SETTINGS) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.CONFIRM_LOCATION) {
      return {
        reply_markup: {
          keyboard: [
            [
              {
                text: this.ctx.i18n.t(Message.BUTTON_SEND_LOCATION),
                request_location: true,
              },
              { text: this.ctx.i18n.t(Message.BUTTON_CONFIRM_LOCATION) },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.CHOOSE_ORDER_TYPE) {
      return {
        reply_markup: {
          keyboard: [
            [
              { text: this.ctx.i18n.t(Message.BUTTON_DELIVERY) },
              { text: this.ctx.i18n.t(Message.BUTTON_PICKUP) },
            ],
            [{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.CHOOSE_LOCATION) {
      return {
        reply_markup: {
          keyboard: [
            [
              {
                text: this.ctx.i18n.t(Message.BUTTON_SEND_LOCATION),
                request_location: true,
              },
              { text: this.ctx.i18n.t(Message.BUTTON_MY_LOCATIONS) },
            ],
            [{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else {
      return {
        reply_markup: {
          keyboard: [[{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    }
  }

  addressButtonList(data: any[]) {
    const keyboard: any[] = [];

    data.map((item) => {
      keyboard.push([{ text: item.address_address }]);
    });
    keyboard.push([{ text: this.ctx.i18n.t(Message.BUTTON_BACK) }]);

    return {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }
}
