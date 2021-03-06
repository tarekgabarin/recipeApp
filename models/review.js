const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

let Schema = mongoose.Schema;

let reviewSchema = new Schema({


    rating: {
        type: Number,
        min: 1,
        max: 5,
        defualt: 0
    },

    /* here is how the overall score is calculated:

     let total = (this.howEasyToMake + this.howGoodTaste + wouldMakeAgain) / 3





     */

    howEasyToMake: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    howGoodTaste: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    wouldMakeAgain: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },


    comment: {
        type: String,
        default: ""
    },


    postedBy: {
        type: String,
        required: true,
        index: true
    },

    reviewOf: {
        type: String,
        required: true,
        index: true
    }

});

let Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

