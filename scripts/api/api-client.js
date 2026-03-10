const ApiClient = (() => {
  const STORAGE_KEY = 'vendorverify.vendors';
  const DEFAULT_DELAY_MS = 250;

  const seedVendors = [
    {
      id: 'V-1001',
      companyName: 'Northwind Logistics',
      contactName: 'Avery Cole',
      contactEmail: 'avery@northwind.example',
      serviceCategory: 'Transportation',
      status: 'Pending Review',
      documents: []
    },
    {
      id: 'V-1002',
      companyName: 'Summit Facilities',
      contactName: 'Jordan Lee',
      contactEmail: 'jordan@summit.example',
      serviceCategory: 'Maintenance',
      status: 'Approved',
      documents: []
    }
  ];

  const wait = (ms = DEFAULT_DELAY_MS) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const getStoredVendors = () => {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedVendors));
      return [...seedVendors];
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [...seedVendors];
    } catch (_) {
      return [...seedVendors];
    }
  };

  const saveVendors = (vendors) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
  };

  const createVendor = async (vendorPayload = {}) => {
    await wait();

    const vendors = getStoredVendors();
    const createdVendor = {
      id: `V-${Date.now()}`,
      status: 'Pending Review',
      documents: [],
      createdAt: new Date().toISOString(),
      ...vendorPayload
    };

    vendors.unshift(createdVendor);
    saveVendors(vendors);

    return createdVendor;
  };

  const getVendors = async () => {
    await wait();
    return getStoredVendors();
  };

  const updateVendorStatus = async (vendorId, status) => {
    await wait();

    const vendors = getStoredVendors();
    const vendorIndex = vendors.findIndex((vendor) => vendor.id === vendorId);

    if (vendorIndex === -1) {
      throw new Error('Vendor not found.');
    }

    vendors[vendorIndex] = {
      ...vendors[vendorIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    saveVendors(vendors);
    return vendors[vendorIndex];
  };

  const uploadDocument = async (vendorId, file) => {
    await wait();

    const vendors = getStoredVendors();
    const vendorIndex = vendors.findIndex((vendor) => vendor.id === vendorId);

    if (vendorIndex === -1) {
      throw new Error('Vendor not found.');
    }

    const documentRecord = {
      id: `DOC-${Date.now()}`,
      fileName: file?.name || 'mock-document.pdf',
      mimeType: file?.type || 'application/pdf',
      size: file?.size || 0,
      uploadedAt: new Date().toISOString()
    };

    const existingDocuments = vendors[vendorIndex].documents || [];
    vendors[vendorIndex] = {
      ...vendors[vendorIndex],
      documents: [...existingDocuments, documentRecord],
      updatedAt: new Date().toISOString()
    };

    saveVendors(vendors);
    return documentRecord;
  };

  return {
    createVendor,
    getVendors,
    updateVendorStatus,
    uploadDocument
  };
})();
