const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const loanRoutes = require('./routes/loan.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

module.exports = app;