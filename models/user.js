const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const validator = require('validator');
const uuidV4 = require('uuid/v4');
const {reviewSchema} = require('../models/review');

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
        minlength: 6
    },

    userId: {
        type: String,
        default: "Empty"
    },

    tokens: [{

        access: {
            type: String,
            required: true
        },

        token: {
            type: String,
            required: true
        }

    }],

    profilePic: {
        type: String,
    },

    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },

            message: `{value} is not a valid email address.`
        }
    },

    admin: {
        type: Boolean,
        defualt: false
    },

    usersRecipes: [],

    //usersRecipes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],

   /// usersReviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],

    usersFavouriteRecipes: {
        type: Array
    },

    usersLikedRecipes: {
        type: Array
    },

    chefKarma: {
        type: Number,
        default: 0
    }


});


let options = ({missingPasswordError: "Incorrect password, try again"});

User.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', User);
