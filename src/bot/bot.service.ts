import { Context, Markup, NarrowedContext } from 'telegraf';
import { Update, CallbackQuery } from 'telegraf/typings/core/types/typegram';
import AppDataSource from '../shared/db/db.config';
import { User } from '../entity/user.entity';
import { BotAction } from './const/button-action';
import { BotUserStatus } from './const/user-status';
import { Message } from './const/message';
import { Address } from '../entity/adress.entity';
import { YandexService } from './yandex.connect';
import { createQueryBuilder } from 'typeorm';

export class BotService {
  //json

  private static instance = new BotService();
  public userStatus;
  public ctx;
  public phoneRegex = /^\+998[3789]{1}[013456789]{1}[0-9]{7}$/;
  public nameRegex = /^[a-zA-Z]{2,20}$/;
  public chatId;
  private userRepository = AppDataSource.getRepository(User);
  private addressRepository = AppDataSource.getRepository(Address);

  public static getInstance() {
    return this.instance;
  }

  //agar session yoq bolib lekin databaseda bor bosa i18 ga tilini set qilib qoyish kere
  async setSession(): Promise<any> {
    const user = await this.userRepository.findOneBy({ chat_id: this.chatId });

    //menuga jonat
    return user !== null ? BotUserStatus.MENU : BotUserStatus.START;
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
    return this.ctx.reply('Tilni tanlang', this.getInline());
  }

  async setLanguageAskPhoneNumber() {
    await this.deleteMessageOrCallback();
    this.ctx.i18n.languageCode = this.ctx.callbackQuery.data;
    this.ctx.reply(this.ctx.i18n.t(Message.LANGUAGE_SETTES));
    if (this.userStatus === BotUserStatus.START) {
      await this.changeSessionStatus(BotUserStatus.SEND_PHONE);
      return this.ctx
        .reply(
          this.ctx.i18n.t(Message.ASK_PHONE_NUMBER),
          this.getReplyButtons(),
        )
        .then((sentMessage) => {
          // save the message ID to delete the reply markup later
          this.ctx.session['messageId'] = sentMessage.message_id;
        });
    } else if (this.userStatus === BotUserStatus.SET_SEND_LANGUAGE) {
      this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx
        .reply('settings', this.getReplyButtons())
        .then((sentMessage) => {
          // save the message ID to delete the reply markup later
          this.ctx.session['messageId'] = sentMessage.message_id;
        });
    } //Menuga qaytish
  }

  async getPhoneNumberSendMenu(action: boolean) {
    const phone = this.getPhone(action);
    const data = await this.validationPhoneNumber(phone);
    if (!data) {
      return this.ctx.reply('bowqattan jonat');
    }

    await this.userRepository.save({
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

    //jsonga yozish kk
    await this.ctx.reply('succesfully saved');

    return this.menu();
  }

  async menu() {
    await this.changeSessionStatus(BotUserStatus.MENU);
    return this.ctx.reply('welcome', this.getReplyButtons());
  }

  async menuResponse() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.SETTINGS)) {
      await this.changeSessionStatus(BotUserStatus.SETTING);
      return this.ctx.reply('Settings tanla: ', this.getReplyButtons());
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.ORDER)) {
      await this.changeSessionStatus(BotUserStatus.CHOOSE_ORDER_TYPE);
      return this.ctx.reply('kak vam udobna?: ', this.getReplyButtons());
    }
  }
  chooseOrderType() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.DELIVERY)) {
      this.changeSessionStatus(BotUserStatus.CHOOSE_LOCATION);
      return this.ctx.reply('kak vam udobna?: ', this.getReplyButtons());
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.PICKUP)) {
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      return this.ctx.reply('menuni tanlang', this.getReplyButtons());
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BACK)) {
      return this.menu();
    }
  }
  async chooseLocations() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.MY_LOCATIONS)) {
      const data = await this.addressRepository
        .createQueryBuilder('address')
        .select(['address.address'])
        .innerJoin('address.user', 'user')
        .distinct(true)
        .where('user.chat_id = :id', { id: this.chatId })
        .getRawMany();
      this.changeSessionStatus(BotUserStatus.CHOOSE_SAVED_LOCATION);
      return this.ctx.reply('kak vam udobna?: ', this.addressButtonList(data));
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BACK)) {
      return this.menu();
    }
  }

  getMenu() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.HISTORY)) {
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      return this.ctx.reply('kak vam udobna?: ', this.getReplyButtons());
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BACK)) {
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
    const address_text =
      data.response.GeoObjectCollection.featureMember[0].GeoObject
        .metaDataProperty.GeocoderMetaData.text;

    this.changeSessionStatus(BotUserStatus.CONFIRM_LOCATION);
    return this.ctx.reply(address_text, this.getReplyButtons()).then(() => {
      this.ctx.session['address'] = address_text;
      this.ctx.session['latitude'] = latitude;
      this.ctx.session['longitude'] = longitude;
    });
  }

  async setUserLocation() {
    const address_text = this.ctx.session['address'];
    const longitude = this.ctx.session['longitude'];
    const latitude = this.ctx.session['latitude'];

    if (!(address_text && latitude && longitude)) {
      this.ctx.reply('pleas /start bos');
    } else {
      delete this.ctx.session.address;
      delete this.ctx.session.longitude;
      delete this.ctx.session.latitude;
    }
    const address = await this.addressRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        user: {
          chat_id: this.chatId,
        },
        address: address_text,
      },
    });
    console.log(address_text, this.chatId);

    let address_id;
    if (address !== null) {
      address_id = address.id;
    } else {
      const user = await this.userRepository.findOneBy({
        chat_id: this.chatId,
      });
      await this.addressRepository
        .save(new Address(user, address_text, longitude, latitude))
        .then((res) => {
          console.log(address_id);
          address_id = res.id;
        });
    }
    this.changeSessionStatus(BotUserStatus.ORDER_MENU);
    return this.ctx.reply('menuni tanlang', this.getReplyButtons(address_id));
  }
  /**bu yeeeeeeeeeeeer
   *
   *
   *
   *
   */
  async setSavedLocation() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.BACK)) {
      this.changeSessionStatus(BotUserStatus.CHOOSE_LOCATION);
      return this.ctx.reply('kak vam udobna?: ', this.getReplyButtons());
    } else {
      const address = await this.addressRepository.findOne({
        relations: {
          user: true,
        },
        where: {
          user: {
            chat_id: this.chatId,
          },
          address: this.ctx.message.text,
        },
      });
      if (address === null) {
        return this.ctx.reply('Manzil topilmadi');
      }
      this.changeSessionStatus(BotUserStatus.ORDER_MENU);
      return this.ctx.reply('menuni tanlang', this.getReplyButtons(address.id));
    }
  }

  async settings() {
    if (this.ctx.message.text === this.ctx.i18n.t(Message.SETTINGS_NAME)) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_NAME);

      return this.ctx.reply('send name: ', this.getReplyButtons());
    } else if (
      this.ctx.message.text === this.ctx.i18n.t(Message.SETTINGS_PHONE)
    ) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_PHONE);
      return this.ctx.reply('send name: ', this.getReplyButtons());
    } else if (
      this.ctx.message.text === this.ctx.i18n.t(Message.SETTINGS_LAGNUAGE)
    ) {
      await this.changeSessionStatus(BotUserStatus.SET_SEND_LANGUAGE);
      return this.chooseLanguage();
    } else if (this.ctx.message.text === this.ctx.i18n.t(Message.BACK)) {
      return this.menu();
    }
  }

  async setName() {
    const name = this.ctx.message.text;
    if (!this.nameRegex.test(name)) {
      //json
      return this.ctx.reply('notori format');
    }
    await this.userRepository.update(
      { chat_id: this.chatId },
      { full_name: String(name) },
    );
    this.changeSessionStatus(BotUserStatus.SETTING);
    return this.ctx.reply('Saqlandi', this.getReplyButtons());
  }
  async setPhoneNumber(action: boolean) {
    const phone = this.getPhone(action);
    const data = await this.validationPhoneNumber(phone);
    if (!data) {
      return this.ctx.reply('bowqattan jonat');
    }
    await this.changeSessionStatus(BotUserStatus.SETTING);
    await this.userRepository.update(
      { chat_id: this.chatId },
      { phone_number: phone },
    );
    this.changeSessionStatus(BotUserStatus.SETTING);

    return this.ctx.reply('settings', this.getReplyButtons());
  }

  getPhone(action: boolean) {
    let phone;
    if (action) {
      phone = '+' + String(this.ctx.message.contact.phone_number);
    } else {
      phone = String(this.ctx.message.text);
    }

    return phone;
  }
  async validationPhoneNumber(phone: string) {
    if (!this.phoneRegex.test(phone)) {
      await this.ctx.reply(this.ctx.i18n.t(Message.WRONG_PHONE_NUMBER));
      return false;
    }
    const check = await this.userRepository.findOneBy({ phone_number: phone });

    if (check !== null) {
      if (check.chat_id !== this.chatId) {
        await this.ctx.reply(
          this.ctx.i18n.t(Message.PHONE_NUMBER_ALREADY_EXISTS),
        );
        return false;
      }
    }
    return true;
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

  getReplyButtons(address_id?: number) {
    if (
      this.userStatus === BotUserStatus.SEND_PHONE ||
      this.userStatus === BotUserStatus.SET_SEND_PHONE
    ) {
      const back =
        this.userStatus === BotUserStatus.SET_SEND_PHONE
          ? [{ text: this.ctx.i18n.t(Message.BACK) }]
          : [];

      return {
        reply_markup: {
          keyboard: [
            [
              {
                text: this.ctx.i18n.t(Message.ASK_PHONE_NUMBER_BUTTON),
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
              { text: this.ctx.i18n.t(Message.SETTINGS_NAME) },
              { text: this.ctx.i18n.t(Message.SETTINGS_PHONE) },
            ],
            [{ text: this.ctx.i18n.t(Message.SETTINGS_LAGNUAGE) }],
            [{ text: this.ctx.i18n.t(Message.BACK) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.MENU) {
      return {
        reply_markup: {
          keyboard: [
            [{ text: this.ctx.i18n.t(Message.ORDER) }],
            [{ text: this.ctx.i18n.t(Message.SETTINGS) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else if (this.userStatus === BotUserStatus.ORDER_MENU) {
      return {
        reply_markup: {
          keyboard: [
            [
              Markup.button.webApp(
                this.ctx.i18n.t(Message.MENU),
                'https://orkhan.gitbook.io/typeorm/docs/select-query-builder#joining-relations',
              ),
            ],
            [{ text: this.ctx.i18n.t(Message.HISTORY) }],
            [{ text: this.ctx.i18n.t(Message.BACK) }],
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
                text: this.ctx.i18n.t(Message.SEND_LOCATION),
                request_location: true,
              },
              { text: this.ctx.i18n.t(Message.CONFIRM_LOCATION) },
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
              { text: this.ctx.i18n.t(Message.DELIVERY) },
              { text: this.ctx.i18n.t(Message.PICKUP) },
            ],
            [{ text: this.ctx.i18n.t(Message.BACK) }],
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
                text: this.ctx.i18n.t(Message.SEND_LOCATION),
                request_location: true,
              },
              { text: this.ctx.i18n.t(Message.MY_LOCATIONS) },
            ],
            [{ text: this.ctx.i18n.t(Message.BACK) }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    } else {
      return {
        reply_markup: {
          keyboard: [[{ text: this.ctx.i18n.t(Message.BACK) }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
    }
  }

  addressButtonList(data: any[]) {
    let keyboard: any[] = [];

    data.map((item) => {
      keyboard.push([{ text: item.address_address }]);
    });
    keyboard.push([{ text: this.ctx.i18n.t(Message.BACK) }]);

    return {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };
  }
}
