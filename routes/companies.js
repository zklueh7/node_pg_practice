/** Biztime companies routes */

const db = require("../db");
const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name, description
            FROM companies
            ORDER BY name;`
        );
        return res.json({"companies": result.rows});
    }
    catch (err) {
        return next(err);
    }
})

router.get("/:code", async function(req, res, next) {
    try {
        let code = req.params.code;

        const result = await db.query(
            `SELECT c.code, c.name, c.description
            FROM companies AS c
            INNER JOIN invoices as i ON (c.code = i.comp_code)
            WHERE c.code = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`${code} company does not exist`, 404);
        }
        else {
            let data = result.rows[0];
            let output = {"company": data.code, "name": data.name, "description": data.description, "invoices": {"amt": data.amt }};
            return res.json(output);
        }

    }
    catch (err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next) {
    try {
        let { name, description } = req.body;
        let code = slugify(name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );

        return res.status(201).json({"company": result.rows[0]});
    }

    catch (err) {
        return next(err);
    }
})

router.put('/:code', async function(req, res, next) {
    try {
        let code = req.params.code;
        let { name, description } = req.body;

        const result = await db.query(
            `UPDATE companies
            SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`${code} company does not exist`, 404);
        }
        else {
            return res.json({"company": result.rows[0]});
        }
    }

    catch (err) {
        return next(err);
    }
})

router.delete('/:code', async function(req, res, next) {
    try {
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code`,
            [code]
        );

        if(result.rows.length === 0) {
            throw new ExpressError(`${code} company does not exist`, 404);
        }
        else {
            return res.json({"status": "deleted"});
    }
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;