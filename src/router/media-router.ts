import express from 'express';
import { MediasService } from '../service/media-service';
const router = express.Router();
const uploadSingle = require('../shared/media-config');
const mediaService = MediasService.getInstance();
const Validator = require('../shared/middlewares/validation');

router.route('/').post(uploadSingle, (req, res) => {
  return mediaService.create(req, res);
});
router.delete('/:fileName', Validator('media_param'), (req, res) => {
  return mediaService.delete({ ...req.params }, res);
});

module.exports = router;
