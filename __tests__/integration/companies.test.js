const request = require('supertest');
const app = require('../../app');
const Company = require('../../models/companies');
const db = require('../../db')

process.env.NODE_ENV = "test"

describe("Company Routes Tests", ()=>{
    beforeEach(async () => {
        await db.query("DELETE FROM companies");

        const comp1 = Company.create({
            handle: 'tst',
            name: "testComp",
            num_employees: 10,
            description: "testing",
            logo_url: "http://test.com"
        });
        const comp2 = Company.create({
            handle: 'tst2',
            name: "testComp2",
            num_employees: 50,
            description: "testing",
            logo_url: "http://test.com"
        });

        await comp1.save()
        await comp2.save()
    });

    test('get all companies', async() => {
        let res = await request(app).get("/companies");
        expect(res.status).toEqual(200);
        expect(res.body.companies.length).toEqual(2);
    });

    test('get all companies with 2 in the name', async() => {
        let res = await request(app).get("/companies?search=2");
        expect(res.status).toEqual(200);
        expect(res.body.companies[0].handle).toEqual("tst2");
    });

    test('get all companies with more less than 40 employees', async() => {
        let res = await request(app).get("/companies?max_employees=40");
        expect(res.status).toEqual(200);
        expect(res.body.companies[0].handle).toEqual("tst");
    });

    test('create a company', async() => {
        let res = await request(app).post('/companies').send({
            handle: 'tst3',
            name: "testComp3",
            num_employees: 100,
            description: "testing",
            logo_url: "http://test.com"
        })
        expect(res.status).toEqual(201);
        expect(res.body.company.handle).toEqual('tst3');
    })

    test('create a company with invalid data', async() => {
        let res = await request(app).post('/companies').send({
            hand: 'tst3',
            name: "testComp3",
            num_employees: 100,
            description: "testing",
            logo_url: "http://test.com"
        })
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(["instance requires property \"handle\""]);
    })

    test('get a company by handle', async() => {
        let res = await request(app).get('/companies/tst');
        expect(res.status).toEqual(200);
        expect(res.body.company.name).toEqual('testComp');
    });

    test('get a company by handle that does not exist', async() => {
        let res = await request(app).get('/companies/fake');
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual('No such company: fake');
    });

    test('update a company', async() => {
        let res = await request(app).patch('/companies/tst').send({name: "newTestComp"});
        expect(res.status).toEqual(200);
        expect(res.body.company.name).toEqual('newTestComp');
    });

    test('delete a company', async() => {
        let res = await request(app).delete('/companies/tst');
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual("Company deleted");
    });

});

afterAll(async function () {
    await db.end();
  });