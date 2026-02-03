// HDD Quote Calculator Logic

document.addEventListener('DOMContentLoaded', function() {
  initCalculator();
});

function initCalculator() {
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const form = document.getElementById('quote-form');

  // Update sqft display on dimension change
  lengthInput.addEventListener('input', updateSqft);
  widthInput.addEventListener('input', updateSqft);

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateQuote();
  });

  // Initial sqft calculation
  updateSqft();
}

function updateSqft() {
  const length = parseInt(document.getElementById('length').value) || 0;
  const width = parseInt(document.getElementById('width').value) || 0;
  const sqft = length * width;
  document.getElementById('sqft').textContent = sqft.toLocaleString();
}

function calculateQuote() {
  // Get inputs
  const length = parseInt(document.getElementById('length').value) || 0;
  const width = parseInt(document.getElementById('width').value) || 0;
  const sqft = length * width;
  const perimeter = 2 * (length + width);

  const material = document.querySelector('input[name="material"]:checked').value;
  const height = document.querySelector('input[name="height"]:checked').value;
  const features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);

  // Calculate base price
  const baseLow = sqft * CONFIG.basePricePerSqFt.low;
  const baseHigh = sqft * CONFIG.basePricePerSqFt.high;

  // Apply material multiplier
  const materialConfig = CONFIG.materials[material];
  const materialLow = baseLow * materialConfig.multiplier;
  const materialHigh = baseHigh * materialConfig.multiplier;

  // Add height adjustment
  const heightConfig = CONFIG.heightAdjustments[height];
  const heightLow = heightConfig.low;
  const heightHigh = heightConfig.high;

  // Calculate features
  let featuresLow = 0;
  let featuresHigh = 0;
  const featureBreakdown = [];

  features.forEach(featureKey => {
    const feature = CONFIG.features[featureKey];
    if (feature) {
      let fLow = feature.low;
      let fHigh = feature.high;

      // Adjust for perimeter-based features
      if (feature.perLinearFoot) {
        // Rough estimate: assume 60% of perimeter needs the feature
        const adjustedPerimeter = perimeter * 0.6;
        fLow = Math.round(fLow * (adjustedPerimeter / 40)); // Normalize to 40 linear feet
        fHigh = Math.round(fHigh * (adjustedPerimeter / 40));
      }

      featuresLow += fLow;
      featuresHigh += fHigh;

      featureBreakdown.push({
        name: feature.name,
        low: fLow,
        high: fHigh
      });
    }
  });

  // Calculate totals
  let totalLow = materialLow + heightLow + featuresLow;
  let totalHigh = materialHigh + heightHigh + featuresHigh;

  // Apply variance
  totalLow = Math.round(totalLow * CONFIG.variance.low);
  totalHigh = Math.round(totalHigh * CONFIG.variance.high);

  // Apply minimum
  totalLow = Math.max(totalLow, CONFIG.minimumPrice);
  totalHigh = Math.max(totalHigh, CONFIG.minimumPrice);

  // Round to nearest $100
  totalLow = Math.round(totalLow / 100) * 100;
  totalHigh = Math.round(totalHigh / 100) * 100;

  // Display results
  displayResults({
    sqft,
    material: materialConfig.name,
    baseLow: Math.round(materialLow),
    baseHigh: Math.round(materialHigh),
    heightLow,
    heightHigh,
    heightDesc: heightConfig.description,
    features: featureBreakdown,
    totalLow,
    totalHigh
  });
}

function displayResults(data) {
  // Update estimate range
  document.getElementById('low-estimate').textContent = formatCurrency(data.totalLow);
  document.getElementById('high-estimate').textContent = formatCurrency(data.totalHigh);

  // Update breakdown
  document.getElementById('breakdown-sqft').textContent = data.sqft.toLocaleString();
  document.getElementById('breakdown-base').textContent = formatCurrency(data.baseLow) + ' - ' + formatCurrency(data.baseHigh);
  document.getElementById('breakdown-material').textContent = data.material;
  
  // Height row
  if (data.heightLow === 0 && data.heightHigh === 0) {
    document.getElementById('row-height').style.display = 'none';
  } else {
    document.getElementById('row-height').style.display = 'flex';
    document.getElementById('breakdown-height').textContent = '+' + formatCurrency(data.heightLow) + ' - ' + formatCurrency(data.heightHigh);
  }

  // Features breakdown
  const featuresContainer = document.getElementById('features-breakdown');
  featuresContainer.innerHTML = '';

  data.features.forEach(feature => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `
      <span>${feature.name}</span>
      <span>+${formatCurrency(feature.low)} - ${formatCurrency(feature.high)}</span>
    `;
    featuresContainer.appendChild(row);
  });

  // Total
  const avgTotal = Math.round((data.totalLow + data.totalHigh) / 2 / 100) * 100;
  document.getElementById('breakdown-total').textContent = '~' + formatCurrency(avgTotal);

  // Show results section
  document.getElementById('results').classList.remove('hidden');
  
  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Track calculation (if analytics is set up)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'quote_calculated', {
      sqft: data.sqft,
      material: data.material,
      estimate_low: data.totalLow,
      estimate_high: data.totalHigh
    });
  }
}

function formatCurrency(value) {
  return '$' + value.toLocaleString();
}

function resetForm() {
  document.getElementById('results').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
