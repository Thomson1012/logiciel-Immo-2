import { CONSTANTS } from '../core/constants.js';
import { ProjectManager } from '../managers/projectManager.js';
import { UI } from '../utils/ui.js';
import { TaxCalculator } from '../core/calculator.js';
import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    ThemeManager.init();
    // Initialize Keyboard Navigation
    KeyboardNavigation.init();

    // Tab Navigation between LMNP and SCI
    const taxTabs = document.querySelectorAll('[data-tax-tab]');
    const lmnpContainer = document.getElementById('questionnaire-container');
    const sciContainer = document.getElementById('sci-questionnaire-container');

    taxTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            taxTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Show/hide containers
            const tabType = tab.dataset.taxTab;
            if (tabType === 'lmnp') {
                lmnpContainer.style.display = 'block';
                sciContainer.style.display = 'none';
            } else if (tabType === 'sci') {
                lmnpContainer.style.display = 'none';
                sciContainer.style.display = 'block';
            }

            // Hide results when switching tabs
            resultsContainer.classList.add('hidden');
        });
    });

    // Navigation Logic for LMNP
    const steps = document.querySelectorAll('.question-step[data-step]');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    const restartBtn = document.getElementById('restart-btn');
    const resultsContainer = document.getElementById('results-container');
    const saveBtn = document.getElementById('save-impots-btn');

    let currentStep = 1;

    // --- Project Management Integration ---
    const projectHeader = document.getElementById('project-header');

    // Check for active project
    const currentProject = ProjectManager.getCurrentProject();
    if (currentProject) {
        projectHeader.textContent = `Dossier : ${currentProject.name}`;
        projectHeader.style.display = 'block';
    }

    function showStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            }
        });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep++;
            showStep(currentStep);
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    restartBtn.addEventListener('click', () => {
        currentStep = 1;
        sciCurrentStep = 1;
        showStep(1);
        showSciStep(1);
        lmnpContainer.style.display = 'block';
        sciContainer.style.display = 'none';
        lmnpContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        if (saveBtn) saveBtn.style.display = 'none';

        // Reset to LMNP tab
        taxTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tax-tab="lmnp"]').classList.add('active');
    });

    // Dynamic Form Logic for LMNP
    const regimeSelect = document.getElementById('regime');
    const locationRadios = document.querySelectorAll('input[name="locationType"]');
    const microInfo = document.getElementById('micro-info');
    const reelChargesSection = document.getElementById('reel-charges-section');
    const amortissementGroup = document.getElementById('amortissement-group');

    function updateFormUI() {
        const regime = regimeSelect.value;
        const locationType = document.querySelector('input[name="locationType"]:checked').value;

        // Update Micro Info Text
        if (locationType === 'nu') {
            microInfo.textContent = `Abattement de ${(CONSTANTS.TAX.ABATEMENTS.MICRO_FONCIER * 100).toFixed(0)}% en Nu (Micro-Foncier).`;
        } else {
            microInfo.textContent = `Abattement de ${(CONSTANTS.TAX.ABATEMENTS.MICRO_BIC * 100).toFixed(0)}% en Meublé (Micro-BIC).`;
        }

        // Show/Hide Reel Section
        if (regime === 'reel') {
            reelChargesSection.style.display = 'block';
            microInfo.style.display = 'none';
        } else {
            reelChargesSection.style.display = 'none';
            microInfo.style.display = 'block';
        }

        // Show/Hide Amortissement (Only for LMNP Réel)
        if (regime === 'reel' && locationType === 'meuble') {
            amortissementGroup.style.display = 'block';
        } else {
            amortissementGroup.style.display = 'none';
        }
    }

    regimeSelect.addEventListener('change', updateFormUI);
    locationRadios.forEach(radio => radio.addEventListener('change', updateFormUI));

    // Initial UI Update
    updateFormUI();

    // Calculation Logic for LMNP
    const calculateBtn = document.getElementById('calculate-tax');

    calculateBtn.addEventListener('click', () => {
        const income = parseFloat(document.getElementById('rental-income').value) || 0;
        const regime = regimeSelect.value;
        const locationType = document.querySelector('input[name="locationType"]:checked').value;
        const tmi = parseFloat(document.getElementById('tmi').value);

        let taxableBase = 0;
        let charges = 0;
        let cashCharges = 0; // Charges that are cash out (not amortissement)

        if (regime === 'micro') {
            if (locationType === 'nu') {
                taxableBase = TaxCalculator.calculateMicroFoncier(income);
            } else {
                taxableBase = TaxCalculator.calculateMicroBIC(income);
            }
        } else {
            // Réel
            const deductibleCharges = parseFloat(document.getElementById('deductible-charges').value) || 0;
            const loanInterest = parseFloat(document.getElementById('loan-interest').value) || 0;
            let amortissement = 0;

            if (locationType === 'meuble') {
                amortissement = parseFloat(document.getElementById('amortissement').value) || 0;
            }

            taxableBase = TaxCalculator.calculateReel(income, deductibleCharges, loanInterest, amortissement);
            cashCharges = deductibleCharges + loanInterest;
        }

        const taxResult = TaxCalculator.calculateTax(taxableBase, tmi);
        const calculatedNetIncome = TaxCalculator.calculateNetIncome(income, taxResult.total, cashCharges);
        const globalRate = income > 0 ? (taxResult.total / income) * 100 : 0;

        // Display Results
        document.getElementById('res-gross-income').textContent = UI.formatCurrency(income);
        document.getElementById('res-taxable-base').textContent = UI.formatCurrency(taxableBase);
        document.getElementById('res-ir').textContent = UI.formatCurrency(taxResult.ir);
        document.getElementById('res-ps').textContent = UI.formatCurrency(taxResult.ps);
        document.getElementById('res-total-tax').textContent = UI.formatCurrency(taxResult.total);
        document.getElementById('res-net-income').textContent = UI.formatCurrency(calculatedNetIncome);
        document.getElementById('res-global-rate').textContent = globalRate.toFixed(1) + ' %';

        // Show Results Container
        lmnpContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Save Logic
        if (saveBtn) {
            saveBtn.style.display = 'block';
            saveBtn.onclick = () => {
                const currentId = ProjectManager.getCurrentProjectId();
                if (!currentId) {
                    UI.showToast("Veuillez d'abord créer ou sélectionner un dossier sur la page principale.", "warning");
                    return;
                }

                ProjectManager.updateProject(currentId, 'impots', {
                    type: 'lmnp',
                    inputs: { income, regime, locationType, tmi },
                    results: { taxableBase, totalTax: taxResult.total, calculatedNetIncome }
                });

                UI.showToast("Estimation sauvegardée dans le dossier !", "success");
            };
        }
    });

    // ===== SCI LOGIC =====
    const sciSteps = document.querySelectorAll('.question-step[data-sci-step]');
    const sciNextBtns = document.querySelectorAll('.sci-next-step');
    const sciPrevBtns = document.querySelectorAll('.sci-prev-step');
    const sciRegimeRadios = document.querySelectorAll('input[name="sciRegime"]');
    const sciIrInfo = document.getElementById('sci-ir-info');
    const sciIsInfo = document.getElementById('sci-is-info');
    const sciAmortissementGroup = document.getElementById('sci-amortissement-group');
    const sciIrAssociateSection = document.getElementById('sci-ir-associate-section');
    const calculateSciBtn = document.getElementById('calculate-sci-tax');

    let sciCurrentStep = 1;

    function showSciStep(stepNumber) {
        sciSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.sciStep) === stepNumber) {
                step.classList.add('active');
            }
        });
    }

    sciNextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sciCurrentStep++;
            showSciStep(sciCurrentStep);
        });
    });

    sciPrevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sciCurrentStep--;
            showSciStep(sciCurrentStep);
        });
    });

    // SCI Regime Change Logic
    function updateSciFormUI() {
        const sciRegime = document.querySelector('input[name="sciRegime"]:checked').value;

        if (sciRegime === 'ir') {
            sciIrInfo.style.display = 'block';
            sciIsInfo.style.display = 'none';
            sciAmortissementGroup.style.display = 'none';
            sciIrAssociateSection.style.display = 'block';
        } else {
            sciIrInfo.style.display = 'none';
            sciIsInfo.style.display = 'block';
            sciAmortissementGroup.style.display = 'block';
            sciIrAssociateSection.style.display = 'none';
        }
    }

    sciRegimeRadios.forEach(radio => radio.addEventListener('change', updateSciFormUI));
    updateSciFormUI();

    // SCI Tax Calculation
    calculateSciBtn.addEventListener('click', () => {
        const sciIncome = parseFloat(document.getElementById('sci-rental-income').value) || 0;
        const sciRegime = document.querySelector('input[name="sciRegime"]:checked').value;
        const sciCharges = parseFloat(document.getElementById('sci-charges').value) || 0;
        const sciInterest = parseFloat(document.getElementById('sci-interest').value) || 0;

        let taxableBase = 0;
        let totalTax = 0;
        let netIncome = 0;
        let ir = 0;
        let ps = 0;

        if (sciRegime === 'ir') {
            // SCI à l'IR - Transparence fiscale
            const quotePart = parseFloat(document.getElementById('sci-quote-part').value) || 100;
            const tmi = parseFloat(document.getElementById('sci-tmi').value);

            // Calculate taxable base for the SCI
            const sciBenefice = sciIncome - sciCharges - sciInterest;

            // Associate's share
            const associateShare = sciBenefice * (quotePart / 100);
            taxableBase = Math.max(0, associateShare);

            // Tax calculation for the associate
            const taxResult = TaxCalculator.calculateTax(taxableBase, tmi);
            ir = taxResult.ir;
            ps = taxResult.ps;
            totalTax = taxResult.total;

            // Net income for the associate (share of income - share of charges - taxes)
            const associateIncome = sciIncome * (quotePart / 100);
            const associateCharges = (sciCharges + sciInterest) * (quotePart / 100);
            netIncome = associateIncome - associateCharges - totalTax;

        } else {
            // SCI à l'IS - Impôt sur les sociétés
            const sciAmortissement = parseFloat(document.getElementById('sci-amortissement').value) || 0;

            // Calculate taxable profit
            const benefice = sciIncome - sciCharges - sciInterest - sciAmortissement;
            taxableBase = Math.max(0, benefice);

            // Calculate IS (15% up to 42,500€, then 25%)
            if (taxableBase <= CONSTANTS.TAX.IS.REDUCED_THRESHOLD) {
                ir = taxableBase * CONSTANTS.TAX.IS.REDUCED_RATE;
            } else {
                ir = (CONSTANTS.TAX.IS.REDUCED_THRESHOLD * CONSTANTS.TAX.IS.REDUCED_RATE) +
                    ((taxableBase - CONSTANTS.TAX.IS.REDUCED_THRESHOLD) * CONSTANTS.TAX.IS.NORMAL_RATE);
            }

            // No social contributions for IS
            ps = 0;
            totalTax = ir;

            // Net profit after IS (before dividend distribution)
            netIncome = taxableBase - totalTax;
        }

        const globalRate = sciIncome > 0 ? (totalTax / sciIncome) * 100 : 0;

        // Display Results
        document.getElementById('res-gross-income').textContent = UI.formatCurrency(sciIncome);
        document.getElementById('res-taxable-base').textContent = UI.formatCurrency(taxableBase);
        document.getElementById('res-ir').textContent = UI.formatCurrency(ir);

        // Update PS label for SCI à l'IS
        const psLabel = document.querySelector('#results-container .result-row:nth-child(4) span:first-child');
        if (sciRegime === 'is') {
            psLabel.textContent = 'Prélèvements Sociaux';
            document.getElementById('res-ps').textContent = 'N/A (IS)';
        } else {
            psLabel.textContent = 'Prélèvements Sociaux (17.2%)';
            document.getElementById('res-ps').textContent = UI.formatCurrency(ps);
        }

        document.getElementById('res-total-tax').textContent = UI.formatCurrency(totalTax);
        document.getElementById('res-net-income').textContent = UI.formatCurrency(netIncome);
        document.getElementById('res-global-rate').textContent = globalRate.toFixed(1) + ' %';

        // Show Results Container
        sciContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Save Logic
        if (saveBtn) {
            saveBtn.style.display = 'block';
            saveBtn.onclick = () => {
                const currentId = ProjectManager.getCurrentProjectId();
                if (!currentId) {
                    UI.showToast("Veuillez d'abord créer ou sélectionner un dossier sur la page principale.", "warning");
                    return;
                }

                ProjectManager.updateProject(currentId, 'impots', {
                    type: 'sci',
                    inputs: {
                        sciIncome,
                        sciRegime,
                        sciCharges,
                        sciInterest,
                        quotePart: sciRegime === 'ir' ? parseFloat(document.getElementById('sci-quote-part').value) : null,
                        tmi: sciRegime === 'ir' ? parseFloat(document.getElementById('sci-tmi').value) : null,
                        amortissement: sciRegime === 'is' ? parseFloat(document.getElementById('sci-amortissement').value) : null
                    },
                    results: { taxableBase, totalTax, netIncome }
                });

                UI.showToast("Estimation SCI sauvegardée dans le dossier !", "success");
            };
        }
    });
});
