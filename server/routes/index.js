const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
  });
});

// Add your API routes here
// router.use('/users', require('../routes/users'));
// router.use('/auth', require('../routes/auth'));

module.exports = router;
