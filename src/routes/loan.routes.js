const express = require('express');
const router = express.Router();

const { createLoan, getLoans } = require('../controllers/loan.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/contract/:loanId', auth, getContract);
router.post('/pay/:loanId', auth, payLoan);
router.get('/:userId', auth, getLoans);
router.post('/', auth, createLoan);

module.exports = router;

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

router.get("/:user_id", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM loans WHERE user_id=$1",
    [req.params.user_id]
  );

  res.json(result.rows);
});

module.exports = router;