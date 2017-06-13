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
const uuidV4 = require('uuid/v4');
const bcrypt = require("bcrypt");

let router = express.Router();

router.use(bodyParser.json());


/// Works

router.get('/', (req, res, next) => {

    User.find({}, (err, users) => {
        if (err) throw err;
        res.json(users);
    })
  });

/// create a user and hash his password

/// It works, and it was quick too. The save() stuff is superflous becuase .create() already does that for us,
// but good stuff overall

router.post('/register', function(req, res, next){

    let userid = uuidV4();

    User.create({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
        profilePic: req.body.profilePic,
        userId: userid
    }, (err, user) => {
            if (err) throw err;

            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(user.password, salt, function(err, hash){
                    if (err) throw err;
                    user.password = hash;
                })
            });


        });

    /*

    User.save().then(
        (doc) => {
            res.send(doc);
        },

        (e) => {
            res.status(400).send(e);
        }
    )

    */

});

/// update the users info

// Not working, redo

// retest it

router.put('/:userid/updateUserInfo', (req, res, next) => {

    let userid = req.params.userid;

    let updatedFields = req.body;

    User.findByIdAndUpdate(userid, updatedFields).lean(true).then(

        (doc) => {

            res.send(doc);

        },
        (e) => {
            res.status(400).send(e);
        });

    /*

    I learned today that

    User.findOneAndUpdate(query,
        {$set: {
            profilePic: req.body.profilePic,
            name: req.body.name,
        }},
        {
            returnOriginal: false
        });

    User.save().then(

        (doc) => {

            res.send(doc);

        },
        (e) => {
            res.status(400).send(e);
        });

        */

});

/// delete a user and all of his recipes and reviews based on his _id

router.delete('/:userid/deleteUser', (req, res) => {

    let query = {_id: req.params.userid};

    User.findOneAndRemove(query, (err, user) => {
        if (err) console.log(err);

        User.save().then((doc) => {
            res.send(doc)
        },
            (e) => {
            res.status(400).send(e);
            }
        );


      Recipe.find({postedBy: req.params.userid}).remove();

      Recipe.save().then(
          (doc) => {
              res.send(doc);
          },

          (e) => {
              res.status(400).send(e);
          }
      );

      Review.find({postedBy: req.params.userid}).remove();

        Review.save().then(
            (doc) => {
                res.send(doc);
            },

            (e) => {
                res.status(400).send(e);
            }
        );




        res.send('The user ' + user + 'was succesfully deleted!');
    });



});

module.exports = router;
