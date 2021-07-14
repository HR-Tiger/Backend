const db = require('../config/db');
const Promise = require('bluebird');

const reviewsToAuthUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM reviews WHERE user_id = $1;`, [id], (error, data) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(data.rows);
      }
    });
  });
};

module.exports = {
  reviewsToAuthUser,
};
