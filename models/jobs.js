const db = require('../db');

const ExpressError = require("../helpers/expressError");

class Job {
    constructor({title , salary, equity, company_handle}) {
        this.title = title;
        this.salary = salary;
        this.equity = equity;
        this.company_handle = company_handle;
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

    //create and return a new job object

    static create(jobObj){
    
        return new Job(jobObj);
    }

    // retrieve a

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
                
        return new Company(company);
    }

    async delete() {
        await db.query(`DELETE FROM companies WHERE handle=$1`,
        [this.id])
    }


    // Insert job objects in the database

    async save(){
        
        try{
        
            const results = await db.query(`INSERT INTO jobs
            (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, date_posted`,
            [this.title, this.salary, this.equity, this.company_handle, new Date()]);

            this.id = results.rows[0].id;
            this.date_posted = results.rows[0].date_posted;
        }
        catch(e) {
            console.log(e)
            if (e.code === '23514'){
               throw new ExpressError("Equity must be less than 1", 400)
            }
        }
    }
}

module.exports = Job;