const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM students");
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const queryy = {
    text: "INSERT INTO students (name) VALUES ($1) RETURNING *",
    values: [req.body.name],
  };

  try {
    const result = await db.query(queryy);
    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  const queryy = {
    text: "UPDATE students SET name=$1 WHERE id=$2 RETURNING *",
    values: [req.body.name, req.params.id],
  };

  try {
    const result = await db.query(queryy);
    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const query = {
    text: "DELETE FROM students WHERE id = $1 RETURNING *",
    values: [req.params.id],
  };

  try {
    const result = await db.query(query);
    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
