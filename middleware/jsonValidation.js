const jsonschema = require('jsonschema');
const createCompanySchema = require('../schemas/createCompanySchema.json');
const updateCompanySchema = require('../schemas/updateCompanySchema.json');
const ExpressError = require('../helpers/expressError')

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
    
    validate(req.body, next, createCompanySchema)
}

function validateUpdateCompanyJson(req, res, next){
    console.log(updateCompanySchema)
    validate(req.body, next, updateCompanySchema)
}

module.exports = {
    validateUpdateCompanyJson,
    validateCreateCompanyJson
}