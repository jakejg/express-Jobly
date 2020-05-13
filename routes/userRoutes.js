
const User = require('../models/users')
const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const db = require('../db');
const { validateCreateUserJson, validateUpdateUserJson } = require('../middleware/jsonValidation');


// Route to get all users

router.get('/', async (req, res, next) => {
    try{
        users = await User.getAll();
      
        return res.json({users});
    }
    catch(e){
        next(e)
    }
})

// Route to get a user by username
router.get('/:username', async (req, res, next) => {
    try{
        const username = await User.get(req.params.username);
        
        return res.json({username});
    }
    catch(e){
        next(e);
    }
});

// Route to create a new user from this json
// {
// 	"username": "test6",
// 	"password": "pwd",
// 	"first_name": "jake",
// 	"last_name": "sherri",
// 	"email": "jd@jkkhj.com"
//  "photo_url": "http://photo.com"
// }

router.post('/', validateCreateUserJson, async (req, res, next) => {
    try{
        
        const user = await User.create(req.body);
    
        await user.save();
        return res.status(201).json({user});
    }
    catch(e){
        next(e);
    }
});

//Route to update a job, will just return the company if no data is passed in body

router.patch('/:username', validateUpdateUserJson, async (req, res, next) => {
    try{
        const user = await User.get(req.params.username);
 
        const items = {
            password: req.body.password || user.password,
            first_name: req.body.first_name || user.first_name,
            last_name: req.body.last_name || user.last_name,
            email: req.body.email || user.email,
            photo_url: req.body.photo_url || user.photo_url,
            is_admin: req.body.is_admin || user.is_admin,
            
        }
        const queryObject = sqlForPartialUpdate('users', items, "username", req.params.username)
        
        const results = await db.query(queryObject.query, queryObject.values)
        
        return res.json({user: results.rows[0]});
    }
    catch(e){
        
        next(e)
    }
});

// Route to delete a user

router.delete('/:username', async (req, res, next) => {
    try{
        const user = await User.get(req.params.username);
       
        await user.delete()
        
        return res.json({message: "User deleted"});
    }
    catch(e){
        next(e);
    }
});

module.exports = router;