'use strict';

const { bookshelf } = require('../db/database');
const User = require('../models/userMd');

module.exports.getAllUsers = (req, res, next) => {
  User.getAll()
  .then( users => res.status(200).json(users))
  .catch( error => next(error))
}