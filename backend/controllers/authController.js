const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

const ALLOWED_ROLES = new Set(['client', 'vendor', 'admin', 'consultant']);

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'vendorverify-dev-secret',
    { expiresIn: '8h' }
  );
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const requestedRole = String(role || 'client').toLowerCase();
    const normalizedRole = ALLOWED_ROLES.has(requestedRole) ? requestedRole : 'client';

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    });

    const token = signToken(user);
    req.session.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);
    req.session.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to login user.' });
  }
}

module.exports = {
  register,
  login,
};
