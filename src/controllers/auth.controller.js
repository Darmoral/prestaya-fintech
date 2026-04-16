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

    // 🔥 VERIFICAR EMAIL
    if (!user.verified) {
      return res.status(403).json({
        error: "Debes verificar tu email"
      });
    }

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

    // 🔐 PASSWORD
    const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error: "Contraseña débil"
      });
    }

    // 📧 EMAIL ÚNICO
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    // 🔢 CÓDIGO
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 INSERT
    await pool.query(
      `INSERT INTO users (name, email, password, verification_code, verified)
       VALUES ($1,$2,$3,$4,false)`,
      [name, email, hashedPassword, code]
    );

    // 📧 EMAIL
    await transporter.sendMail({
      to: email,
      subject: "Código de verificación",
      text: `Tu código es: ${code}`,
    });

    return res.json({
      message: "Usuario registrado, verifica tu email"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en registro" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    const user = result.rows[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // 🔥 activar usuario
    await pool.query(
      "UPDATE users SET verified = true WHERE email = $1",
      [email]
    );

    // 🔥 generar token (AUTO LOGIN)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en verificación" });
  }
};