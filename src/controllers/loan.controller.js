const loanService = require('../services/loan.service');

exports.createLoan = async (req, res) => {
  try {
    const loan = await loanService.createLoan(req.body);
    res.json(loan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getLoans = async (req, res) => {
  const loans = await loanService.getLoans(req.params.user_id);
  res.json(loans);
};