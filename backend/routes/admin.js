const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');
const { auditLogger } = require('../middlewares/logger');
const { ADMIN_ACTIONS } = require('../utils/auditConstants');

// 用户管理路由
router.get('/users', protect, restrictTo('admin'), adminController.getUsers);
router.get('/users/:id', protect, restrictTo('admin'), adminController.getUser);
router.put('/users/:id', protect, restrictTo('admin'), auditLogger(ADMIN_ACTIONS.USER_UPDATE), adminController.updateUser);
router.delete('/users/:id', protect, restrictTo('admin'), auditLogger(ADMIN_ACTIONS.USER_DELETE), adminController.deleteUser);

// 系统管理路由
router.get('/statistics', protect, restrictTo('admin'), adminController.getStatistics);
router.get('/logs', protect, restrictTo('admin'), adminController.getLogs);

// 系统备份路由
router.get('/backups', protect, restrictTo('admin'), adminController.getBackups);
router.post('/system/backup', protect, restrictTo('admin'), auditLogger(ADMIN_ACTIONS.SYSTEM_BACKUP), adminController.backupSystem);
router.post('/system/restore', protect, restrictTo('admin'), auditLogger(ADMIN_ACTIONS.SYSTEM_RESTORE), adminController.restoreSystem);
router.delete('/backup', protect, restrictTo('admin'), auditLogger(ADMIN_ACTIONS.SYSTEM_BACKUP_DELETE), adminController.deleteBackup);

module.exports = router; 