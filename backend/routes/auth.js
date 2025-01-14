const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { auditLogger } = require('../middlewares/logger');
const { USER_ACTIONS } = require('../utils/auditConstants');
const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  updatePasswordValidator
} = require('../middlewares/validators/auth.validator');

// 基础认证路由
router.post('/register', 
  registerValidator, 
  auditLogger(USER_ACTIONS.REGISTER),
  authController.register
);

router.post('/login', 
  loginValidator, 
  auditLogger(USER_ACTIONS.LOGIN),
  authController.login
);

router.post('/logout', 
  protect, 
  auditLogger(USER_ACTIONS.LOGOUT),
  authController.logout
);

router.post('/reset-password', 
  resetPasswordValidator, 
  auditLogger(USER_ACTIONS.UPDATE_PASSWORD),
  authController.resetPassword
);

router.post('/update-password', 
  protect, 
  updatePasswordValidator, 
  auditLogger(USER_ACTIONS.UPDATE_PASSWORD),
  authController.updatePassword
);

module.exports = router; 