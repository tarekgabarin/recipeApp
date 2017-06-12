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

        if (err) console.log(err);

        res.json(recipes);
    });
});

// Add Recipe, It works YAY!!!

router.post('/addrecipe', (req, res) => {


    Recipe.create({
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
        category: req.body.category,
        postedBy: req.body.postedBy
    }).then((e, recipe) => {
        if (e) console.log(e);

        res.json(recipe);

        }
    );

});

// Get the recipes posted by a particular user

// it works yay, test it one more time with more than one user tho

router.get('/:postedBy', (req, res) => {

    let query = {postedBy: req.params.postedBy};

    Recipe.find(query, (err, recipes) => {
        if (err) console.log(err);

        res.json(recipes)
    })
});

/// Get a recipe by it's _id

// It works yay!!

router.get('/handleRecipes/:recipeId', (req, res) => {

    let query = {_id: req.params.recipeId};

    Recipe.find(query, (err, recipe) => {
        if (err) console.log(err);

        res.json(recipe);
    })

});

// delete a recipe by it's _id

// it worked it deleted it


router.delete("/handleRecipes/:recipeId", (req, res) => {

    let query = {_id: req.params.recipeId};

    Recipe.findByIdAndRemove(query, (err) => {
        if (err) console.log(err);
    });

    Review.find({reviewOf: req.params.recipeId}).remove();

    Review.save().then((doc) => {
            res.send(doc)
        }, (e) => {
            res.status(400).send(e);
        }
    );

});

// edit the recipe with the _id attached to it

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
        {returnOriginal: false}, (err, recipe) => {

            if (err) console.log(err);

            res.json(recipe);
        });

    Recipe.save().then((doc) => {
            res.send(doc)
        }, (e) => {
            res.status(400).send(e);
        }
    );


});

// add a review to the dish with the _id of the user and the _id of the recipe he is reviewing.


router.post('/:userid/:recipeId/addreview', (req, res) => {

    let alreadyReviewed = false;

    Review.find({postedBy: req.params.userid, reviewOf: req.params.recipeId}, (err, review) => {
        if (err) console.log(err);

        if (review) {
            alreadyReviewed = true;
        }

    });

    if (!alreadyReviewed) {

        let overallRating = (req.body.howGoodTaste + req.body.wouldMakeAgain + req.body.howEasyToMake)  / 3;

        Review.create({
            howEasyToMake: req.body.howEasyToMake,
            wouldMakeAgain: req.body.wouldMakeAgain,
            howGoodTaste: req.body.howGoodTaste,
            rating: overallRating,
            postedBy: req.params.userid,
            reviewOf: req.params.recipeId,
        });



        Review.save().then((doc) => {
                res.send(doc)
            }, (e) => {
                res.status(400).send(e);
            }
        );

    }

});

/// edit the review score


router.put('/:userid/:recipeId/editScore', (req, res) => {

    let alreadyGaveScore = false;

    Review.find({postedBy: req.params.userid, reviewOf: req.params.recipeId}, (err, review) => {
        if (err) console.log(err);

        if (review) {
            alreadyGaveScore = true;
        }

    });

    if (alreadyGaveScore){

        let overallRating = (req.body.howGoodTaste + req.body.wouldMakeAgain + req.body.howEasyToMake)  / 3;

        Review.update({postedBy: req.params.postedBy, reviewOf: req.params.recipeId},
            {$set: {
                howEasyToMake: req.body.howEasyToMake,
                wouldMakeAgain: req.body.wouldMakeAgain,
                howGoodTaste: req.body.howGoodTaste,
                rating: overallRating
            }});

        Review.save().then(

            (doc) => {
                res.send(doc);
            },

            (e) => {
                res.status(400).send(e);
            }
        );

    }


});

/// add a commentary for your recipe review, and I think you could also use this for editing a comment as well

router.put('/:userid/:recipeId/addComment', (req, res) => {

    let alreadyGaveScore = false;

    Review.find({postedBy: req.params.userid, reviewOf: req.params.recipeId}, (err, review) => {
        if (err) console.log(err);

        if (review) {
            alreadyGaveScore = true;
        }

    });

    if (alreadyGaveScore){

        Review.update({postedBy: req.params.postedBy, reviewOf: req.params.recipeId},
            {$set: {
                comment: req.body.comment
            }});

        Review.save().then(

            (doc) => {
                res.send(doc);
            },

            (e) => {
                res.status(400).send(e);
            }
        );
    }

});




/// show the reviews belonging to a certain user

router.get('/:userid/showUsersReviews', (req, res) => {

    let query = {postedBy: req.params.userid};

    Review.find(query, (err, reviews) => {
        if (err) console.log(err);

        res.json(reviews);

    })

});

/// show the reviews of a particular recipe

router.get('/:recipeId/showReviewsForRecipe', (req, res) => {

    let query = {reviewOf: req.params.recipeId};


    Review.find(query, (err, reviews) => {
        if (err) console.log(err);

        res.json(reviews);
    });


});


/// delete a review based on the _id of the user who psoted it and the recipe being reviewed

router.delete('/:userid/:recipeId/deleteReview', (req, res) => {

    Review.findOneAndRemove({postedBy: req.params.userid, reviewOf: req.params.recipeId});

    Review.save().then(
        (doc) => {
            res.send(doc);

        },
        (e) => {
            res.satus(400).send(e);
        });
});


module.exports = router;