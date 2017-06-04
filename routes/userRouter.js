const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


router = express.Router();

router.get('/', (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) throw err;
        res.json(users);
    })
});

router.get('/:username', (req, res, next) => {
    let nameQuery = {username: req.params.username};

    User.findOne(nameQuery, (err, users) =>{
        if (err) throw err;
        res.json(users);

    })
});

router.post('/register', function(req, res, next){

    User.create({
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        email: req.body.email,
        profilePic: req.body.profilePic
    }, (err, user) => {
        if (err) throw err;

        // if you get an error just remove it

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(user.password, salt, function(err, hash){
                if (err) throw err;
                user.password = hash;
                user.save();
            })
        });


        res.json(user);
    });

});

/*

 module.exports.getUserById = (id, callback) => {
 User.findOne(id, callback);
 };

 */



router.delete('/deleteuser/:username', (req, res) => {

    let nameQuery = {username: req.params.username};

    User.findOneAndRemove(nameQuery, (err, user) => {
        if (err) throw err;

        res.send('The user ' + user + 'was succesfully deleted!');
    });

});

module.exports = router;
