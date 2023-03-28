import Joi from 'joi';
import { OrderStatus } from '../../shared/enums/order.status';
import { PaymentType } from '../../shared/enums/payment.type';

const order_post = Joi.object({
  body: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+998[3789]{1}[013456789]{1}[0-9]{7}$/).required(),
    description: Joi.string().required(),
    paymentType: Joi.string().valid(PaymentType.CASH,PaymentType.CLICK,PaymentType.PAYME).required(),
    adressId: Joi.number().optional(),
    userId: Joi.number().required(),
    products: Joi.array().unique((a, b) => a.productId === b.productId).items(
        Joi.object({
            productId: Joi.number(),
            count:Joi.number().min(0)
        }).min(1)
    )
  }),
});

const order_put = Joi.object({
    body: Joi.object({
        status: Joi.string().valid(OrderStatus).required(),
      }),
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

const order_param = Joi.object({
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

const order_find_all = Joi.object({
  query: Joi.object({
    status: Joi.string().valid(OrderStatus).optional(),
  }).unknown(true),
});

module.exports = { order_post, order_param,  order_find_all,  order_put };
