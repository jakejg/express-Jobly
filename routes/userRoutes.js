
const User = require('../models/users')
const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const { validateCreateUserJson, validateUpdateUserJson } = require('../middleware/jsonValidation');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { checkUsername } = require('../middleware/auth')


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
        const user = await User.get(req.params.username);
        delete user.password
        
        return res.json({user});
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
        const payload = {
            username: user.username,
            is_admin: user.is_admin
        }
        const _token = jwt.sign(payload, SECRET_KEY)  
        return res.json({_token})
    }
    catch(e){
        next(e);
    }
});

//Route to update a user, will just return the company if no data is passed in body

router.patch('/:username', validateUpdateUserJson, checkUsername, async (req, res, next) => {
    try{
       
        const user = await User.get(req.params.username);

        const { password, first_name, last_name, email, photo_url, is_admin } = req.body

        await user.update(password, first_name, last_name, email, photo_url, is_admin)
        delete user.jobs

 
        return res.json({user});
    }
    catch(e){
        
        next(e)
    }
});

// Route to delete a user

router.delete('/:username', checkUsername, async (req, res, next) => {
    try{
        const user = await User.get(req.params.username);
       
        await user.delete()
        
        return res.json({message: "User deleted"});
    }
    catch(e){
        next(e);
    }
});

// Route to login a user
router.post('/login', async (req, res, next) => {
    try{
        const { username, password } = req.body
       
        const auth = await User.authenticate(username, password)
        if (auth) {
            const user = await User.get(username)

            const payload = {
                username: user.username,
                is_admin: user.is_admin
            }
            const _token = jwt.sign(payload, SECRET_KEY)  
            return res.json({_token})
        }
        else{
            throw new ExpressError("Password/username does not match", 400)
        }  
    }
    catch(e){
        next(e)
    }      
});
module.exports = router;