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

    Recipe.findOne(query, (err, recipe) => {
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

    /// This one seems to be the right delete function, because it's searching through all the records

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



// This should be the callback


/// part One, defining all the functions

    let votingRecord = {
        alreadyVoted: undefined,
        alreadyDownvoted: undefined,
        alreadyUpvoted: undefined,
        ranProcess: false
    };

    let reviewScore = (Number(req.body.howGoodTaste) + Number(req.body.wouldMakeAgain) + Number(req.body.howEasyToMake)) / 3;


    let writeReview  = (howEasyToMake, howGoodTaste, wouldMakeAgain, postedBy, reviewOf, comment = '') => {

        let overallRating = (Number(howGoodTaste) + Number(wouldMakeAgain) + Number(howEasyToMake))  / 3;

        Review.update({postedBy: req.params.userid, reviewOf: req.params.recipeId}, {$set: {
            howEasyToMake: howEasyToMake,
            wouldMakeAgain: wouldMakeAgain,
            howGoodTaste: howGoodTaste,
            rating: overallRating,
            postedBy: req.params.userid,
            reviewOf: reviewOf,
            comment: comment
        }},{upsert: true, setDefaultsOnInsert: true}, (err, doc) => {

            if (err) res.status(400).send(err);

            console.log('doc is...' + doc + ' and review submitted to collection')

        });
    };



    let alreadyVotedPromise = (userid, recipeId) => {

        return new Promise((resolve, reject) => {

            if (typeof(getReview(userid, recipeId)) === "string" || getReview(userid, recipeId) === null){
                resolve(getReview(userid, recipeId));
            }
            else {
                reject('alreadyVotedPromise is getting an undefined...not working')
            }


        })

    };




//// this sucks redo it

/// I will use a callback for this and then see if it works

    /*

    */

    /// let's update this in light of the new getReview that returns either a null or a string based on the reviews existence

    /// updated accordingly to note right above.

    /*


     This also looks good, will test this, but I need to see if there is a more efficient way of doing getReview

    let updateAlreadyVoted = (value) => {

        console.log('Second step...updating votingRecord.alreadyVoted');

        if (typeof(value) === "string"){
            votingRecord.alreadyVoted = true;
            console.log("Within updateAlreadyVoted, votingRecord.alreadyVoted is" + votingRecord.alreadyVoted);
        }
        else if (value === null) {
            votingRecord.alreadyVoted = false;
            console.log("Within updateAlreadyVoted, votingRecord.alreadyVoted is" + votingRecord.alreadyVoted);
        }
    };

    /*

    this looks good but will test later

    alreadyVotedPromise(req.body.userid, req.body.recipeId).then((value) => {
        updateAlreadyVoted(value);

        //// if the result of updateAlreadyVoted is a string run another function that updates the voting record based on
        /// the overallRating;
    });

    */


    //// This works

    /// rename this to checkReviewStatus

    let getReview = (userid, recipeId) => {


        /// returns a string of the _id of the review if the review exists, returns null if the review does not exist.


        /// if you use arrays, the typeOf will have to be "object", (array are "object" in JS)

        /// if you go with array, arr[0] is the string of the the _id, and arr[1] is a string representing the rating

        console.log('Third step...get the review');

        return Review

            .findOne({postedBy: userid, reviewOf: recipeId})

            .limit(1)

            .then((review) => {

                let notNull = false;

                if (review !== null){
                    // let result = JSON.stringify(review._id);
                    notNull = true;
                    console.log('notNull is....' +  notNull + " which means that there is a review");
                }

                if (notNull){
                    let arr = [];
                    let result = String(review._id);
                    let score = Number(review.rating);
                    ///let arr = [result, score];
                    arr.push(result);
                    arr.push(score);
                    console.log('arr is....' + arr);
                    console.log('typeof of arr is...' + typeof(arr));
                    console.log('Within getReview, typeof of result variable is...' + result);
                    console.log('Within getReview, the variable result is...' + result);
                    console.log('Within arr, arr[0] should be a string. typeof(arr[0]) ----> ' + typeof(arr[0]));
                    console.log('Within arr, arr[1] should be a number. typeof(arr[0]) ----> ' + typeof(arr[1]));
                    console.log('arr[0] is...' + arr[0]);
                    console.log('ar[1] is....' + arr[1]);
                    /// return result; ---> if we go with strings
                    return arr;
                }
                else {
                    console.log('Within getReview, notNull is false, therefore review should be null. review is...' + review);
                    return review;
                }

                // let result = JSON.stringify(review._id);
               /// console.log('Within getReview, typeof of result variable is...' + result);
                // console.log('Within getReview, the variable result is...' + result);
               /// console.log('Within getReview, review._id is...' + review._id);
              ///  console.log('the typeof of review._id is...' + typeof(review._id));
                /// console.log("Within getReview, review.overallRating is..." + review.overallRating);
               //// return [review._id, review.overallRating];
                ///return review._id;
            })

            .catch((err) => {
                console.log(err)
            })

    };

    /// let getReviewScore = ()




   let updateReviewRecord = (score) => {

       console.log('Fourth step...updating review record');

       if (score > 3){
           votingRecord.alreadyUpvoted = true;
           votingRecord.alreadyDownvoted = false;
           console.log('review.overallRating is...' + reviewScore + '  alreadyUpvoted is...' + votingRecord.alreadyVoted + ' alreadyDownvoted is ' + votingRecord.alreadyDownvoted);
           votingRecord.ranProcess = true;
           console.log("Updating process is done, votingRecord.ranProcess is " + votingRecord.ranProcess);

       }

       else if (score < 3){
           votingRecord.alreadyDownvoted = true;
           votingRecord.alreadyUpvoted = false;
           console.log('review.overallRating is...' + reviewScore + '  alreadyUpvoted is...' + votingRecord.alreadyVoted + ' alreadyDownvoted is ' + votingRecord.alreadyDownvoted);
           votingRecord.ranProcess = true;
           console.log("Updating process is done, votingRecord.ranProcess is " + votingRecord.ranProcess);

       }

   };



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

    let firstCheckReview = (userid, recipeId) => {

        return new Promise((reject, resolve) => {

            let gotReview = getReview(userid, recipeId);

            console.log('Within firstCheckReview, gotReview is...' + gotReview);

            gotReview.then((review) => {
                console.log('within gotReview.then, review is ' + review);
            });

         ///   let wasReviewed = undefined;





            /// let didReview = checkIfReviewExists(userid, recipeId);

                /*

                .then((value) => {
                    console.log('Within didReview.then....value is....' + value);
                    updateAlreadyVoted(value);
                    console.log("Within didReview.then....alreadyVoted is now...." + votingRecord.alreadyVoted);

                }
            );

            */

           //// console.log('Within firstCheckReview, the variable didReview is...' + didReview);
           /// updateAlreadyVoted(didReview);
            // console.log('Within firstCheckReview, the variable wasReviewed is...' + wasReviewed);
            /// updateAlreadyVoted();
            console.log('Within firstCheckReview, after updateAlreadyVoted runs, alreadyVoted is...' + votingRecord.alreadyVoted);
            // let gotReview = getReview(userid, recipeId);
            /// console.log('Within firstCheckReview, gotReview is...' + gotReview);
            updateReviewRecord(reviewScore);
            ///gotReview.then((review) => {
            ///    console.log('within gotReview, review is...' + review);
            ///});

            console.log('Within firstCheckReview, after updateReviewRecord, alreadyVoted is' + votingRecord.alreadyVoted);

            console.log('Within firstCheckReview, after updateReviewRecord, alreadyUpvoted is' + votingRecord.alreadyUpvoted);

            console.log('Within firstCheckReview, after updateReviewRecord, alreadyDownvoted is' + votingRecord.alreadyDownvoted);

            console.log('Within firstCheckReview, before entering resolve loop, ranProcess is...' + votingRecord.ranProcess);

            if (votingRecord.ranProcess === true) {
                resolve();
            }
            else {
                reject("function 'firstCheckReview' is not working");
            }
        })
    };



/// Part two, running them asyncrhounsoly


/// Have these outside the then(), so that the code can get this stuff done while it's doing the other stuff



    firstCheckReview(req.params.userid, req.params.recipeId).then( () => {



            console.log('About to enter the first if statement of second process. Status check...');

            console.log("alreadyUpvoted: " + votingRecord.alreadyUpvoted);

            console.log("overallRating: " + String(reviewScore));

            console.log("alreadyVoted: " + votingRecord.alreadyVoted);

            writeReview(req.body.howEasyToMake, req.body.howGoodTaste, req.body.wouldMakeAgain, req.params.userid, req.params.recipeId, req.body.comment);

            let chef_ = getRecipeMaker(req.params.recipeId)
                .then((chef) => {

                    console.log('chef is ' + chef);
                    return chef;

                });

            let voter_ = getReviewer(req.params.userid)
                .then((voter) => {

                    console.log("voter id is " + voter);
                    return voter
                });


            if (!votingRecord.alreadyUpvoted || (reviewScore > 3 && !votingRecord.alreadyVoted)) {


                chef_.then((chef) => {
                    User.update({_id: chef}, {
                            $inc: {
                                chefKarma: 1
                            }
                        },
                        (err, doc) => {
                            if (err) console.log(err);
                            console.log(doc);
                        });
                    console.log("updating chefKarma...." + chef);
                });

                voter_.then((user) => {
                    User.update({_id: user}, {$addToSet: {usersFavouriteRecipes: req.params.recipeId}}, (err, doc) => {

                        if (err) console.log(err);
                        console.log(doc);
                        console.log('updating usersFavouriteRecipes....' + user);
                    });
                })
            }

            console.log('About to enter second if statment of second process. Status check....');

            console.log("alreadyDownvoted: " + votingRecord.alreadyDownvoted);

            console.log("overallRating: " + String(reviewScore));

            console.log("alreadyVoted: " + votingRecord.alreadyVoted);


            if (!votingRecord.alreadyDownvoted || ((reviewScore < 3) && !votingRecord.alreadyVoted)) {

                chef_.then((chef) => {
                    console.log(chef);
                    User.update({_id: chef}, {
                            $inc: {
                                chefKarma: -1
                            }
                        },
                        (err, doc) => {
                            if (err) console.log(err);
                            console.log('updating chefKarma....' + doc);
                        });
                });


            }

            console.log('About to enter third if statment of second process. Status check....');

            console.log("alreadyDownvoted: " + votingRecord.alreadyDownvoted);

            console.log("overallRating: " + String(reviewScore));

            console.log("alreadyVoted: " + votingRecord.alreadyVoted);

            if (reviewScore < 3 && votingRecord.alreadyUpvoted) {


                voter_.then((user) => {

                    console.log('User is ' + user);
                    User.update({_id: user}, {$pull: {usersFavouriteRecipes: req.params.recipeId}}, (err, doc) => {

                        if (err) console.log(err);
                        console.log('updating usersFavouriteRecipes....' + doc);
                    });
                });

            }

        },

        (err) => {

            if (err) {
                console.log("This shit ain't working, bro!");
                console.log(err);
            }

        }



    );


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