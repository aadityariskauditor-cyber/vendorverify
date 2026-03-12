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
    { label: 'Factory Verification', inr: '₹7,999' },
    { label: 'Director Background Check', inr: '₹3,999' },
    { label: 'Litigation Deep Scan', inr: '₹4,999' },
    { label: 'Financial Health Review', inr: '₹6,999' },
  ],
};
