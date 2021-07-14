const path = require('path');
const { storeImage } = require('../image_storage/storeImage');
const { retrieveImage } = require('../image_storage/retrieveImage');
const db = require('../config/db');

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

  const shopIds = [];
  let data = await db.query(sqlQuery, [count, page * count]);
  for (let i = 0; i < data.rows.length; i += 1) {
    shopIds.push(data.rows[i].shop_id);
    data.rows[i].price = 3;
  }
  // const shopIdsString = shopIds.toString();
  const shopIdsString = '1,2,3,4';
  const sqlQueryB = `SELECT * FROM shops_photos WHERE shop_id = ANY(ARRAY[${shopIdsString}])`;
  const result = await db.query(sqlQueryB);
  const images = [];

  for (let r = 0; r < result.rows.length; r += 1) {
    if (result.rows[r].mongo_id) {
      let image = await retrieveImage(result.rows[r].mongo_id);
      images.push(image);
    }
  }
  res.json(images);
  res.status(200).json(data.rows);
};

const addShop = (req, res) => {
  const {
    name, address, city, state, zip, phone_number, website, animal_friendly,
  } = req.body;
  const sqlQuery = `INSERT INTO shops (name, address, city, state, zip, date, phone_number, website, animal_friendly) VALUES('${name}', '${address}', '${city}', '${state}', ${zip}, current_timestamp, '${phone_number}', '${website}', '${animal_friendly}') RETURNING shop_id;`;
  let shopId = 1;

  db.query(sqlQuery, [], (err, success) => {
    if (err) {
      res.status(500).json(err);
    } else {
      shopId = success.rows[0].shop_id;
    }
  });

  const image = path.join(__dirname, '../../image_examples/storage/hr_logo.jpeg');
  const url = '';
  const saveImageId = (mongoId) => {
    const query = `INSERT INTO shops_photos (shop_id, url, mongo_id) VALUES (${shopId}, '${url}', '${mongoId}');`;
    db.query(query, [], (err, success) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(201).send(success);
      }
    });
  };
  storeImage(image, saveImageId);
};

module.exports = {
  getShops,
  getShop,
  getHighRatingShops,
  getRecentShops,
  addShop,
};
