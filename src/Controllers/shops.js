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

const getHighRatingShops = (req, res) => {
  const threshold = req.body.rating || 4;
  const count = req.body.count || 5;

  const sqlQuery = `
  SELECT s.*, AVG(r.rating) as avg_rating
  FROM shops s
  LEFT JOIN reviews r
  ON s.shop_id = r.shop_id
  WHERE r.rating >= ${threshold}
  GROUP BY 1,2,3,4,5,6,7,8,9,10
  LIMIT ${count};
  `;

  db.query(sqlQuery, [], (err, data) => {
    if (err) {
      res.sentStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

const getRecentShops = (req, res) => {
  const count = req.body.count || 5;
  const page = req.body.page || 1;

  const sqlQuery = `
  SELECT *
  FROM shops
  ORDER BY date DESC
  LIMIT $1
  OFFSET $2
  ;
  `;

  db.query(sqlQuery, [count, page * count], (err, data) => {
    if (err) {
      res.sentStatus(500);
    }
    console.log('data: ', data);
    res.status(200).json(data.rows);
  });
};

module.exports = {
  getShops,
  getHighRatingShops,
  getRecentShops,
};
