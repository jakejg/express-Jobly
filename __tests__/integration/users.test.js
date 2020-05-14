const request = require('supertest');
const app = require('../../app');
const User = require('../../models/users');
const jwt = require('jsonwebtoken');

const db = require('../../db')

process.env.NODE_ENV = "test";

const AdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RlciIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1ODkzOTMxOTd9.-r7XG4PoTzM_ZcXF-Y9TeA5fNK0hg39_T1BqpBT-sxw";

describe("User Routes Tests", ()=>{
    let user1;
    let user2;

    beforeEach(async () => {
        await db.query("DELETE FROM users");

        const results1 = await db.query(`INSERT INTO users
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            ["tester", "pwd", "please", "pass", "t@test.com", "http://photo.com", true]
            );
        const results2 = await db.query(`INSERT INTO users
            (username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            
            ["tester2", "pwd", "just", "work", "t@test2.com", "http://photo.com", true]
            );

        user1 = results1.rows[0];
        user2 = results2.rows[0];
    
    });
       
    test('get all users ', async() => {
        let res = await request(app).get("/users")
        expect(res.status).toEqual(200);
        expect(res.body.users.length).toEqual(2);
    });

    test('create a user', async() => {
        let res = await request(app).post('/users').send({
            username: "tester3",
            password: "pwd",
            first_name: "new",
            last_name: "test",
            email: "t@test3.com",
            is_admin: true
        })
        expect(res.status).toEqual(200);
        expect(jwt.decode(res.body._token).username).toEqual("tester3");
    })

    test('create a job with invalid data', async() => {
        let res = await request(app).post('/users').send({
            password: "pwd",
            first_name: "new",
            last_name: "test",
            email: "t@test3.com"
        })
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(["instance requires property \"username\""]);
    })

    test('get a user by username', async() => {
   
        let res = await request(app).get(`/users/${user1.username}`);
        expect(res.status).toEqual(200);
        expect(res.body.user.username).toEqual('tester');
        expect(res.body.user.email).toEqual('t@test.com');
    });

    test('get a user by a username that does not exist', async() => {
        let res = await request(app).get('/users/-3');
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual('No such user: -3');
    });

    test('update a user', async() => {
     
        let res = await request(app).patch(`/users/${user1.username}`).send({
            password: "new",
            first_name: "updatedFirst",
            last_name: "updatedLast",
            _token: AdminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.user.first_name).toEqual('updatedFirst');
        expect(res.body.user.last_name).toEqual('updatedLast');
    });

    test('delete a user', async() => {
        let res = await request(app).delete(`/users/${user1.username}`).send({
            _token: AdminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual("User deleted");
    });

});

afterAll(async function () {
    await db.end();
  });