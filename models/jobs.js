const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const ExpressError = require("../helpers/expressError");

class Job {
    constructor({id, title , salary, equity, company_handle, date_posted}) {
        this.id = id;
        this.title = title;
        this.salary = salary;
        this.equity = equity;
        this.company_handle = company_handle;
        this.date_posted = date_posted;
    }

    //get all companies

    static async getAll() {
        const results = await db.query(
            `SELECT title, company_handle
              FROM jobs
              ORDER BY date_posted`
          );      
          
          return results.rows;
    }

    // filter companies by name, max_employees or min_employees

    static async filter(query) {
        const baseQuery = 'SELECT title, company_handle FROM jobs';
        const whereClauses = [];
        const values = [];

        if (query.search) {
            whereClauses.push(`title ILIKE '%'|| $${values.length + 1} ||'%'`);
            values.push(query.search);
        }

        if (query.min_salary) {
            whereClauses.push(`salary > $${values.length + 1}`);
            values.push(query.min_salary);
        }

        if (query.min_equity) {
            whereClauses.push(`equity > $${values.length + 1}`);  
            values.push(query.min_equity);   
        }
       
        const results = await db.query(`${baseQuery} WHERE ${whereClauses.join(" AND ")}`, [...values])
      
        return results.rows
    }

    //create and return a new job object

    static create(jobObj){

        jobObj.date_posted = new Date();
        return new Job(jobObj);
    }

    // retrieve a job

    static async get(id) {
        const results = await db.query(
            `SELECT j.id, j.title, j.salary, j.equity, j.company_handle,
            c.handle, c.name, c.num_employees, c.description, c.logo_url 
            FROM jobs as j JOIN companies AS c ON j.company_handle=c.handle WHERE id=$1`,
            [id]
          );    

        if (results.rows[0] === undefined) {
          throw new ExpressError(`No such job: ${id}`, 400);
        }
        const job = {
            id: results.rows[0].id,
            title: results.rows[0].title,
            salary: results.rows[0].salary,
            equity: results.rows[0].equity,
            company_handle: {
                handle: results.rows[0].handle,
                name: results.rows[0].name,
                num_employees: results.rows[0].num_employees,
                description: results.rows[0].description,
                logo_url: results.rows[0].logo_url,
            }
        } 

        // const results = await db.query(
        //   `SELECT id, title, salary, equity, company_handle
        //     FROM jobs
        //     WHERE id = $1`,
        //   [id]
        // );      
        // const job = results.rows[0];
     
        // const compResults = await db.query(
        //     `SELECT handle, name, num_employees, description, logo_url
        //       FROM companies 
        //       WHERE handle = $1`,
        //     [job.company_handle]
        //   );
        //   job.company_handle = compResults.rows[0];   
        
        return new Job(job);
    }

    // delete a job 

    async delete() {
        
        await db.query(`DELETE FROM jobs WHERE id=$1`,
        [this.id])
    
    }

    // apply to a job
    async apply(username, state) {
        try{
            const results = await db.query(`SELECT * FROM applications
                WHERE username=$1 AND job_id=$2`,
                [username, this.id])

            if (!results.rows[0]) {
                const results = await db.query(`INSERT INTO applications
                (username, job_id, state, created_at)
                VALUES ($1, $2, $3, $4)`,
                [username, this.id, state, new Date()]);
            }
            else {
                const results = await db.query(`UPDATE applications SET
                state=$2
                WHERE username=$1`,
                [username, state]);
            }
        }
        catch(e){
            console.log(e)
        }
    }

    async update(title, salary, equity, company_handle) {
        const items = {
            title: title || this.title,
            salary: salary || this.salary,
            equity: equity || this.equity,
            company_handle: company_handle || this.company_handle,    
        }
        const queryObject = sqlForPartialUpdate('jobs', items, "id", this.id)
        
        const results = await db.query(queryObject.query, queryObject.values)

        this.title = results.rows[0].title;
        this.salary = results.rows[0].salary;
        this.equity = results.rows[0].equity;
        this.company_handle = results.rows[0].company_handle;
    }


    // Insert job objects in the database

    async save(){
        
        try{
        
            const results = await db.query(`INSERT INTO jobs
            (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, date_posted`,
            [this.title, this.salary, this.equity, this.company_handle, this.date_posted]);

            this.id = results.rows[0].id;
            this.date_posted = results.rows[0].date_posted;
        }
        catch(e) {
            console.log(e)
            if (e.code === '23514'){
               throw new ExpressError("Equity must be less than 1", 400)
            }
            if (e.code === '23503'){
               throw new ExpressError(`Company handle ${this.company_handle} does not exist`, 400)
            }
        }
    }
}

module.exports = Job;