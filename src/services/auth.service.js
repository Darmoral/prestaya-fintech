const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

exports.register = async ({ name, email, password }) => {
  const hash = await bcrypt.hash(password, 10);
  return await userModel.create(name, email, hash);
};

exports.login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);

  if (!user) throw new Error("Usuario no existe");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) throw new Error("Contraseña incorrecta");

  const token = generateToken(user);

  return { user, token };
};