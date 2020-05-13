const Company = require('../models/companies');
const express = require('express');
const router = new express.Router();
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const db = require('../db');
const { validateCreateCompanyJson, validateUpdateCompanyJson } = require('../middleware/jsonValidation');;
const ExpressError = require("../helpers/expressError");
const { checkAdminStatus } = require('../middleware/auth');

// Route to get all companies
router.get('/', async (req, res, next) => {
    try{
        if (!req.user) throw new ExpressError("Unauthorized", 400);

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
        if (!req.user) throw new ExpressError("Unauthorized", 400);

        const company = await Company.get(req.params.handle);
        
        return res.json({company});
    }
    catch(e){
        next(e);
    }
});

// Route to create a new company

router.post('/', validateCreateCompanyJson, checkAdminStatus, async (req, res, next) => {
    try{
        
        const company = Company.create(req.body);
        await company.save();
        return res.status(201).json({company});
    }
    catch(e){
        next(e);
    }
});

//Route to update a company, will just return the company if no data is passed in body

router.patch('/:handle', validateUpdateCompanyJson, checkAdminStatus, async (req, res, next) => {
    try{
        const company = await Company.get(req.params.handle);
        
        const { name, num_employees, description, logo_url } = req.body;
 
       await company.update(name, num_employees, description, logo_url)
        
        return res.json({company});
    }
    catch(e){
        next(e);
    }
});

// Route to delete a company

router.delete('/:handle', checkAdminStatus, async (req, res, next) => {
    try{
        const company = await Company.get(req.params.handle);
        await company.delete()
        
        return res.json({message: "Company deleted"});
    }
    catch(e){
        next(e);
    }
});

module.exports = router;