/** Biztime invoices routes */

const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        const result = await db.query(
            `SELECT id, comp_code 
            FROM invoices`
        );

        return res.json({"invoices": result.rows})
    }

    catch (err) {
        return next(err);
    }
})

router.get("/:id", async function(req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(
            `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice ${id} does not exist`, 404);
        }
        else {
            data = result.rows[0];
            let output = {"invoice": {"id": data.id, "amt": data.amt, "paid": data.paid, "add_date": data.add_date, "paid_date": data.paid_date}, "company": {"code": data.code, "name": data.name, "description": data.description}}
            return res.json(output);
        }
    }
    
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    try {
        let { comp_code, amt } = req.body;

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );

        return res.json({"invoice": result.rows[0]});
    }

    catch (err) {
        return next(err);
    }
})

router.put("/:id", async function(req, res, next) {
    try {
        let id = req.params.id;
        let { amt, paid } = req.body;

        const result = await db.query(
            `UPDATE invoices
            SET amt = $1, paid = $2
            WHERE id = $3
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice ${id} does not exist`, 404);
        }

        else if (paid === true) {
            
        }

        else {
            return res.json(result.rows[0]);
        }
    }

    catch (err) {
        return next(err);
    }
})

router.delete("/:id", async function(req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(
            `DELETE FROM invoices
            WHERE id = $1
            RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice ${id} does not exist`, 404);
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