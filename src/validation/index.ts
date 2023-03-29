const category = require('./validators/category-validation');
const product = require('./validators/product-validation');
const order = require('./validators/order-validation');
const media = require('./validators/media-validation');

module.exports = {
  ...category,
  ...product,
  ...order,
  ...media,
};
