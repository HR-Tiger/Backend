const db = require('../config/db');
const { uploadFile } = require('../../s3');

const getShops = (req, res) => {
  const count = req.body.count || 9;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
      FROM shops_photos p
      WHERE p.shop_id = s.shop_id) AS photos,
    AVG(r.rating) as avg_rating
  FROM shops s
  LEFT JOIN reviews r
  ON s.shop_id = r.shop_id
  GROUP BY 1,2,3,4,5,6,7,8,9,10
  LIMIT $1
  OFFSET $2
  `;

  db.query(sqlQuery, [count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    for (let i = 0; i < data.rows.length; i += 1) {
      data.rows[i].price = 3;
    }
    res.status(200).json(data.rows);
  });
};

const getShop = (req, res) => {
  const shopId = req.params.id;
  const count = req.body.count || 9;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
      FROM shops_photos p
      WHERE p.shop_id = s.shop_id) AS photos,
    AVG(r.rating) as avg_rating
  FROM shops s
  LEFT JOIN reviews r
  ON s.shop_id = r.shop_id
  WHERE s.shop_id = $1
  GROUP BY 1,2,3,4,5,6,7,8,9,10
  LIMIT $2
  OFFSET $3
  ;`;

  db.query(sqlQuery, [shopId, count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    for (let i = 0; i < data.rows.length; i += 1) {
      data.rows[i].price = 3;
    }
    res.status(200).json(data.rows);
  });
};

const getHighRatingShops = (req, res) => {
  const threshold = req.body.rating || 4;
  const count = req.body.count || 9;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT
    s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
      FROM shops_photos p
      WHERE p.shop_id = s.shop_id) AS photos,
    AVG(r.rating) as avg_rating
  FROM shops s
  LEFT JOIN reviews r
  ON s.shop_id = r.shop_id
  WHERE r.rating >= $1
  GROUP BY 1,2,3,4,5,6,7,8,9,10
  LIMIT $2
  OFFSET $3
  ;
  `;

  const shopIds = [];

  db.query(sqlQuery, [threshold, count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    for (let i = 0; i < data.rows.length; i += 1) {
      data.rows[i].price = 3;
      shopIds.push(data.rows[i].shop_id);
    }
    res.status(200).json(data.rows);
  });
};

const getRecentShops = async (req, res) => {
  const count = req.body.count || 9;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT
    s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
    FROM shops_photos p
    WHERE p.shop_id = s.shop_id) AS photos,
    AVG(r.rating) as avg_rating
  FROM shops s
  LEFT JOIN reviews r
  ON s.shop_id = r.shop_id
  GROUP BY 1,2,3,4,5,6,7,8,9,10
  ORDER BY date DESC
  LIMIT $1
  OFFSET $2
  ;
  `;

  const data = await db.query(sqlQuery, [count, page * count]);
  for (let i = 0; i < data.rows.length; i += 1) {
    data.rows[i].price = 3;
  }
  res.status(200).json(data.rows);
};

const addShop = async (req, res) => {
  const {
    name, address, city, state, zip, phone_number, website, animal_friendly,
  } = req.body;
  const sqlQuery1 = `INSERT INTO shops (name, address, city, state, zip, date, phone_number, website, animal_friendly) VALUES('${name}', '${address}', '${city}', '${state}', ${zip}, current_timestamp, '${phone_number}', '${website}', '${animal_friendly}') RETURNING shop_id;`;


  const store1 = await db.query(sqlQuery1, []);
  const shopId = store1.rows[0].shop_id;
  const imagePath = 'image_storage/hr_logo.jpeg';
  const saveToS3 = await uploadFile(imagePath, name);
  const sqlQuery2 = `INSERT INTO shops_photos (shop_id, url) VALUES (${shopId}, '${saveToS3.Location}');`;
  await db.query(sqlQuery2);
  res.send(store1);
};

module.exports = {
  getShops,
  getShop,
  getHighRatingShops,
  getRecentShops,
  addShop,
};
