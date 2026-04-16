const express = require('express');
const router = express.Router();

const { saveKyc } = require('../controllers/kyc.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, saveKyc);

module.exports = router;