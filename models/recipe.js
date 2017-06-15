const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;


let Schema = mongoose.Schema;

let recipeSchema = new Schema({

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

  ingredients: [],

  category: {
    type: String,
    required: true,
  },

  postedBy: {
    type: String,
    required: true,
    index: true
  },

  /// Line below may not work

  /// postedBy: {type: Schema.Types.ObjectId, ref: 'User'},

  numberOfRatings: {
    type: Number,
    default: 0
  },

  totalAddedRatings: {
      type: Number,
      default: 0
  },

  reviewAverage: {
      type: Number,
      default: undefined
  }

  /// Maybe have the function that calculates the mean score here? Need to be check if mongoose is okay with functions in
    // in a Schema

  //// add the total added ratings, number of ratings, and the function

});


/// So I learnt that by defining the string as "Recipe" in the model function, I will have to lower case it
/// and pluralize it when I use it with res.json and other such things (i.e. "Recipe" => recipes).

let Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;



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
