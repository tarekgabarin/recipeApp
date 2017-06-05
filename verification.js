const User = require('./models/user');
const jwt = require('jsonwebtoken');
const config = require('./config.js');

// test this out



exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey);
};

exports.checkIfUserExists = (req, res, next) => {

    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    let verifyUser = (token) => {

        let key = config.secretKey;

        jwt.verify(token, key, (err, decoded) => {

            if (!err) {

                req.decoded = decoded;
                next();

            } else {
                let err = new Error('Token is not authenticated');
                err.status = 401;
                return next(err);
            }
        })
    };

    if (!token){
        let err = new Error('No token was provided');
        err.status = 403;
        return next(err)
    }
    else {
        verifyUser(token);
    }

};

