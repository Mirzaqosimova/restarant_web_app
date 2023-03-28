import express from 'express';
import { OrderService } from '../service/order-service';
const router = express.Router();
const Validator = require('../shared/middlewares/validation');
const orderService = OrderService.getInstance();

router.get('/', Validator('order_find_all'), (req, res) => {
  return orderService.findAll({ ...req.query }, res);
});

router.delete('/:id', Validator('order_param'), (req, res) => {
  return orderService.delete({ ...req.params }, res);
});

router.get('/:id', Validator('order_param'), (req, res) => {
  return orderService.findOne({ ...req.params }, res);
});

router.route('/').post(Validator('order_post'), (req, res) => {
  return orderService.create({ ...req.body }, res);
});

router.route('/:id').put(Validator('order_put'), (req, res) => {
  return orderService.edit({ ...req.body, ...req.params }, res);
});

module.exports = router;
