const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const morgan = require('morgan');


const app = express();

const Shops = require('./Controllers/shops');
const Reviews = require('./Controllers/reviews');

// CONSTANTS
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan('dev'));

const swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  host: 'localhost:3000',
  basePath: '/',
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
const Auth = require('./Controllers/auth');
app.post('/api/auth/login', Auth.login);
app.post('/api/auth/register', Auth.register);

app.get('/api/highRatingShops', Shops.getHighRatingShops);
app.get('/api/recentShops', Shops.getRecentShops);
app.get('/api/shops', Shops.getShops);
app.get('/api/shops/:id/reviews', Reviews.getReviews);
app.get('/api/reviews/:review_id', Reviews.getReview);
app.put('/api/reviews/:review_id', Reviews.updateHelpfulness);

app.get('/', (req, res) => {
  res.status(200).send('Hello');
});

app.listen(PORT);

module.exports = app;
