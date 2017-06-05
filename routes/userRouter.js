const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const verification = require('verification');

let router = express.Router();

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

/// test this out

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) return next(err);

        if(!user){
            return res.json(403, {
                message: info
            })
        }
    });

    req.logIn(user, (err) => {
        if (err) return next(err);

        return res.json({
            message: 'user authenticated!'
        });
    });

    // let token = verification.getToken(user);

    res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
    });

});

router.get('/logout', (req, res) => {
    req.logout();
    res.status(200).json({
        status: 'logging'
    })
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
