const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

let Schema = mongoose.Schema;


let User = Schema({

  name: {
    type: String
  },

  // The passport plugin already inputs username and password into our Schema

  username: {
    type: String,
    unique: true,
    required: true
  },

   password: {
   type: String,
   required: true,
   },



  profilePic: {
    type: String
  },

  email: {
    type: String,
    unique: true,
    required: true
  },



  admin: {
    type: Boolean,
      defualt: false
  },

  usersRecipes: [{type: Schema.Types.ObjectId, ref:'Recipe'}],

  userComments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],

  usersFavouriteRecipes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],

  usersLikedRecipes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}]



});



let options = ({missingPasswordError: "Incorrect password, try again"});

User.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', User);
