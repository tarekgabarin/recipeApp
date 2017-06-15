const express = require('express');
const passport = require('passport');
const Recipe = require('../models/recipe');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const verification = require('../verification');
const Review = require('../models/review');
const mongodb = require('mongodb');
const User = require('../models/user');
const config = require('../config');
// const User = require('../models/user');
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

            if (err) res.status(400).send(err);

            res.send(doc);
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


// Almost works, need the flowing commands after (if overallRating > 3 to work)

// now I should add what happens to the chefs karma


router.put('/:userid/:recipeId/', (req, res) => {

    let alreadyUpvoted = null;

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

        if (err) res.status(400).send(err);

    });

    /// New content, test this out.

    let checkIfUserReviewed = (userid, recipeId) => {

        return Review

            .findOne({postedBy: userid, reviewOf: recipeId})

            .then((doc) => {
                console.log(doc);

                if (doc) {
                    alreadyUpvoted = true;
                    console.log('user has already submitted a review, alreadyUpvoted is ' + alreadyUpvoted);
                }
                else {
                    alreadyUpvoted = false;
                    console.log("user has not submitted a review yet, alreadyUpvoted is " + alreadyUpvoted);
                }
            })
            .catch((err) => {
            console.log(err);
            })
    };


    checkIfUserReviewed(req.params.userid, req.params.reviewOf);

    // to improve modularity, all the function declarations should be here and them being called will be in the if statements

    let getRecipeMaker = (recipeId) => {

        return Recipe

            .findOne({_id: recipeId})
            .then((recipe) => {
                /// So far this is good, this console.log is printing out the field value I want
                console.log('What is being returned is ' + recipe.postedBy);
                return recipe.postedBy;
            })
            .catch((err) => {
                console.log(err)
            });
    };


    let getReviewer = (userid) => {

        return User

            .findOne({_id: userid})
            .then((user) => {
                return user._id
            })

            .catch((err) => {
                console.log(err);
            });
    };

    if (overallRating > 3 && !alreadyUpvoted) {

        alreadyUpvoted = true;

        /// Here I make my function that returns the postedBy field value in question

        /*

           /// Moved this to above to improve modularity. If everything goes wrong, just revert back to the changes

        let getRecipeMaker = (recipeId) => {

           return Recipe

               .findOne({_id: recipeId})
               .then((recipe) => {
                    /// So far this is good, this console.log is printing out the field value I want
                    console.log('What is being returned is ' + recipe.postedBy);
                   return recipe.postedBy;
               })
               .catch((err) => {
                    console.log(err)
               });
        };

        */


        let value_ = getRecipeMaker(req.params.recipeId)
            .then((chef) => {

                console.log('chef is ' + chef);
                return chef;

            });

        /// Here I am updating the karma of the user who made the recipe if the other person gives it a 4 or 5

        //// this works


        value_.then((chef) => {
            console.log(chef);
            User.update({_id: chef}, {
                $inc: {
                    chefKarma: 1
                }},
                (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
                });
        });

        /*

        let getReviewer = (userid) => {

            return User

                .findOne({_id: userid})
                .then((user) => {
                    return user._id
                })

                .catch((err) => {
                    console.log(err);
                });
        };

        */

        let upVoterId = getReviewer(req.params.userid)
            .then((voter) => {

                console.log("voter id is " + voter);
                return voter
        });

        upVoterId.then((user) => {
            User.update({_id: user}, {$addToSet: {usersFavouriteRecipes: req.params.recipeId}}, (err, doc) => {

                if (err) console.log(err);
                console.log(doc);
            });
        })
    }

    if (overallRating < 3) {


        let value_ = getRecipeMaker(req.params.recipeId)
            .then((chef) => {

                console.log('chef is ' + chef);
                return chef;

            });

        value_.then((chef) => {
            console.log(chef);
            User.update({_id: chef}, {
                    $inc: {
                        chefKarma: -1
                    }
                },
                (err, doc) => {
                    if (err) console.log(err);
                    console.log(doc);
                });
        });
    }

     if (overallRating < 3 && alreadyUpvoted) {

            let upVoterId = getReviewer(req.params.userid)
                .then((voter) => {

                    console.log("voter id is " + voter);
                    return voter
                });


            upVoterId.then((user) => {
                User.update({_id: user}, {$pull: {usersFavouriteRecipes: req.params.recipeId}}, (err, doc) => {

                    if (err) console.log(err);
                    console.log(doc);
                });
            })

    }



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