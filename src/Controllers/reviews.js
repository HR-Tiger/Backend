const db = require('../config/db');

const getReviews = (req, res) => {
  const shopId = req.params.id;
  const count = req.body.count || 5;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT *
  FROM reviews
  WHERE shop_id = $1
  LIMIT $2
  OFFSET $3;
  `;

  db.query(sqlQuery, [shopId, count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

module.exports = {
  getReviews,
};
