const category = require('./validators/category-validation');
const product = require('./validators/product-validation');
const order = require('./validators/order-validation');

module.exports = {
  ...category,
  ...product,
  ...order
};
