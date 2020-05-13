const Company = require('../models/companies');
const Job = require('../models/jobs')
const express = require('express');
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const db = require('../db');
const { validateCreateJobJson, validateUpdateJobJson } = require('../middleware/jsonValidation');
const { checkAdminStatus } = require('../middleware/auth');

// Route to get all jobs
router.get('/', async (req, res, next) => {
    try{
        if (!req.user) throw new ExpressError("Unauthorized", 400);

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

// Route to get a job by id
router.get('/:id', async (req, res, next) => {
    try{
        if (!req.user) throw new ExpressError("Unauthorized", 400);

        const job = await Job.get(req.params.id);
        
        return res.json({job});
    }
    catch(e){
        next(e);
    }
});

// Route to create a new job with this JSON
// title: "Job Tester",
// salary: "100",
// equity: ".2",
// company_handle: "tst"
router.post('/', validateCreateJobJson, checkAdminStatus, async (req, res, next) => {
    try{
        
        const job = Job.create(req.body);
    
        await job.save();
        return res.status(201).json({job});
    }
    catch(e){
        next(e);
    }
});

//Route to update a job, will just return the company if no data is passed in body

router.patch('/:id', validateUpdateJobJson, checkAdminStatus, async (req, res, next) => {
    try{
        const job = await Job.get(req.params.id);
 
        const items = {
            title: req.body.title || job.title,
            salary: req.body.salary || job.salary,
            equity: req.body.equity || job.equity,
            company_handle: req.body.company_handle || job.company_handle
        }
        const queryObject = sqlForPartialUpdate('jobs', items, "id", req.params.id)
        
        const results = await db.query(queryObject.query, queryObject.values)
        
        return res.json({job: results.rows[0]});
    }
    catch(e){
        if (e.code === '23514'){
            next( new ExpressError("Equity must be less than 1", 400))
            }
        if (e.code === '23503'){
           next( new ExpressError(`Company handle does not exist`, 400))
        }
        next(e)
    }
});

// Route to delete a job

router.delete('/:id', checkAdminStatus, async (req, res, next) => {
    try{
        const job = await Job.get(req.params.id);
       
        await job.delete()
        
        return res.json({message: "Job deleted"});
    }
    catch(e){
        next(e);
    }
});

// route to apply to a job accepts 
// {state: "string of application status"} in body
// and job id in url

router.post('/:id/apply', async (req, res, next) => {
    try{
        if (!req.user) throw new ExpressError("Unauthorized", 400);
        
        const { state } = req.body
    
        const job = await Job.get(req.params.id);
        await job.apply(req.user.username, state);
       
        
        return res.json({message: state});
    }
    catch(e){
        next(e);
    }
});

module.exports = router;