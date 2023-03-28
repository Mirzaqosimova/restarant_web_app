import Joi from 'joi';

const product_post = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    fileName: Joi.string().required(),
    description: Joi.string().required(),
    isActive: Joi.boolean().required(),
    price: Joi.number().min(500).required(),
    categoryId: Joi.number().required(),
  }),
});

const product_put = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    fileName: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(500).required(),
    isActive: Joi.boolean().required(),
    categoryId: Joi.number().required(),
  }),
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

const product_param = Joi.object({
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

const product_find_all = Joi.object({
  query: Joi.object({
    categoryId: Joi.number().required(),
    isActive: Joi.boolean().optional(),
  }).unknown(true),
});

module.exports = { product_post, product_param, product_find_all, product_put };
