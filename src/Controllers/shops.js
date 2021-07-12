const db = require('../config/db');

const getShops = (req, res) => {
  const count = req.body.count || 5;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
      FROM shops_photos p
      WHERE p.shop_id = s.shop_id) AS photos
  FROM shops s
  LIMIT $1
  OFFSET $2
  `;

  db.query(sqlQuery, [count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

const getShop = (req, res) => {
  const shopId = req.params.id;
  const count = req.body.count || 5;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT s.*,
    (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
      FROM shops_photos p
      WHERE p.shop_id = s.shop_id) AS photos
  FROM shops s
  WHERE s.shop_id = $1
  LIMIT $2
  OFFSET $3
  ;`;

  db.query(sqlQuery, [shopId, count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

const getHighRatingShops = (req, res) => {
  const threshold = req.body.rating || 4;
  const count = req.body.count || 5;
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

  db.query(sqlQuery, [threshold, count, page * count], (err, data) => {
    if (err) {
      res.sendStatus(500);
    }
    res.status(200).json(data.rows);
  });
};

const getRecentShops = (req, res) => {
  const count = req.body.count || 5;
  const page = req.body.page || 0;

  const sqlQuery = `
  SELECT s.*,
  (SELECT json_agg(to_jsonb(p) #- '{photo_id}' #- '{shop_id}')
  FROM shops_photos p
  WHERE p.shop_id = s.shop_id) AS photos
  FROM shops s
  ORDER BY date DESC
  LIMIT $1
  OFFSET $2
  ;
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

const addShop = (req, res) => {
  let name = req.body.name;
  let address = req.body.address;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;
  let phone_number = req.body.phone_number;
  // let price = req.body.price;
  let website = req.body.website;
  let animal_friendly = req.body.animal_friendly;

 const sqlQuery = `INSERT INTO shops (name, address, city, state, zip, date, phone_number, website, animal_friendly) VALUES('${name}', '${address}', '${city}', '${state}', ${zip}, current_timestamp, '${phone_number}', '${website}', '${animal_friendly}');`;

  db.query(sqlQuery, [], (err, success) => {
    if (err) {
      res.status(500).json(err);
    }
    res.status(201).send(success);
  });
};

module.exports = {
  getShops,
  getShop,
  getHighRatingShops,
  getRecentShops,
  addShop,
};
