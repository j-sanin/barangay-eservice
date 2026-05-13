const express = require('express');
const router  = express.Router();

const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',       protect,            createRequest);  // Resident: submit request
router.get('/mine',    protect,            getMyRequests);  // Resident: view own requests
router.get('/',        protect, adminOnly, getAllRequests); // Admin: view all requests
router.put('/:id',     protect, adminOnly, updateRequest);  // Admin: approve/complete/reject
router.delete('/:id',  protect, adminOnly, deleteRequest);  // Admin: delete request

module.exports = router;
