const express = require('express');
const passport = require('passport');
const Recipe = require('../models/recipe');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const verification = require('../verification');
const Review = require('../models/review');
const mongodb = require('mongodb');
const config = require('../config');
const User = require('../models/user');
const {MongoClient, ObjectID} = require('mongodb');


// I think I impproved this a lot I should test it to be sure

let router = express.Router();

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({extended: false}));


// get all the recipes in the database

// it works YAY!!

router.get('/', (req, res) => {

    Recipe.find({}, (err, recipes) => {

        if (err) res.send(err);

        res.json(recipes);
    }).lean();
});

// Add Recipe

// test success, don't test again



router.post('/addrecipe', (req, res) => {


    Recipe.create({
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
        category: req.body.category,
        postedBy: req.body.postedBy
    }, (err, recipe) => {
        if (err) console.log(err);

        res.json(recipe);

    });
});



/// Get a recipe by it's _id

// It works yay!!

router.get('/handleRecipes/:recipeId', (req, res) => {

    let query = {_id: req.params.recipeId};

    //// Recipe.createIndex({_id: 1}); all the _id fields are indexed by default.

    Recipe.find(query, (err, recipe) => {
        if (err) console.log(err);

        res.json(recipe);
    }).lean().limit(1);

});

// delete a recipe by it's _id

//  Works like a charm


router.delete("/handleRecipes/:recipeId", (req, res) => {

    let query = {_id: req.params.recipeId};

    Recipe.findByIdAndRemove(query, (err) => {
        if (err) console.log(err);
    });

    /// Review.deleteMany({reviewOf: req.params.recipeId});

    Review.find({reviewOf: req.params.recipeId}).lean().remove();

    Review.save().then((doc) => {
            res.send(doc)
        }, (e) => {
            res.status(400).send(e);
        }
    );

});

// edit the recipe with the _id attached to it

// it works

router.put('/handleRecipes/:recipeId', (req, res) => {

    let query = {_id: req.params.recipeId};

    Recipe.update(query, {
            $set: {
                name: req.body.name,
                description: req.body.description,
                steps: req.body.steps,
                ingredients: req.body.ingredients,
                category: req.body.category
            }
        },
        {returnOriginal: false}, (err, doc) => {

            if (err) res.send(doc);

            res.status(400).send(err);
        });


    /*
    Recipe.save().then((doc) => {
            res.send(doc)
        }, (e) => {
            res.status(400).send(e);
        }
    );

    */


});

// add a review to the dish with the _id of the user and the _id of the recipe he is reviewing.


// Works

// now I should add what happens to the chefs karma


router.put('/:userid/:recipeId/', (req, res) => {

    // let alreadyReviewed = false;

    let overallRating = (Number(req.body.howGoodTaste) + Number(req.body.wouldMakeAgain) + Number(req.body.howEasyToMake))  / 3;


    Review.update({postedBy: req.params.userid, reviewOf: req.params.recipeId}, {$set: {
        howEasyToMake: req.body.howEasyToMake,
        wouldMakeAgain: req.body.wouldMakeAgain,
        howGoodTaste: req.body.howGoodTaste,
        rating: overallRating,
        postedBy: req.params.userid,
        reviewOf: req.params.recipeId,
        comment: req.body.comment
    }},{upsert: true, setDefaultsOnInsert: true}, (err, doc) => {

        if (err) res.send(doc);

        res.status(400).send(err);
    });

    /*

    if (overallRating > 3) {

    }

    */

});



/// show the reviews belonging to a certain user

// It's working

router.get('/:userid/showUsersReviews', (req, res) => {

    let query = {postedBy: req.params.userid};

    Review.find(query, (err, reviews) => {
        if (err) console.log(err);

        res.json(reviews);

    })

});

/// show the reviews of a particular recipe

// It's working

router.get('/:recipeId/showReviewsForRecipe', (req, res) => {

    let query = {reviewOf: req.params.recipeId};


    Review.find(query, (err, reviews) => {
        if (err) console.log(err);

        res.json(reviews);
    });


});


/// delete a review based on the _id of the user who psoted it and the recipe being reviewed

// it works

router.delete('/:userid/:recipeId/deleteReview', (req, res) => {


    Review.remove({postedBy: req.params.userid, reviewOf: req.params.recipeId}, (err, doc) => {
        if (err) res.satus(400).send(err);

        res.send(doc)

    });

});


module.exports = router;