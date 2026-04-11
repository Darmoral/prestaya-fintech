const loanModel = require('../src/models/loan.model');
const { calculateLoan } = require('../utils/calculator');

exports.createLoan = async ({ user_id, amount, days }) => {
  const calc = calculateLoan(amount, days);

  return await loanModel.create(
    user_id,
    amount,
    days,
    calc.interest,
    calc.total,
    calc.due
  );
};

exports.getLoans = async (user_id) => {
  return await loanModel.getByUser(user_id);
};