
// ===================================
// FILE: backend/routes/index.js
// Export all routes
// ===================================

module.exports = {
  authRoutes: require('./auth'),
  reportRoutes: require('./reports'),
  transactionRoutes: require('./transaction')
};