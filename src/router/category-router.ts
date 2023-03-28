import express from 'express';
import { CategoryService } from '../service/category-service';
const router = express.Router();
const Validator = require('../shared/middlewares/validation');
const categoryService = CategoryService.getInstance();

router.get('/', (req, res) => {
  return categoryService.findAll(res);
});

router.delete('/:id', Validator('category_delete'), (req, res) => {
  return categoryService.delete({ ...req.params }, res);
});

router.route('/').post(Validator('category_post'), (req, res) => {
  return categoryService.create({ ...req.body }, res);
});

router.route('/:id').put(Validator('category_put'), (req, res) => {
  return categoryService.edit({ ...req.body, ...req.params }, res);
});
module.exports = router;
