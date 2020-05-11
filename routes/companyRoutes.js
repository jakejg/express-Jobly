const Company = require('../models/companies');
const express = require('express');
const router = new express.Router();
const sqlForPartialUpdate = require('../helpers/partialUpdate')
const db = require('../db')

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
        return res.status(201).json({company});
    }
    catch(e){
        next(e);
    }
});

//Route to update a company

router.patch('/:handle', async (req, res, next) => {
    try{
        const company = await Company.get(req.params.handle);

        const items = {
            name: req.body.name || company.name,
            num_employees: req.body.num_employees || company.num_employees,
            description: req.body.description || company.description,
            logo_url: req.body.logo_url || company.logo_url
        }
        const queryObject = sqlForPartialUpdate('companies', items, "handle", req.params.handle)
       
        const results = await db.query(queryObject.query, queryObject.values)
        
        return res.json({company: results.rows[0]});
    }
    catch(e){
        next(e);
    }
});

// Route to delete a company

router.delete('/:handle', async (req, res, next) => {
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