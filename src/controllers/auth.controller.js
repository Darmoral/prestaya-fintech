const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// ======================
// 🔐 LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    const user = result.rows[0];

    // 2. Validar password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // 🔥 3. GENERAR TOKEN (AQUÍ VA)
    const payload = {
      id: user.id,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 🔥 AQUÍ
    );

    // 4. Respuesta
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 verificar si ya existe
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    // 🔐 encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 guardar usuario
    const result = await pool.query(
      "INSERT INTO users(name, email, password) VALUES($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // 🔥 generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ RESPUESTA (CLAVE)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en registro" });
  }
};