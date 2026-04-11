exports.calculateLoan = (amount, days) => {
  let rate = 0;

  if (days === 7) rate = 0.38;
  if (days === 10) rate = 0.54;
  if (days === 15) rate = 0.84;

  const interest = amount * rate;
  const total = amount + interest;

  const due = new Date();
  due.setDate(due.getDate() + days);

  return { interest, total, due };
};