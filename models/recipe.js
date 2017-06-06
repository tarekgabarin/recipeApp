const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');

let Schema = mongoose.Schema;

let commentSchema = Schema({

  rating: {
    type: Number,
    // required: true,
    min: 1,
    max: 5,
  },

  recipeItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
  },

  comment: {
    type: String,
     // required: true
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  likedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

 favouredBy: {
    type: mongoose.Schema.Types.ObjectId
 }
});

let Comment = mongoose.model('Comment', commentSchema);

let recipeSchema = Schema({

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
  },

  steps: {
    type: String,
    required: true,
  },

  ingredients: {
    type: Array,
    required: true
  },

  comments: [commentSchema],

  category: {
    type: String,
    required: true,
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

});

/// So I learnt that by defining the string as "Recipe" in the model function, I will have to lower case it
/// and pluralize it when I use it with res.json and other such things (i.e. "Recipe" => recipes).

let Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
module.exports = Comment;

/// refactor this so that these are in the router, not in the models file

/*

module.exports.getRecipeByName = (name, callback) => {
  let nameQuery = {name: name};
  Recipe.findOne(nameQuery, callback);
};

module.exports.getRecipesByCategory = (category, callback) => {
  Recipe.find({'category': category});
};

*/
