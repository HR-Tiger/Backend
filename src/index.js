const express = require('express');
// const swaggerJSDoc = require('swagger-jsdoc');
const morgan = require('morgan');
const passport = require('passport');

require('./auth/passport');

const app = express();

const Shops = require('./Controllers/shops');
const Reviews = require('./Controllers/reviews');
const Auth = require('./Controllers/auth');

// CONSTANTS
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

app.post('/api/auth/login', Auth.login);
app.post('/api/auth/register', Auth.register);

app.get('/api/highRatingShops', Shops.getHighRatingShops);
app.get('/api/recentShops', Shops.getRecentShops);
app.get('/api/shops', Shops.getShops);
app.get('/api/shops/:id/reviews', Reviews.getReviews);
app.get('/api/reviews/:review_id', Reviews.getReview);
app.put('/api/reviews/:review_id', Reviews.updateHelpfulness);

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).send(req.user);
});

app.listen(PORT);

module.exports = app;
