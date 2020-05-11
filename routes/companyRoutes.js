const Company = require('../models/companies');
const express = require('express');
const router = new express.Router();


//
router.post('/', async (req, res, net) => {
    const company = Company.create(req.body)
    await company.save()
    return res.json({company})
})

module.exports = router;