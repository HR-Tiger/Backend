const Promise = require('bluebird');
const db = require('../config/db');

const reviewsToAuthUser = (id) => new Promise((resolve, reject) => {
  db.query('SELECT * FROM reviews WHERE user_id = $1;', [id], (error, data) => {
    if (error) {
      reject(error);
    } else {
      resolve(data.rows);
    }
  });
});

const getReviewByUser = (userId) => new Promise((resolve, reject) => {
  const sqlQuery = `
    SELECT
      *
    FROM
      reviews
    WHERE
      user_id = $1
    LIMIT 5;
  `;
  db.query(sqlQuery, [userId], (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data.rows);
    }
  });
});

module.exports = {
  reviewsToAuthUser,
  getReviewByUser,
};
