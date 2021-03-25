const express = require("express");
const db = require("../db");
const router = new express.Router();
const { NotFoundError } = require("../expressError");

router.get("/", async function(req, res, next) {
    const results = await db.query(
        `SELECT code, name, description
            FROM companies`
    );
    
    const companies = results.rows;
    return res.json({ companies });
})

router.get("/:code", async function(req, res, next) {
    const result = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
            [req.params.code]
    );
    
    const company = result.rows[0];
    if (company) {
        return res.json({ company });
    } 
    throw new NotFoundError();
})

router.post("/", async function(req, res, next) {
    const { code, name, description} = req.body;
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
    );
    
    const company = result.rows[0];
    return res.status(201).json({ company })
})

router.put("/:code", async function(req, res, next) {

    const { name, description } = req.body;
    const updateResult = await db.query(
        `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`,
        [name, description, req.params.code]
    );
    const updatedCompany = updateResult.rows[0];
    if (updatedCompany) {
        return res.json({company: updatedCompany})
    } 
    throw new NotFoundError();
})

router.delete("/:code", async function(req, res, next) {
    const result = await db.query(
        `DELETE FROM companies WHERE code = $1
        RETURNING code`,
        [req.params.code]
    );
    const deleted = result.rows[0];
    if (deleted) {
        return res.json({ status: "Deleted" });
    } 
    throw new NotFoundError();
})


module.exports = router;