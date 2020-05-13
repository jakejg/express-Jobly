const db = require('../db');

const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
    constructor({handle, name , num_employees, description, logo_url, jobs}) {
        this.handle = handle;
        this.name = name;
        this.num_employees = num_employees;
        this.description = description;
        this.logo_url = logo_url;
        this.jobs = jobs;
    }

    //get all companies

    static async getAll() {
        const results = await db.query(
            `SELECT handle, name
              FROM companies`
          );      
          
          return results.rows;
    }

    // filter companies by name, max_employees or min_employees

    static async filter(query) {
        const baseQuery = 'SELECT handle, name FROM companies';
        const whereClauses = [];
        const values = [];

        if (query.search) {
            whereClauses.push(`name ILIKE '%'|| $${values.length + 1} ||'%'`);
            values.push(query.search);
        }

        if (query.min_employees > query.max_employees) {
            throw new ExpressError("Min employees can't be more than max employees", 400)
        }

        if (query.min_employees) {
            whereClauses.push(`num_employees > $${values.length + 1}`);
            values.push(query.min_employees);
        }

        if (query.max_employees) {
            whereClauses.push(`num_employees < $${values.length + 1}`);  
            values.push(query.max_employees);   
        }
       
        const results = await db.query(`${baseQuery} WHERE ${whereClauses.join(" AND ")}`, [...values])
      
        return results.rows
    }

    //create a new company object

    static create(companyObj){
        const company = new Company(companyObj);
       
        return company;
    }

    // retrieve a company by handle

    static async get(handle) {
        const results = await db.query(
          `SELECT handle, name, num_employees, description, logo_url
            FROM companies 
            WHERE handle = $1`,
          [handle]
        );      

        const company = results.rows[0]; 

        if (company === undefined) {
          throw new ExpressError(`No such company: ${handle}`, 400);
        }
        const jobResults = await db.query(
            `SELECT id, title, salary, equity
              FROM jobs
              WHERE company_handle = $1`,
            [handle]
          );
          
        company.jobs = jobResults.rows
      
        return new Company(company);
    }

    async delete() {
        await db.query(`DELETE FROM companies WHERE handle=$1`,
        [this.handle])
    }

    async update(name, num_employees, description, logo_url) {
 
        const items = {
            name: name || this.name,
            num_employees:num_employees || this.num_employees,
            description:description || this.description,
            logo_url: logo_url || this.logo_url
        }
        const queryObject = sqlForPartialUpdate('companies', items, "handle", this.handle)
       
        const results = await db.query(queryObject.query, queryObject.values)

        this.name = results.rows[0].name;
        this.num_employees = results.rows[0].num_employees;
        this.description = results.rows[0].description;
        this.logo_url =  results.rows[0].logo_url;
    }


    // Insert or updated company objects in the database

    async save(){
        
        try{
            
            await db.query(`INSERT INTO companies 
            (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)`,
            [this.handle, this.name, this.num_employees, this.description, this.logo_url])
        }
        catch(e) {
            console.log(e)
            if (e.code === '23505'){
               throw new ExpressError("Company already exists", 400)
            }
        }
    }
}

module.exports = Company;