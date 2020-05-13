const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');

const ExpressError = require("../helpers/expressError");

class User {
    constructor({username, password , first_name, last_name, email, photo_url, is_admin}) {
        this.username = username;
        this.password = password;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.photo_url = photo_url;
        this.is_admin = is_admin;
    }

    //get all users

    static async getAll() {
        const results = await db.query(
            `SELECT username, first_name, last_name, email
              FROM users`
          );      
          
          return results.rows;
    }

   
    //creates a new user object with a hashed password

    static async create(userObj){
    
        const hashedPassword = await bcrypt.hash(userObj.password, BCRYPT_WORK_FACTOR)
        userObj.password = hashedPassword;
        return new User(userObj);
    }

    // authenticate a user with username and password
    static async authenticate(username, password){
       
        const user = await this.get(username);

        const auth = await bcrypt.compare(password, user.password)

        return auth
    }

    // retrieve a user by username

    static async get(username) {
        const results = await db.query(
          `SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username = $1`,
          [username]
        );      
        const user = results.rows[0];
        
        if (user === undefined) {
          throw new ExpressError(`No such user: ${username}`, 400);
        }
     
        // const jobResults = await db.query(
        //     `SELECT handle, name, num_employees, description, logo_url
        //       FROM companies 
        //       WHERE handle = $1`,
        //     [job.company_handle]
        //   );
        //   job.company_handle = compResults.rows[0];   
        
        return new User(user);
    }

    // delete a job 

    async delete() {

        await db.query(`DELETE FROM users WHERE username=$1`,
        [this.username])
      
    }


    // Insert job objects in the database

    async save(){
        
        try{
            
            if (!this.is_admin) this.is_admin = false;

                await db.query(`INSERT INTO users
                (username, password, first_name, last_name, email, photo_url, is_admin)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [this.username, this.password, this.first_name, 
                this.last_name, this.email, this.photo_url, this.is_admin]);
            

        }
        catch(e) {
            console.log(e)
        
            if (e.code === '23505'){
               throw new ExpressError(`User ${this.username} already exists`, 400)
            }
        }
    }
}

module.exports = User;