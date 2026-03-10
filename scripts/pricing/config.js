window.vendorVerifyPricing = {
  plans: [
    {
      id: 'basic',
      name: 'Basic Vendor Verification',
      homeLabel: 'Starter',
      priceInr: 4999,
      usdApprox: 60,
      description: 'Ideal for foundational checks and onboarding confidence.',
      features: {
        verificationLimits: 'Core verification scope',
        priorityVerification: false,
        apiAccess: false,
      },
    },
    {
      id: 'enhanced',
      name: 'Enhanced Due Diligence',
      homeLabel: 'Enhanced · Recommended',
      priceInr: 11999,
      usdApprox: 145,
      description: 'Expanded risk checks for deeper supplier confidence.',
      features: {
        verificationLimits: 'Expanded verification scope',
        priorityVerification: true,
        apiAccess: false,
      },
    },
    {
      id: 'strategic',
      name: 'Strategic Investigation',
      homeLabel: 'Strategic',
      priceInr: 24999,
      usdApprox: 290,
      description: 'Comprehensive due diligence for critical vendor decisions.',
      features: {
        verificationLimits: 'Comprehensive verification scope',
        priorityVerification: true,
        apiAccess: true,
      },
    },
  ],
  addOns: [
    { label: 'Vendor Red-Flag Summary', inr: '₹1,999' },
    { label: 'Vendor Credibility Snapshot', inr: '₹1,999' },
    { label: 'Transaction Risk Structuring Advisory', inr: '₹4,999' },
    { label: 'Vendor Monitoring (30 days)', inr: '₹2,999' },
    { label: 'Pre-Transaction Advisory Call', inr: '₹2,500' },
    { label: 'Factory Video Verification', inr: '₹3,000–₹5,000' },
    { label: 'Physical Factory Inspection', inr: '₹10,000–₹25,000' },
    { label: 'Pre-Dispatch Goods Inspection', inr: '₹5,000–₹10,000' },
    { label: 'Third-Party Testing Coordination', inr: '₹3,000 (plus testing charges)' },
  ],
};
