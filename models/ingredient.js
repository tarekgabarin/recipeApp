const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

let Schema = mongoose.Schema;

let ingredientSchema = Schema({

        name: {
            type: String,
            required: true,
            unique: true
        },

        price: {
            type: Currency,
            defualt: 0.00
        },

        category: {
            type: String,
            required: true
        }

    }
);

let Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;

