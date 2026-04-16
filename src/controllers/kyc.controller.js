const pool = require('../config/db');

exports.saveKyc = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      first_name,
      last_name,
      cuit,
      birth_date,
      phone,
      address,
      barrio,
      provincia,
      ciudad
    } = req.body;

    const result = await pool.query(
      `INSERT INTO kyc 
      (user_id, first_name, last_name, cuit, birth_date, phone, address, barrio, provincia, ciudad)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        userId,
        first_name,
        last_name,
        cuit,
        birth_date,
        phone,
        address,
        barrio,
        provincia,
        ciudad
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("KYC ERROR:", err);
    res.status(500).json({ error: "Error guardando KYC" });
  }
};