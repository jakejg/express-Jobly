
const ExpressError = require('../helpers/expressError');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

function authorize(req, res, next) {
    try{
        const payload = jwt.verify(req.body._token, SECRET_KEY);
        req.user = payload;
        return next();
    }
    catch(e){
        next();
    }
}

module.exports = {
    authorize
}