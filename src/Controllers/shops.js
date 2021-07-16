const fs = require('fs');
const db = require('../config/db');
const Shops = require('../Models/shops');
const { uploadFile } = require('../../s3');

const getShops = (req, res) => {
  const count = req.params.count || 9;
  const page = req.params.page || 0;

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
  const count = req.params.count || 9;
  const page = req.params.page || 0;

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
      console.log(err);
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
  const count = req.params.count || 9;
  const page = req.params.page || 0;

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
  const count = req.params.count || 9;
  const page = req.params.page || 0;

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

/**
 * Add shop POST request for /api/shop endpoint
 * @param {Object} req - The request
 * @param {Object} res - The response
 *
 * @typedef {Object} req.body
 * @param {String} name
 * @param {String} address
 * @param {String} city
 * @param {String} state
 * @param {Integer} zip - length < 4
 * @param {String} phone_number
 * @param {String} website
 * @param {Boolean} animal_friendly
 * @return {undefined}
 * {
 *  "name": "Marko",
 *  "address": "kok",
 *  "city": "cit",
 *  "state": "eee",
 *  "zip": 1029222,
 *  "phone_number": "ded",
 *  "website": "ddd",
 *  "animal_friendly": true
 * }
 */

const addShop = async (req, res) => {
  let {
    name,
    address,
    city,
    state,
    zip,
    phone_number,
    website,
    animal_friendly,
    price,
  } = req.body;
  zip = Number(zip);
  price = Number(price);
  if (
    typeof name === 'string' &&
    typeof address === 'string' &&
    typeof city === 'string' &&
    typeof state === 'string' &&
    typeof zip === 'number' &&
    typeof phone_number === 'string' &&
    typeof website === 'string' &&
    typeof animal_friendly === 'boolean' &&
    typeof price === 'number'
  ) {
    const sqlQuery1 = `
      INSERT INTO
        shops (
          name, address, city, state, zip, date, phone_number, website, animal_friendly, price
        )
      VALUES (
        $1, $2, $3, $4, $5, current_timestamp, $6, $7, $8, $9
      )
      RETURNING
        shop_id;
      `;

    const store1 = await db.query(sqlQuery1, [name, address, city, state, zip, phone_number, website, animal_friendly, price]);

    if (store1.stack) {
      res.status(500).send(store1.stack);
    }

    if (req.files) {
      for (let i = 0; i < req.files.length; i += 1) {
        const shopId = store1.rows[0].shop_id;
        const saveToS3 = await uploadFile(req.files[i]);
        const sqlQuery2 = `INSERT INTO shops_photos (shop_id, url) VALUES (${shopId}, '${saveToS3.Location}');`;
        await db.query(sqlQuery2);
        fs.unlink(req.files[i].path, ((err) => {
          if (err) res.status(300).send(err);
          else if (i === req.files.length - 1) {
            res.send(store1);
          }
        }));
      }
    }
    res.status(201).send(store1);
  } else {
    res.sendStatus(400);
  }
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
  const price = req.body.price || [1, 2, 3, 4, 5];
  const priceString = price.join(',');
  const rating = req.body.rating || [1, 2, 3, 4, 5];
  const ratingString = rating.join(',');
  const animal_friendly = req.body.animal_friendly || [true, false];
  const animal_friendly_string = animal_friendly.join(',');

  const sql = `
    SELECT
      *
    FROM
      (SELECT s.*,
        (SELECT
          ROUND(AVG(r.rating))
        FROM
          reviews r
        WHERE
          r.shop_id = s.shop_id
      ) AS average
      FROM
        shops s) AS rs
    WHERE
      rs.average = ANY(ARRAY[${ratingString}])
      AND rs.price = ANY(ARRAY[${priceString}])
      AND rs.animal_friendly = ANY(ARRAY[${animal_friendly_string}])
  ;`;

  Shops.filterShops(sql)
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
