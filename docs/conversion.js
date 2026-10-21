// ================================================
// MEQ Calculator — Conversion Logic
// ================================================
// CRITICAL: All conversion formulas below are IDENTICAL
// to the original implementation. Do NOT modify these
// calculations without medical review.
// ================================================

// Helper function to calculate methadone MEQ based on dose
// FORMULA: 1-20mg: ×4 | 21-40mg: ×8 | 41-60mg: ×10 | 61+mg: ×12
function methadoneMEQ(dose) {
    if (dose >= 61) return dose * 12;
    else if (dose >= 41) return dose * 10;
    else if (dose >= 21) return dose * 8;
    else if (dose >= 1) return dose * 4;
    return 0;
}

// Function to safely parse float and default to zero if NaN
function safeParseFloat(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

// Unit state for Hydromorphone Oral (default: mg; 1 tablet = 8mg)
let currentHmoUnit = 'mg';

function setHmoUnit(unit, convertValue = true) {
    if (unit !== 'mg' && unit !== 'tablets') return;
    if (currentHmoUnit === unit && convertValue) return;

    const oldUnit = currentHmoUnit;
    currentHmoUnit = unit;

    const hmoInput = document.getElementById('hmo');
    const unitLabel = document.getElementById('hmo-unit-label');
    const factorLabel = document.getElementById('hmo-factor');
    const mgBtn = document.getElementById('hmo-toggle-mg');
    const tabsBtn = document.getElementById('hmo-toggle-tabs');

    if (unit === 'tablets') {
        mgBtn?.classList.remove('active');
        mgBtn?.setAttribute('aria-pressed', 'false');
        tabsBtn?.classList.add('active');
        tabsBtn?.setAttribute('aria-pressed', 'true');
        
        if (unitLabel) unitLabel.textContent = 'tabs';
        if (factorLabel) factorLabel.textContent = '×32';
        if (hmoInput) hmoInput.setAttribute('aria-label', 'Hydromorphone Oral daily dose in 8mg tablets');
    } else {
        tabsBtn?.classList.remove('active');
        tabsBtn?.setAttribute('aria-pressed', 'false');
        mgBtn?.classList.add('active');
        mgBtn?.setAttribute('aria-pressed', 'true');
        
        if (unitLabel) unitLabel.textContent = 'mg';
        if (factorLabel) factorLabel.textContent = '×4';
        if (hmoInput) hmoInput.setAttribute('aria-label', 'Hydromorphone Oral daily dose in mg');
    }

    // Convert value if currently populated
    if (convertValue && hmoInput && hmoInput.value !== '') {
        const val = parseFloat(hmoInput.value);
        if (!isNaN(val) && val > 0) {
            if (unit === 'tablets' && oldUnit === 'mg') {
                // mg to tablets (1 tab = 8mg)
                hmoInput.value = Number((val / 8).toFixed(2));
            } else if (unit === 'mg' && oldUnit === 'tablets') {
                // tablets to mg
                hmoInput.value = Number((val * 8).toFixed(2));
            }
        }
    }

    updateMorphineEquivalence();
}

// Unit state for Fentanyl Transdermal (default: mcg/hr; 1 patch = 50 mcg/hr)
let currentFentanylUnit = 'mcg';

function setFentanylUnit(unit, convertValue = true) {
    if (unit !== 'mcg' && unit !== 'patches') return;
    if (currentFentanylUnit === unit && convertValue) return;

    const oldUnit = currentFentanylUnit;
    currentFentanylUnit = unit;

    const fentanylInput = document.getElementById('fentanyl');
    const unitLabel = document.getElementById('fentanyl-unit-label');
    const factorLabel = document.getElementById('fentanyl-factor');
    const mcgBtn = document.getElementById('fentanyl-toggle-mcg');
    const patchesBtn = document.getElementById('fentanyl-toggle-patches');

    if (unit === 'patches') {
        mcgBtn?.classList.remove('active');
        mcgBtn?.setAttribute('aria-pressed', 'false');
        patchesBtn?.classList.add('active');
        patchesBtn?.setAttribute('aria-pressed', 'true');
        
        if (unitLabel) unitLabel.textContent = 'patches';
        if (factorLabel) factorLabel.textContent = '×200';
        if (fentanylInput) fentanylInput.setAttribute('aria-label', 'Fentanyl Transdermal daily dose in 50 mcg/hr patches');
    } else {
        patchesBtn?.classList.remove('active');
        patchesBtn?.setAttribute('aria-pressed', 'false');
        mcgBtn?.classList.add('active');
        mcgBtn?.setAttribute('aria-pressed', 'true');
        
        if (unitLabel) unitLabel.textContent = 'mcg/hr';
        if (factorLabel) factorLabel.textContent = '×4';
        if (fentanylInput) fentanylInput.setAttribute('aria-label', 'Fentanyl Transdermal daily dose in mcg/hr');
    }

    // Convert value if currently populated
    if (convertValue && fentanylInput && fentanylInput.value !== '') {
        const val = parseFloat(fentanylInput.value);
        if (!isNaN(val) && val > 0) {
            if (unit === 'patches' && oldUnit === 'mcg') {
                // mcg/hr to patches (1 patch = 50 mcg/hr)
                fentanylInput.value = Number((val / 50).toFixed(2));
            } else if (unit === 'mcg' && oldUnit === 'patches') {
                // patches to mcg/hr
                fentanylInput.value = Number((val * 50).toFixed(2));
            }
        }
    }

    updateMorphineEquivalence();
}

// Reset all inputs and recalculate
function resetInputs() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        // Preserve the default value for SfentanylPct
        if (input.id === 'SfentanylPct') {
            input.value = '4.4';
        } else {
            input.value = '';
        }
    });
    
    // Reset unit toggles to defaults
    setHmoUnit('mg', false);
    setFentanylUnit('mcg', false);
    
    // Remove active state from all cards
    document.querySelectorAll('.drug-card').forEach(card => {
        card.classList.remove('active');
    });
    
    updateMorphineEquivalence();
}

// Button event listeners
document.getElementById('resetButton').addEventListener('click', resetInputs);
document.getElementById('printButton').addEventListener('click', function() {
    window.print();
});

// ================================================
// MAIN CONVERSION FUNCTION
// All formulas are preserved exactly as original
// ================================================
function updateMorphineEquivalence() {
    // Read all input values
    let hmo = safeParseFloat(document.getElementById('hmo').value);
    let kadian = safeParseFloat(document.getElementById('kadian').value);
    let methadone = safeParseFloat(document.getElementById('methadone').value);
    let fentanyl = safeParseFloat(document.getElementById('fentanyl').value);
    let oxycodone = safeParseFloat(document.getElementById('oxycodone').value);
    let SfentanylPts = safeParseFloat(document.getElementById('SfentanylPts').value);
    let SfentanylPct = safeParseFloat(document.getElementById('SfentanylPct').value, 4.4);

    // ================================================
    // CONVERSION CALCULATIONS
    // ================================================

    // Hydromorphone Oral: dose × 4 (or 1 tablet = 8mg -> dose × 32)
    let hmoMg = (currentHmoUnit === 'tablets') ? (hmo * 8) : hmo;
    let hmoMEQ = 0;
    if (hmoMg > 0) {
        hmoMEQ = hmoMg * 4;
    }
    let m0 = Math.round(hmoMEQ);

    // Morphine Oral (Kadian): dose × 1 (no negatives)
    let kadianMEQ = 0;
    if (kadian > 0) {
        kadianMEQ = kadian;
    }
    let m2 = Math.round(kadianMEQ);

    // Methadone: scaled multiplier (handled by methadoneMEQ helper)
    let m3 = Math.round(methadoneMEQ(methadone));

    // Fentanyl Transdermal: dose × 4 (or 1 patch = 50 mcg/hr -> dose × 200)
    let fentanylMcg = (currentFentanylUnit === 'patches') ? (fentanyl * 50) : fentanyl;
    let fentanylMEQ = 0;
    if (fentanylMcg > 0) {
        fentanylMEQ = fentanylMcg * 4;
    }
    let m4 = Math.round(fentanylMEQ);

    // Oxycodone Oral: dose × 1.5 (no negatives)
    let oxycodoneMEQ = 0;
    if (oxycodone > 0) {
        oxycodoneMEQ = oxycodone * 1.5;
    }
    let m5 = Math.round(oxycodoneMEQ);

    // Street Fentanyl: Points × (Percentage × 100)
    let m6 = Math.round(SfentanylPts * (SfentanylPct * 100));

    // ================================================
    // DISPLAY RESULTS
    // ================================================
    
    // Update MEQ display values
    document.getElementById('m0').textContent = m0;
    document.getElementById('m2').textContent = m2;
    document.getElementById('m3').textContent = m3;
    document.getElementById('m4').textContent = m4;
    document.getElementById('m5').textContent = m5;
    document.getElementById('m6').textContent = m6;

    // Calculate subtotal (all prescribed drugs)
    let subtotal = m0 + m2 + m3 + m4 + m5;
    
    // Calculate total including street fentanyl
    let totalMorphine = subtotal + m6;

    // Update displays
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('totalMorphine');
    
    subtotalEl.textContent = subtotal + ' mg';
    totalEl.textContent = totalMorphine + ' mg';

    // Add pulse animation on value change
    if (subtotal > 0) {
        subtotalEl.classList.add('pulse');
        setTimeout(() => subtotalEl.classList.remove('pulse'), 400);
    }

    // Update active states on cards based on input
    updateCardStates({
        'card-hmo': hmo,
        'card-kadian': kadian,
        'card-methadone': methadone,
        'card-fentanyl': fentanyl,
        'card-oxycodone': oxycodone
    });
    
    // Update MEQ value highlight states
    updateMEQHighlights({
        'm0': m0, 'm2': m2, 'm3': m3,
        'm4': m4, 'm5': m5, 'm6': m6
    });
}


// ================================================
// UI ENHANCEMENT FUNCTIONS (no formula changes)
// ================================================

// Add/remove active class on cards that have values
function updateCardStates(cardValues) {
    for (const [cardId, value] of Object.entries(cardValues)) {
        const card = document.getElementById(cardId);
        if (card) {
            if (value > 0) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        }
    }
}

// Update MEQ value color when non-zero
function updateMEQHighlights(meqValues) {
    for (const [id, value] of Object.entries(meqValues)) {
        const el = document.getElementById(id);
        if (el) {
            if (value > 0) {
                el.classList.add('has-value');
            } else {
                el.classList.remove('has-value');
            }
        }
    }
}


// ================================================
// INITIALIZATION & EVENT LISTENERS
// ================================================

// Unit toggle button listeners
document.getElementById('hmo-toggle-mg')?.addEventListener('click', () => setHmoUnit('mg'));
document.getElementById('hmo-toggle-tabs')?.addEventListener('click', () => setHmoUnit('tablets'));
document.getElementById('fentanyl-toggle-mcg')?.addEventListener('click', () => setFentanylUnit('mcg'));
document.getElementById('fentanyl-toggle-patches')?.addEventListener('click', () => setFentanylUnit('patches'));

// Attach input listeners to all number inputs
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', updateMorphineEquivalence);
});

// Run calculation on page load
document.addEventListener('DOMContentLoaded', updateMorphineEquivalence);

// ================================================
// PWA SERVICE WORKER REGISTRATION
// ================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}
