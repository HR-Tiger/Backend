const db = require('../config/db');
const Users = require('../Models/users');

const getUser = (req, res) => {
  const userId = req.params.id;
  Users.getUser(userId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
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

const filterReviewsByUser = (req, res) => {
  const userId = req.params.id;
  const count = req.params.count || 9;
  const page = req.params.page || 0;
  const rating = req.query.rating || [1, 2, 3, 4, 5];
  const category = req.query.category === 'null' ? ['Drip Brew', 'Latte', 'Cappuccino', 'Americano', 'Espresso', 'Mocha', 'Tea', 'Iced Coffee', 'Cold Brew'] : req.query.category;
  for (let i = 0; i < category.length; i += 1) {
    category[i] = `'${category[i]}'`;
  }
  for (let j = 0; j < rating.length; j += 1) {
    rating[j] = Number(rating[j]);
  }
  const ratingString = rating.join(',');
  const category_string = category.join(', ');
  const sqlQuery = `
  SELECT
  r.*,
  (SELECT json_agg(to_jsonb(s) #- '{password}')
  FROM users s
  WHERE s.user_id = r.user_id)
  AS user,
  (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{review_id}')
    FROM reviews_photos p
    WHERE p.review_id = r.review_id) AS photos,
  sh.price AS price
  FROM reviews r
  LEFT JOIN users u
  ON r.user_id = u.user_id
  LEFT JOIN shops sh
  ON r.shop_id = sh.shop_id
  WHERE r.user_id = ${userId}
  AND r.rating = ANY(ARRAY[${ratingString}])
  AND r.category IN (${category_string})
  LIMIT ${count}
  OFFSET ${page * count};`;

  db.query(sqlQuery, [], (err, data) => {
    if (err) {
      res.status(500).json(err);
    }
    res.status(200).json(data.rows);
  });
};

module.exports = {
  getUser,
  getUserProfileInfo,
  filterReviewsByUser,
};
