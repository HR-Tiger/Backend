const fs = require('fs');
const db = require('../config/db');
const Shops = require('../Models/shops');
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
  if (req.files) {
    for (let i = 0; i < req.files.length; i += 1) {
      const shopId = store1.rows[0].shop_id;
      const saveToS3 = await uploadFile(req.files[i]);
      const sqlQuery2 = `INSERT INTO shops_photos (shop_id, url) VALUES (${shopId}, '${saveToS3.Location}');`;
      await db.query(sqlQuery2);
      fs.unlink(req.files[i].path, ((err) => {
        if (err) console.log(err);
        else if (i === req.files.length - 1) {
          res.send(store1);
        }
      }));
    }
  }
  res.send(store1);
};

const searchShop = (req, res) => {
  if (req.query.name) {
    Shops.getShopByName(req.query.name)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  } else if (req.query.city) {
    Shops.getShopByCity(req.query.city)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        res.stutus(500).send(error);
      });
  } else {
    res.status(422).send('Search parameter is not specified');
  }
};

const filterShops = (req, res) => {
  price = req.body.price || [1, 2, 3, 4, 5];
  rating = req.body.rating || [1, 2, 3, 4, 5];

  const sql = `
    SELECT
      rs.shop_id,
      rs.avarage,
      rs.animal_friendly
    FROM
      (SELECT s.*,
        (SELECT
          ROUND(AVG(r.rating))
        FROM
          reviews r
        WHERE
          r.shop_id = s.shop_id
      ) AS avarage
      FROM
        shops s) AS rs
    WHERE
      rs.avarage IN $1 AND rs.price IN $2;
  `;
  // AND rs.animal_friendly = true

  Shops.filterShops(query, values)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};

module.exports = {
  getShops,
  getShop,
  getHighRatingShops,
  getRecentShops,
  searchShop,
  addShop,
  filterShops,
};
