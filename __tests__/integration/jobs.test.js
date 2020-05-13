const request = require('supertest');
const app = require('../../app');
const Job = require('../../models/jobs');
const Company = require('../../models/companies');
const db = require('../../db')

process.env.NODE_ENV = "test"

const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Impha2V0ZXN0OSIsImlzX2FkbWluIjp0cnVlLCJpYXQiOjE1ODkzOTAzMzZ9.-iKCbe2d8Ogr-NyKYdQVFdjprmSffgF0h3ZKqoq7MBM";


describe("Job Routes Tests", ()=>{
    let job1;
    let job2;

    beforeEach(async () => {
        await db.query("DELETE FROM jobs");
        await db.query("DELETE FROM companies");

        const comp1 = Company.create({
            handle: 'tst',
            name: "testComp",
            num_employees: 10,
            description: "testing",
            logo_url: "http://test.com",
            _token: adminToken
        });
        const comp2 = Company.create({
            handle: 'tst2',
            name: "testComp2",
            num_employees: 50,
            description: "testing",
            logo_url: "http://test.com",
            _token: adminToken
        });

        await comp1.save()
        await comp2.save()

        job1 = Job.create({
            title: "Job Tester",
            salary: "100",
            equity: ".2",
            company_handle: "tst",
            _token: adminToken
        });
        job2 = Job.create({
            title: "Test Manager",
            salary: "2000",
            equity: ".5",
            company_handle: "tst2",
            _token: adminToken
        });

        await job1.save()
        await job2.save()
    });

    test('get all jobs ', async() => {
        let res = await request(app).get("/jobs").send({
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.jobs.length).toEqual(2);
    });

    test('get all jobs with Manager in the title', async() => {
        let res = await request(app).get("/jobs?search=Manager").send({
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.jobs[0].company_handle).toEqual("tst2");
    });

    test('get all jobs with a salary of more than 1000', async() => {
        let res = await request(app).get("/jobs?min_salary=1000").send({
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.jobs.length).toEqual(1);
        expect(res.body.jobs[0].company_handle).toEqual("tst2");
    });

    test('create a job', async() => {
        let res = await request(app).post('/jobs').send({
            title: "Test Director",
            salary: "35000",
            equity: ".6",
            company_handle: "tst",
            _token: adminToken
        })
        expect(res.status).toEqual(201);
        expect(res.body.job.title).toEqual("Test Director");
    })

    test('create a job with invalid data', async() => {
        let res = await request(app).post('/jobs').send({
            salary: "35000",
            equity: ".6",
            company_handle: "tst",
            _token: adminToken
        })
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual(["instance requires property \"title\""]);
    })

    test('get a job by id', async() => {
        let res = await request(app).get(`/jobs/${job1.id}`).send({
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.job.title).toEqual('Job Tester');
        expect(res.body.job.company_handle.name).toEqual('testComp');
    });

    test('get a job by handle that does not exist', async() => {
        let res = await request(app).get('/jobs/-3').send({
            _token: adminToken
        });
        expect(res.status).toEqual(400);
        expect(res.body.message).toEqual('No such job: -3');
    });

    test('update a job', async() => {
        let res = await request(app).patch(`/jobs/${job1.id}`).send({
            title: "newTestJob",
            company_handle: "tst",
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.job.title).toEqual('newTestJob');
    });

    test('delete a job', async() => {
        let res = await request(app).delete(`/jobs/${job1.id}`).send({
            _token: adminToken
        });
        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual("Job deleted");
    });

});

afterAll(async function () {
    await db.end();
  });