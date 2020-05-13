const request = require('supertest');
const app = require('../../app');
const User = require('../../models/users');

const db = require('../../db')

process.env.NODE_ENV = "test"

describe("User Routes Tests", ()=>{
    let user1;
    let user2;

    beforeEach(async () => {
        await db.query("DELETE FROM users");

        user1 = await User.create({
            username: "tester",
            password: "pwd",
            first_name: "please",
            last_name: "pass",
            email: "t@test.com"
        });
        user2 = await User.create({
            username: "tester2",
            password: "pwd",
            first_name: "please!",
            last_name: "pass!",
            email: "t@test2.com"
        });
  
        await user1.save();
        await user2.save();
    });
       
    test('get all users ', async() => {
        let res = await request(app).get("/users");
        expect(res.status).toEqual(200);
        expect(res.body.users.length).toEqual(2);
    });

    test('create a user', async() => {
        let res = await request(app).post('/users').send({
            username: "tester3",
            password: "pwd",
            first_name: "new",
            last_name: "test",
            email: "t@test3.com"
        })
        expect(res.status).toEqual(201);
        expect(res.body.user.username).toEqual("tester3");
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
        console.log(user1.username)
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
        console.log(user1.username)
        let res = await request(app).patch(`/users/${user1.username}`).send({
            password: "new",
            first_name: "updatedFirst",
            last_name: "updatedLast",    
        });
        expect(res.status).toEqual(200);
        expect(res.body.user.first_name).toEqual('updatedFirst');
        expect(res.body.user.last_name).toEqual('updatedLast');
    });

    test('delete a user', async() => {
        let res = await request(app).delete(`/users/${user1.username}`);
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual("User deleted");
    });

});

afterAll(async function () {
    await db.end();
  });