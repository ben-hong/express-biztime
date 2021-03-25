const request = require("supertest");
const app = require("../app");
let db = require("../db");

let testCompany;

beforeEach(async function() {
    await db.query("DELETE FROM companies");
    let result = await db.query(
        `
        INSERT INTO companies (code, name, description)
        VALUES ('test', 'testname', 'testing')
        RETURNING code, name, description
        `
    );
    testCompany = result.rows[0];
})

describe ("GET /companies", function() {
    test("Gets companies from database", async function() {
        const resp = await request(app).get('/companies');
        expect(resp.body).toEqual({companies: [testCompany]
        });
    })
})

describe ("GET /companies/:code", function() {
    test("Get a company", async function() {
        const resp = await request(app).get(`/companies/${testCompany.code}`);
        testCompany.invoices = [];
        expect(resp.body).toEqual({company: testCompany});
    })
    test("Respond with 404 if not found", async function() {
        const resp = await request(app).get(`/companies/0`);
        expect(resp.statusCode).toEqual(404)
    })
})

describe ("POST /companies", function() {
    test("Create a new company", async function() {
        const resp = await request(app).post('/companies')
        .send({code: 'test2', name: 'testname2', description: 'testdescription'});
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({company: 
            {code: 'test2', name: 'testname2', description: 'testdescription'}
        });
    })
})

describe ("PUT /companies/:code", function() {
    test("change company name and descript", async function() {
        const resp = await request(app).put(`/companies/${testCompany.code}`)
        .send({name: 'changedname', description: 'cDescription'});
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({company: 
            {code: testCompany.code, name: 'changedname', description: 'cDescription'}
        });
    })
    test("Respond with 404 if not found", async function() {
        const resp = await request(app).put(`/companies/0`);
        expect(resp.statusCode).toEqual(404)
    })
})

describe ("DELETE /companies/:code", function() {
    test("delete a company", async function() {
        const resp = await request(app).delete(`/companies/${testCompany.code}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({status: 'deleted'});
    })
    test("Respond with 404 if not found", async function() {
        const resp = await request(app).delete(`/companies/0`);
        expect(resp.statusCode).toEqual(404)
    })
})
