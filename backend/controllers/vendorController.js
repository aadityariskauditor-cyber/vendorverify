const {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  setVendorStatus,
} = require('../models/vendorModel');

async function listVendors(req, res) {
  try {
    const vendors = await getAllVendors();
    return res.json(vendors);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch vendors.' });
  }
}

async function addVendor(req, res) {
  try {
    const required = ['companyName', 'contactPerson', 'email'];
    const missing = required.find((key) => !req.body[key]);

    if (missing) {
      return res.status(400).json({ message: `Missing required field: ${missing}` });
    }

    const vendor = await createVendor(req.body, req.user?.id);
    return res.status(201).json(vendor);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create vendor.' });
  }
}

async function editVendor(req, res) {
  try {
    const vendor = await updateVendor(req.params.id, req.body);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    return res.json(vendor);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update vendor.' });
  }
}

async function removeVendor(req, res) {
  try {
    const deleted = await deleteVendor(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete vendor.' });
  }
}

async function approveVendor(req, res) {
  try {
    const vendor = await setVendorStatus(req.params.id, 'Approved');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    return res.json(vendor);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to approve vendor.' });
  }
}

async function rejectVendor(req, res) {
  try {
    const vendor = await setVendorStatus(req.params.id, 'Rejected');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    return res.json(vendor);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reject vendor.' });
  }
}

module.exports = {
  listVendors,
  addVendor,
  editVendor,
  removeVendor,
  approveVendor,
  rejectVendor,
};
