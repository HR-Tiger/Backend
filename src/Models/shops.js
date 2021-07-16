const Promise = require('bluebird');
const db = require('../config/db');

const getShopByName = (name) => new Promise((resolve, reject) => {
  const sql = `
              SELECT
              s.*,
              AVG(r.rating) as avg_rating
              FROM shops s
              LEFT JOIN reviews r
              ON s.shop_id = r.shop_id
              WHERE name = $1
              GROUP BY 1,2,3,4,5,6,7,8,9,10;
              `;
  db.query(sql, [name], (error, data) => {
    if (error) {
      reject(error);
    }
    resolve(data.rows);
  });
});

const getShopByCity = (city) => new Promise((resolve, reject) => {
  const sql = `
                SELECT
                s.*,
                AVG(r.rating) as avg_rating
                FROM shops s
                LEFT JOIN reviews r
                ON s.shop_id = r.shop_id
                WHERE city = $1
                GROUP BY 1,2,3,4,5,6,7,8,9,10;
                `;
  db.query(sql, [city], (error, data) => {
    if (error) {
      reject(error);
    }
    resolve(data.rows);
  });
});

const filterShops = (query, values = []) => new Promise((resolve, reject) => {
  db.query(query, values, (error, data) => {
    if (error) {
      console.log('error: ', error);
      reject(error);
    }
    resolve(data.rows);
  });
});

module.exports = {
  getShopByName,
  getShopByCity,
  filterShops,
};
