const Promise = require('bluebird');
const db = require('../config/db');

const getShopByName = (name) => new Promise((resolve, reject) => {
  db.query('SELECT * FROM shops WHERE name = $1;', [name], (error, data) => {
    if (error) {
      reject(error);
    }
    resolve(data.rows);
  });
});

const getShopByCity = (city) => new Promise((resolve, reject) => {
  db.query('SELECT * FROM shops WHERE city = $1;', [city], (error, data) => {
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
