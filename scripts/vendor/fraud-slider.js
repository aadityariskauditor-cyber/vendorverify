(() => {
  const sliderRoot = document.getElementById('fraudSlider');
  const nextButton = document.getElementById('fraudNext');
  const prevButton = document.getElementById('fraudPrev');
  const debug = window.VendorVerifyDebug;

  const fraudCases = [
    {
      title: 'Fake GST Supplier',
      description: 'Companies create new GST registrations and disappear after collecting advance payments.',
      indicators: ['Recently issued GST', 'No filing history', 'Suspicious address'],
    },
    {
      title: 'Non-existent Factory',
      description: 'Vendor claims manufacturing capability but no active facility exists at the declared location.',
      indicators: ['No geotagged proof', 'Shared or closed premise', 'Repeated site-visit delays'],
    },
    {
      title: 'Shell Trading Company',
      description: 'Entity acts as a pass-through with low operational depth and elevated payment default risk.',
      indicators: ['Minimal employee footprint', 'High invoice turnover mismatch', 'No physical operations evidence'],
    },
    {
      title: 'Fake Export Supplier',
      description: 'Vendor fabricates export credentials to justify urgent high-value advance requests.',
      indicators: ['Unverifiable export history', 'Inconsistent shipping documents', 'Pressure for immediate payment'],
    },
  ];

  let activeIndex = 0;

  function renderCard(index) {
    if (!sliderRoot) return;

    const card = fraudCases[index];
    sliderRoot.innerHTML = `
      <article class="fraud-case-card" data-active-card="${index}">
        <h4>${card.title}</h4>
        <p>${card.description}</p>
        <p><strong>Risk indicators:</strong></p>
        <ul>
          ${card.indicators.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </article>
    `;
  }

  function nextCard() {
    activeIndex = (activeIndex + 1) % fraudCases.length;
    renderCard(activeIndex);
  }

  function previousCard() {
    activeIndex = (activeIndex - 1 + fraudCases.length) % fraudCases.length;
    renderCard(activeIndex);
  }

  if (sliderRoot) {
    renderCard(activeIndex);
    nextButton?.addEventListener('click', nextCard);
    prevButton?.addEventListener('click', previousCard);
    debug?.log?.('Fraud slider initialized');
  }

  window.VendorVerifyFraudSlider = {
    nextCard,
    previousCard,
    getActiveCard: () => activeIndex,
  };
})();
