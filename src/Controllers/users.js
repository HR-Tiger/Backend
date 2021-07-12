const db = require('../config/db');

const getUser = (req, res) => {
  const userId = req.params.id;
  const sqlQuery = `
    SELECT
      json_agg(to_jsonb(u) #- '{password}')
    FROM
      users u
    WHERE user_id = $1;
  `;
  db.query(sqlQuery, [userId], (err, data) => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).json(data.rows[0]['json_agg'][0]);
  });
};

module.exports = {
  getUser,
};
