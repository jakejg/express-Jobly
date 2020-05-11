const db = require('../db');

class Company {
    constructor({handle, name , num_employees, description, logo_url}) {
        this.handle = handle;
        this.name = name;
        this.num_employees = num_employees;
        this.description = description;
        this.logo_url = logo_url;
    }

    static create(companyObj){
        const company = new Company(companyObj);
       
        return company
    }

    static async get(handle) {
        const results = await db.query(
          `SELECT handle, name, num_employees, description, logo_url
            FROM companies 
            WHERE handle = $1`,
          [handle]
        );      
        const company = results.rows[0];     
        if (company === undefined) {
          throw new ExpressError(`No such company: ${company}`, 400);
          
        }        
        return new Company(company);
    }

    async save(){
        
        try{
            if (!this.existsInDb){
            
                const results = await db.query(`INSERT INTO companies 
                (handle, name, num_employees, description, logo_url)
                VALUES ($1, $2, $3, $4, $5)`,
                [this.handle, this.name, this.num_employees, this.description, this.logo_url])
                
                this.existsInDb = true;
            }
            else {
                await db.query(`UPDATE companies SET
                (name, num_employees, description, log_url)
                VALUES=$2, $3, $4, $5
                WHERE handle=$1`,
                [this.handle, this.name, this.num_employees, this.description, this.logo_url])
            }
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