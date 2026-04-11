const express = require("express");
const db = require("../config/db");

const router = express.Router();

function calc(amount, days) {
  let rate = 0;
  if (days === 7) rate = 0.38;
  if (days === 10) rate = 0.54;
  if (days === 15) rate = 0.84;

  const interest = amount * rate;
  const total = amount + interest;

  const due = new Date();
  due.setDate(due.getDate() + days);

  return { interest, total, due };
}

router.post("/", async (req, res) => {
  const { user_id, amount, days } = req.body;

  const c = calc(amount, days);

  const result = await db.query(
    `INSERT INTO loans(user_id,amount,days,interest,total,status,due_date)
     VALUES($1,$2,$3,$4,$5,'pending',$6) RETURNING *`,
    [user_id, amount, days, c.interest, c.total, c.due]
  );

  res.json(result.rows[0]);
});

router.get("/:user_id", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM loans WHERE user_id=$1",
    [req.params.user_id]
  );

  res.json(result.rows);
});

module.exports = router;