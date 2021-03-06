'use strict';

const { knex } = require('../database');

const user = require('./user');

const userPromise = user.map( ({ user_name, email, password }) => {
  return knex('user').insert({ user_name, email, password });
});


exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user').del()
    .then(() => {
      return Promise.all(userPromise)
    });
};
