const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();

const Shops = require('./Controllers/shops');
const Reviews = require('./Controllers/reviews');
const Users = require('./Controllers/users');

// CONSTANTS
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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


// GET
app.get('/api/users/:id', Users.getUser);
app.get('/api/highRatingShops', Shops.getHighRatingShops);
app.get('/api/recentShops', Shops.getRecentShops);
app.get('/api/shops', Shops.getShops);
app.get('/api/shops/:id', Shops.getShop);
app.get('/api/shops/:id/reviews', Reviews.getReviews);
app.get('/api/reviews/:review_id', Reviews.getReview);
app.get('/api/reviews/users/:id', Reviews.getReviewsByUser);

// PUT
app.put('/api/reviews/:review_id', Reviews.updateHelpfulness);

// POST
app.post('/api/shops', Shops.addShop);
// app.post('/api/reviews/:shopId', Shop.addReview);

app.get('/', (req, res) => {
  res.status(200).send('Hello');
});

app.listen(PORT);

module.exports = app;
