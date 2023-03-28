import express from 'express';
const router = express.Router();

router.get('/category', (req, res) => {
  res.send('Home page');
});

router.get('/category', (req, res) => {
  res.send('Home page');
});

router.post('/category', (req, res) => {
  res.send('About page');
});

router.patch('/category', (req, res) => {
  res.send('Contact page');
});

module.exports = router;
