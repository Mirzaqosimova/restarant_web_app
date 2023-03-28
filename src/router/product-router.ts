import express from 'express';
import { ProductService } from '../service/product-service';
const router = express.Router();
const Validator = require('../shared/middlewares/validation');
const productService = ProductService.getInstance();

router.get('/', Validator('product_find_all'), (req, res) => {
  return productService.findAll({ ...req.query }, res);
});

router.delete('/:id', Validator('product_param'), (req, res) => {
  return productService.delete({ ...req.params }, res);
});

router.get('/:id', Validator('product_param'), (req, res) => {
  return productService.findOne({ ...req.params }, res);
});

router.route('/').post(Validator('product_post'), (req, res) => {
  return productService.create({ ...req.body }, res);
});

router.route('/:id').put(Validator('product_put'), (req, res) => {
  return productService.edit({ ...req.body, ...req.params }, res);
});

module.exports = router;
