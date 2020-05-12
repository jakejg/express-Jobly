const Company = require('../models/companies');
const Job = require('../models/jobs')
const express = require('express');
const router = new express.Router();
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const db = require('../db');
const { validateCreateJobJson, validateUpdateCompanyJson } = require('../middleware/jsonValidation');


// Route to get all jobs
router.get('/', async (req, res, next) => {
    try{
        let jobs;

        if (Object.keys(req.query).length !== 0){
            
            jobs = await Job.filter(req.query);
        }
        else{
            jobs = await Job.getAll();
        }
      
        return res.json({jobs});
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

// Route to create a new job

router.post('/', validateCreateJobJson,  async (req, res, next) => {
    try{
        
        const job = Job.create(req.body);
    
        await job.save();
        return res.status(201).json({job});
    }
    catch(e){
        next(e);
    }
});

//Route to update a company, will just return the company if no data is passed in body

router.patch('/:handle', validateUpdateCompanyJson, async (req, res, next) => {
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