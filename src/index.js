const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const multer = require('multer');

const upload = multer({ dest: 'image_storage/' });
require('./auth/passport');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();

const Shops = require('./Controllers/shops');
const Reviews = require('./Controllers/reviews');
const Auth = require('./Controllers/auth');
const Users = require('./Controllers/users');

// CONSTANTS
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// app.use(express.static('public'));

app.post('/api/auth/login', Auth.login);
app.post('/api/auth/register', Auth.register);

// GET
app.get('/api/user/', passport.authenticate('jwt', { session: false }), Users.getUserProfileInfo);
app.get('/api/users/:id', Users.getUser);
app.get('/api/shops/search', Shops.searchShop);
app.get('/api/highRatingShops', Shops.getHighRatingShops);
app.get('/api/recentShops', Shops.getRecentShops);
app.get('/api/shops/filter', Shops.filterShops);
app.get('/api/shops/:id/reviews/filter', Reviews.filterReviews);
app.get('/api/reviews/users/:id/filter', Users.filterReviewsByUser);
app.get('/api/shops', Shops.getShops);
app.get('/api/shops/:id', Shops.getShop);
app.get('/api/shops/:id/reviews', Reviews.getReviews);
app.get('/api/reviews/user/', passport.authenticate('jwt', { session: false }), Reviews.getReviewsToAuthUser);
app.get('/api/reviews/:review_id', Reviews.getReview);
app.get('/api/reviews/users/:id', Reviews.getReviewsByUser);
app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).send(req.user);
});

// PUT
app.put('/api/reviews/:review_id', Reviews.updateHelpfulness);

// POST
app.post('/api/shops', upload.array('photos'), Shops.addShop);
app.post('/api/reviews/:shopId', upload.array('photos'), Reviews.addReview);

app.listen(PORT);

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
