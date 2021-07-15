const Promise = require('bluebird');

const db = require('../config/db');

const getUser = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `
    SELECT
      json_agg(to_jsonb(u) #- '{password}')
    FROM
      users u
    WHERE user_id = $1;
  `;
    db.query(sqlQuery, [id], (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.rows[0]['json_agg'][0]);
      }
    });
  });
}

const createUserSqlQuery = `
  INSERT INTO
    users (
      email,
      username,
      password,
      salt,
      first_name,
      last_name
    )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
  );
`;

const checkEmailOrUsernameSqlQuery = `
  SELECT
    *
  FROM
    users
  WHERE
    username = $1 OR email = $2;
`;

const findOneByIdSQLQuery = `
  SELECT
    json_agg(json_build_object('user_id', u.user_id))
  FROM
    users u
  WHERE
    user_id = $1
;
`;

const createUser = (
  email,
  username,
  hash,
  salt,
  firstName,
  lastName,
) => new Promise((resolve, reject) => {
  db.query(createUserSqlQuery,
    [
      email,
      username,
      hash,
      salt,
      firstName,
      lastName,
    ], (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
});

const checkEmailOrUsername = (values) => new Promise((resolve, reject) => {
  db.query(checkEmailOrUsernameSqlQuery, values, (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

const findOne = (username) => new Promise((resolve, reject) => {
  db.query(`
      SELECT
        *
      FROM
        users
      WHERE
        username = $1
      ;
    `, [username], (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data.rows[0]);
  });
});

const findOneById = (id) => new Promise((resolve, reject) => {
  db.query(findOneByIdSQLQuery, [id], (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data.rows[0]['json_agg'][0]);
  });
});

const userProfileInfo = (id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT json_agg(to_jsonb(u) #- '{salt}' #- '{password}') FROM users u WHERE user_id = $1;`, [id], (error, data) => {
      if(error) {
        reject(error);
      }
      resolve(data.rows[0]['json_agg'][0]);
    });
  });
};

module.exports = {
  createUser,
  checkEmailOrUsername,
  findOne,
  findOneById,
  userProfileInfo,
  getUser,
};
