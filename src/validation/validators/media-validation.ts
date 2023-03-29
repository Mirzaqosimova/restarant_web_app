import Joi from 'joi';

const media_param = Joi.object({
  params: Joi.object({
    fileName: Joi.string().required(),
  }).unknown(true),
});

module.exports = { media_param };
