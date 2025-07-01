
const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/authMiddleware')

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: 'Selamat datang di Dashboard Admin!' })
})

module.exports = router
