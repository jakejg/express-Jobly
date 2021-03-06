const jsonschema = require('jsonschema');
const createCompanySchema = require('../schemas/createCompanySchema.json');
const updateCompanySchema = require('../schemas/updateCompanySchema.json');
const createJobSchema = require('../schemas/createJobSchema.json');
const updateJobSchema = require('../schemas/updateJobSchema.json');
const createUserSchema = require('../schemas/createUserSchema.json');
const updateUserSchema = require('../schemas/updateUserSchema.json');


const ExpressError = require('../helpers/expressError');


function validate(body, next, schema) {
    const result = jsonschema.validate(body, schema)
        if (!result.valid) {
          let listOfErros = result.errors.map(error => error.stack)
          let error = new ExpressError(listOfErros, 400)
          return next(error)
        }
        else {
            return next()
        }
}

function validateCreateCompanyJson(req, res, next){
    
    validate(req.body, next, createCompanySchema);
}

function validateUpdateCompanyJson(req, res, next){
    
    validate(req.body, next, updateCompanySchema);
}

function validateCreateJobJson(req, res, next){
    
    validate(req.body, next, createJobSchema);
}

function validateUpdateJobJson(req, res, next){
    
    validate(req.body, next, updateJobSchema);
}

function validateCreateUserJson(req, res, next){
    
    validate(req.body, next, createUserSchema);
}
function validateUpdateUserJson(req, res, next){
    
    validate(req.body, next, updateUserSchema);
}
module.exports = {
    validateUpdateCompanyJson,
    validateCreateCompanyJson,
    validateCreateJobJson,
    validateUpdateJobJson,
    validateCreateUserJson,
    validateUpdateUserJson
}