import Joi from 'joi';

const category_post = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    fileName: Joi.string().required(),
  }),
});

const category_put = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),
    fileName: Joi.string().required(),
  }),
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

const category_delete = Joi.object({
  params: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

module.exports = { category_post, category_delete, category_put };
