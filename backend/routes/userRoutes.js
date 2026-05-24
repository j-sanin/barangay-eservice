const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, getAllUsers, searchUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.get('/profile',  protect, getProfile);
router.put('/profile',  protect, updateProfile);
router.get('/all', protect, adminOnly, getAllUsers);
router.get('/search', protect, adminOnly, searchUsers);

module.exports = router;
