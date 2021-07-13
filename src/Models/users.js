const Promise = require('bluebird');

const db = require('../config/db');

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
      SELECT *
      FROM
        users
      WHERE
        username = $1
      ;
    `, [username], (err, data) => {
    if (err) {
      reject(err);
    }
    // console.log(data.rows);
    resolve(data.rows[0]);
  });
});

module.exports = {
  createUser,
  checkEmailOrUsername,
  findOne,
};