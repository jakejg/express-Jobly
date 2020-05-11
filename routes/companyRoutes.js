const Company = require('../models/companies');
const express = require('express');
const router = new express.Router();

// Route to get all companies
router.get('/', async (req, res, next) => {
    try{
        let companies;

        if (Object.keys(req.query).length !== 0){
            companies = await Company.filter(req.query);
        }
        else{
            companies = await Company.getAll();
        }
      
        return res.json({companies});
    }
    catch(e){
        next(e)
    }
})

// Route to get a company by handle
router.get('/:handle', async (req, res, next) => {
    try{
        const company = await Company.get(req.params.handle);
        
        return res.json({company});
    }
    catch(e){
        next(e);
    }
});

// Route to create a new company
router.post('/', async (req, res, next) => {
    try{
        const company = Company.create(req.body);
        await company.save();
        return res.json({company});
    }
    catch(e){
        next(e);
    }
});

module.exports = router;