'use strict';

const { bookshelf } = require('../db/database');
const Post = require('../models/postMd');
const PostTags = require('../models/postTagMd')

module.exports.getAllPosts = (req, res, next) => {
  Post.getAll()
  .then( posts => res.status(200).json(posts) )
  .catch( error => next(error))
};

module.exports.getOnePost = ({ params: {id} }, res, next) => {
  Post.getOne(id)
  .then( post => res.status(200).json(post))
  .catch( error => next(error))
};

module.exports.getAllByUser = ({ params: {user_id} }, res, next) => {
  Post.getAllUsersPosts(user_id)
  .then( usersPosts => res.status(200).json(usersPosts))
  .catch( error => next(error))
};
module.exports.getAllPositives = ({ params: {positive} }, res, next) => {
  Post.getAllPositives(positive)
  .then( positives => res.status(200).json(positives))
  .catch( error => next(error))
};

module.exports.getAllZones = ({ params: {zone} }, res, next) => {
  Post.getZones(zone)
  .then( zones => res.status(200).json(zones))
  .catch( error => next(error))
};

module.exports.getAllByZipcode = ({ params: {zipcode} }, res, next) => {
  Post.getAllZips(zipcode)
  .then( zipcodes => res.status(200).json(zipcodes))
  .catch( error => next(error))
};


module.exports.createPost = ({ body }, res, next) => {
  console.log('posted body', body);
  const zipcodes = require('../db/seeds/zipcodes')

  // deconstructs requst body with items from post table shema
  let deconstructedPost = {
    "user_id": body.user_id,
    "positive": body.positive,
    "comment": body.comment,
    "image": body.image,
    "latitude": body.latitude,
    "longitude": body.longitude,
    "timestamp": body.timestamp,
  };

  // cleans array of commas from raw address
  let getRidofCommas = body.formattedAddress.replace(/[, ]+/g, " ").trim().split(' ');
  console.log('GETRIDOFCOMMAS', getRidofCommas);
  // compares every zipcode to the new array
  zipcodes.map(i => {
    getRidofCommas.forEach(e => {
      if (e === i.zipcode) {
        console.log("INDSIDE IF", i.zipcode);
        deconstructedPost.zipcode = i.zipcode;
        deconstructedPost.area_name = i.area_name;
        deconstructedPost.zone = i.zone;
        return
      }

    })
  })

  // deconstructs tag ids from req body to make row insertinos for pivot table
  const tagIDs = body.tag_ids;
  console.log("TAG IDS : ", tagIDs);

  console.log("DECSTR POST : ", deconstructedPost);

  // sends deconstructed obj to be posted to post tables
  Post.createPost(deconstructedPost)
  .then( post => {
    res.status(201).json(post);
    // defines empty array to hold object rows for pivot table
    let postTagRow = [];
    // creates object for each row insertion
    // pushed each tag id as a value along with the post id that we get back from the promise
    tagIDs.forEach( tagId => {
      postTagRow.push({"post_id": post.id, "tag_id": tagId})
    })
    // calls bookshelf method to save our collection to the pivot table
    PostTags.createPostTagRows(postTagRow)
    .then( rows => rows )
    .catch( err => err )
  })
  .catch( error => next(error))
};

module.exports.removePost = ({ params: {id} }, res, next) => {
  Post.deleteOne(id)
  .then( post => res.status(202).json(post))
  .catch( error => next(error))
};

module.exports.editPost = ({ body }, res, next) => {
  const id = body.id
  Post.updatePost(id, body)
  .then( post => res.status(200).json(post))
  .catch( error => next(error))
};
