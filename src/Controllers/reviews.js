const db = require('../config/db');

const getShops = (req, res) => {
  const sqlQuery = `
  SELECT *
  FROM shops
  LIMIT 5;
  `;

  db.query(sqlQuery, [], (err, data) => {
    if (err) {
      res.sentStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

module.exports = {

};
