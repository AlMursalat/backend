

const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak ditemukan' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Simpan data user ke request
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid' })
  }
}

module.exports = verifyToken
