const pool = require('../config/db');
const { generateContract } = require('../utils/pdf.service');

exports.createLoan = async (req, res) => {
  const rates = { 7: 0.38, 10: 0.54, 15: 0.84 };

exports.createLoan = async (req, res) => {
  try {
    const { amount, days } = req.body;
    const userId = req.user.id;

    const rate = rates[days];

    if (!rate) {
      return res.status(400).json({ error: "Plan inválido" });
    }

    const interest = amount * rate;
    const total = amount + interest;
    const daily = total / days;

    const result = await pool.query(
      `INSERT INTO loans 
      (user_id, amount, days, interest, total, daily_payment, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *`,
      [userId, amount, days, interest, total, daily]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("CREATE LOAN ERROR:", err);
    res.status(500).json({ error: "Error al crear préstamo" });
  }
};
};

exports.getLoans = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT * FROM loans WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener préstamos" });
  }
};

exports.getContract = async (req, res) => {
  const { loanId } = req.params;

  const loan = await pool.query(
    "SELECT * FROM loans WHERE id = $1",
    [loanId]
  );

  const user = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [req.user.id]
  );

  generateContract(user.rows[0], loan.rows[0], res);
};

exports.payLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loanResult = await pool.query(
      "SELECT * FROM loans WHERE id = $1",
      [loanId]
    );

    const loan = loanResult.rows[0];

    if (!loan) {
      return res.status(404).json({ error: "Préstamo no encontrado" });
    }

    // 🔥 registrar pago
    await pool.query(
      "INSERT INTO payments (loan_id, amount) VALUES ($1, $2)",
      [loanId, loan.daily_payment]
    );

    // 🔥 actualizar total restante
    const newTotal = loan.total - loan.daily_payment;

    let status = loan.status;

    if (newTotal <= 0) {
      status = "paid";
    }

    await pool.query(
      "UPDATE loans SET total = $1, status = $2 WHERE id = $3",
      [newTotal, status, loanId]
    );

    res.json({
      message: "Pago realizado",
      remaining: newTotal,
      status,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en pago" });
  }
};