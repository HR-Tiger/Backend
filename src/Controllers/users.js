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

module.exports = {
  getUser,
  getUserProfileInfo,
};
