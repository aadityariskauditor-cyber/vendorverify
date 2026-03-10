const express = require('express');
const {
  listVendors,
  addVendor,
  editVendor,
  removeVendor,
  approveVendor,
  rejectVendor,
} = require('../controllers/vendorController');

const router = express.Router();

router.get('/', listVendors);
router.post('/', addVendor);
router.put('/:id', editVendor);
router.delete('/:id', removeVendor);
router.post('/:id/approve', approveVendor);
router.post('/:id/reject', rejectVendor);

module.exports = router;
