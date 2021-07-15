const db = require('../config/db');
const Users = require('../Models/users');

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

const getUserProfileInfo = (req, res) => {
  Users.userProfileInfo(req.user.user_id)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

module.exports = {
  getUser,
  getUserProfileInfo,
};
