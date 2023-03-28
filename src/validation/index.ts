const category = require('./validators/category-validation');
const product = require('./validators/product-validation');

module.exports = {
  ...category,
  ...product,
};
