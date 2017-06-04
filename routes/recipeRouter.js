const express = require('express');
const passport = require('passport');
const Recipe = require('../models/recipe');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


router = express.Router();

router.get('/', (req, res) => {
  res.json('Here are the recipes!')
});

// Is working

router.get('/showrecipes', (req, res) => {
  Recipe.find({}, (err, recipes) => {
    if (err) throw err;
    res.json(recipes);
  });
});

// Is working.

router.get("/showrecipes/:recipename", (req, res) => {
    let nameQuery = {name: req.params.recipename};

    Recipe.findOne(nameQuery, (err, recipes) => {
        if (err) throw err;

        res.json(recipes);
    })
});

// I got it to work, the url should have been more specific

router.get('/showrecipes/category/:categoryname', (req, res) => {

    let nameQuery = {category: req.params.categoryname};

    Recipe.find(nameQuery, (err, recipes) => {
        if (err) throw err;

        res.json(recipes);
    });
});

/*

 module.exports.getRecipesByCategory = (category, callback) => {
 Recipe.find({'category': category});
 };

 use this to test it

 {
 "name": "animal",
 "description": "delicious",
 "steps": "kill animal then eat it",
 "ingredients": ["animal", "killing weapon"],
 "category": "breakfast"

 }



 */

// Now it's working, good stuff.

router.post('/addrecipe', (req, res) => {
  Recipe.create({
      name: req.body.name,
      description: req.body.description,
      steps: req.body.steps,
      ingredients: req.body.ingredients,
      category: req.body.category
  }, (err, recipes) => {
    if (err) throw err;

    // Recipe.save();

    res.json(recipes);
  });
});

// See if this works

router.put('editrecipe/:recipename/:editedField', (req, res) => {

    Recipe.findOneAndUpdate({name: req.params.recipename}, {$set: req.body}, {new: true}, (err, recipes) => {
        if (err) throw err;

        res.json(recipes)

    });
});

// It's working, thank god

router.delete('/deleterecipe/:recipename', (req, res) => {

    let nameQuery = {name: req.params.recipename};

    Recipe.findOneAndRemove(nameQuery, (err, recipe) => {
        if (err) throw err;

        res.send('Dish was succesfully deleted!')
    });

});

router.get('/showrecipes/byuser/:username', (req, res) => {

    let query = {postedBy: req.params.username}

    Recipe.find(query, (err, recipes) => {
        if (err) throw err;
        res.json(recipes)
    })
});



/*

router.post('/:dishid/addcomment', function(req, res, next){
  let newComment = new Comment({
    rating: req.body.rating,
    comment: req.body.comment,
    postedBy: postedBy,
    date: Date.now()
  });

});

*/

module.exports = router;
