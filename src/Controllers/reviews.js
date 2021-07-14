const fs = require('fs');
const db = require('../config/db');
const Reviews = require('../Models/reviews');
const { uploadFile } = require('../../s3');

const getReviews = (req, res) => {
  const shopId = req.params.id;
  const count = req.body.count || 5;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT
    r.*,
    (SELECT json_agg(to_jsonb(s) #- '{password}')
    FROM users s
    WHERE s.user_id = r.user_id)
    AS user,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{review_id}')
      FROM reviews_photos p
      WHERE p.review_id = r.review_id) AS photos
  FROM reviews r
  LEFT JOIN users u
  ON r.user_id = u.user_id
  WHERE shop_id = $1
  LIMIT $2
  OFFSET $3;
  `;

  db.query(sqlQuery, [shopId, count, page * count], (err, data) => {
    if (err) {
      res.status(500).json(err);
    }
    res.status(200).json(data.rows);
  });
};

const getReview = (req, res) => {
  const reviewId = req.params.review_id;

  const sqlQuery = `
    SELECT
      r.*,
      (SELECT json_agg(to_jsonb(s) #- '{password}')
      FROM users s
      WHERE s.user_id = r.user_id)
      AS user,
      (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{review_id}')
        FROM reviews_photos p
        WHERE p.review_id = r.review_id) AS photos
    FROM reviews r
    LEFT JOIN users u
    ON r.user_id = u.user_id
    WHERE review_id = $1;
  `;

  db.query(sqlQuery, [reviewId], (err, data) => {
    if (err) {
      res.status(500).json(err);
    }
    res.status(200).json(data.rows);
  });
};

const updateHelpfulness = async (req, res) => {
  const reviewId = req.params.review_id;
  const sqlQueryA = await db.query(`SELECT helpfulness_count FROM reviews WHERE review_id = ${reviewId}`);
  const currentCount = sqlQueryA.rows[0].helpfulness_count;
  const sqlQueryB = `UPDATE reviews SET helpfulness_count = ${currentCount + 1} WHERE review_id = ${reviewId};`;
  db.query(sqlQueryB, [], (err) => {
    if (err) {
      res.status(500).json(err);
    }
    res.send('Updated helpfulness count');
  });
};

const getReviewsByUser = (req, res) => {
  const userId = req.params.id;
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
      res.status(500).json(err);
    }

    res.status(200).json(data.rows);
  });
};

const getReviewsToAuthUser = (req, res) => {
  Reviews.reviewsToAuthUser(req.user.user_id)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

const addReview = async (req, res) => {
  const { shopId } = req.params;
  const {
    user_id, summary, category, description, rating,
  } = req.body;
  const owner_response = '';

  const sqlQuery1 = `INSERT INTO reviews (user_id, shop_id, summary, category, description, rating, owner_response, date) VALUES(${user_id}, ${shopId}, '${summary}', '${category}', '${description}', ${rating}, '${owner_response}', current_timestamp) RETURNING review_id;`;
  const store1 = await db.query(sqlQuery1, []);
  if (req.files) {
    for (let i = 0; i < req.files.length; i += 1) {
      const reviewId = store1.rows[0].review_id;
      const saveToS3 = await uploadFile(req.files[i]);
      const sqlQuery2 = `INSERT INTO reviews_photos (review_id, url) VALUES (${reviewId}, '${saveToS3.Location}');`;
      await db.query(sqlQuery2);
      fs.unlink(req.files[i].path, ((err) => {
        if (err) console.log(err);
        else if (i === req.files.length - 1) {
          res.send('Hi');
        }
      }));
    }
  }
  res.send(store1);
};

module.exports = {
  getReviews,
  getReview,
  updateHelpfulness,
  getReviewsByUser,
  addReview,
  getReviewsToAuthUser,
};
