const express = require("express");
const db = require("../db");
const router = new express.Router();
const { NotFoundError } = require("../expressError");

router.get("/", async function(req, res, next) {
    const result = await db.query(
        `SELECT id, comp_code
        FROM invoices
        `
    );

    const invoices = result.rows;
    return res.json({invoices});
});

router.get("/:id", async function(req, res, next) {
    const iResult = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code
        FROM invoices
        WHERE id = $1
        `,
        [req.params.id]
    );
    const invoice = iResult.rows[0];

    if (invoice) {
        const cResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1
            `,
            [invoice.comp_code]
        );
        invoice.company = cResult.rows[0];
        delete invoice.comp_code;
        return res.json({invoice});
    }

    throw new NotFoundError();
});


router.post("/", async function(req, res, next) {
    const {comp_code, amt} = req.body;
    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date
        `,
        [comp_code, amt]
    );

    const invoice = result.rows[0];
    return res.json({invoice});
});

router.put("/:id", async function(req, res, next) {
    const {amt} = req.body;
    const result = await db.query(
        `UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date
        `,
        [amt, req.params.id]
    );

    const invoice = result.rows[0];
    if (invoice) {
        return res.json({invoice});
    }
    throw new NotFoundError();
});

router.delete("/:id", async function(req, res, next) {
    const result = await db.query(
        `DELETE FROM invoices WHERE id = $1
            RETURNING id`,
        [req.params.id]
    );

    if (result.rows[0]) {
        return res.json({status: "deleted"});
    }

    throw new NotFoundError();
});

module.exports = router;