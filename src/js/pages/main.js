/**
 * Main Entry Point for index.html
 * Imports all necessary modules and initializes the application
 */

import { CONSTANTS } from '../core/constants.js';
import { CreditCalculator, ProfitabilityCalculator, TaxCalculator, CapacityCalculator } from '../core/calculator.js';
import { Security } from '../utils/security.js';
import { UI } from '../utils/ui.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { ProjectManager } from '../managers/projectManager.js';
import { UIManager } from '../managers/uiManager.js';
import { ChartManager } from '../managers/chartManager.js';
import { ModeManager } from '../managers/modeManager.js';
import { ExampleLoader } from '../utils/exampleScenarios.js';
import { FormValidator } from '../utils/formValidator.js';
import { PDFExport } from '../utils/pdfExport.js';
import { ExcelExport } from '../utils/excelExport.js';

// ... (existing imports)

window.PDFExport = PDFExport;
window.ExcelExport = ExcelExport;



import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

// Make modules globally available for inline event handlers
window.CONSTANTS = CONSTANTS;
window.CreditCalculator = CreditCalculator;
window.ProfitabilityCalculator = ProfitabilityCalculator;
window.TaxCalculator = TaxCalculator;
window.CapacityCalculator = CapacityCalculator;
window.Security = Security;
window.UI = UI;
window.ErrorHandler = ErrorHandler;
window.ProjectManager = ProjectManager;
window.UIManager = UIManager;
window.ChartManager = ChartManager;
window.ModeManager = ModeManager;
window.ExampleLoader = ExampleLoader;
window.FormValidator = FormValidator;
window.PDFExport = PDFExport;
window.ExcelExport = ExcelExport;
window.ThemeManager = ThemeManager;
window.KeyboardNavigation = KeyboardNavigation;


document.addEventListener('DOMContentLoaded', () => {
    // --- Force Dark Theme (Set dark theme as default preference) ---
    localStorage.setItem('theme-preference', 'dark');

    // --- Theme Manager (Dark/Light Mode) ---
    ThemeManager.init();

    // --- Initialize Keyboard Navigation (WCAG AA) ---
    KeyboardNavigation.init();

    // --- Initialization ---
    initTabs();
    initForms();
    initProjectManagement();

    // --- Mode Manager (Phase 1.1) ---
    ModeManager.init();

    // --- Example Loader (Phase 1.2) ---
    ExampleLoader.init();

    // --- Form Validator (Phase 1.3) ---
    FormValidator.init();

    // --- Input Animations ---
    if (UI && UI.setupInputAnimations) {
        UI.setupInputAnimations();
    }

    // --- Mobile Sidebar Logic ---
    initMobileSidebar();

    // --- DPE Modal Logic ---
    initDPEModal();

    // --- Disclaimer Tooltips ---
    initDisclaimerTooltips();
});

// ---Tab Logic ---
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    console.log('initTabs: Found', tabs.length, 'tabs and', contents.length, 'contents');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tab.dataset.tab);

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            console.log('Looking for element with ID:', targetId);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.classList.add('active');
                console.log('Activated tab:', targetId);
            } else {
                console.error('Tab content not found for ID:', targetId);
            }
        });
    });
}

// --- Forms Logic ---
function initForms() {
    initCreditForm();
    initProfitForm();
    initTargetPriceForm();
    initCapacityForm();
}

function initCreditForm() {
    const loanForm = document.getElementById('loan-form');
    const loanResults = document.getElementById('results');

    if (loanForm) {
        loanForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate inputs using Security module with realistic limits
            // Validate inputs using Security module with centralized limits
            const LIMITS = CONSTANTS.VALIDATION.CREDIT;
            const amountValidation = Security.validateNumber(
                document.getElementById('amount').value,
                { required: true, min: LIMITS.AMOUNT.MIN, max: LIMITS.AMOUNT.MAX, allowZero: false }
            );
            const rateValidation = Security.validateNumber(
                document.getElementById('rate').value,
                { required: true, min: LIMITS.RATE.MIN, max: LIMITS.RATE.MAX, allowZero: true }
            );
            const yearsValidation = Security.validateNumber(
                document.getElementById('years').value,
                { required: true, min: LIMITS.YEARS.MIN, max: LIMITS.YEARS.MAX, allowZero: false }
            );

            // Check for validation errors
            if (!amountValidation.valid) { UI.showToast(amountValidation.error, "error"); return; }
            if (!rateValidation.valid) { UI.showToast(rateValidation.error, "error"); return; }
            if (!yearsValidation.valid) { UI.showToast(yearsValidation.error, "error"); return; }

            const amount = amountValidation.value;
            const rate = rateValidation.value;
            const years = yearsValidation.value;

            try {
                const monthly = CreditCalculator.calculateMonthlyPayment(amount, rate, years);

                if (monthly > 0) {
                    const totalPayment = CreditCalculator.calculateTotalPayment(monthly, years);
                    const totalInterest = CreditCalculator.calculateTotalInterest(totalPayment, amount);

                    loanResults.classList.remove('hidden');

                    document.getElementById('monthly-payment').textContent = UI.formatCurrency(monthly);
                    document.getElementById('total-payment').textContent = UI.formatCurrency(totalPayment);
                    document.getElementById('total-interest').textContent = UI.formatCurrency(totalInterest);

                    // Generate chart
                    if (ChartManager) {
                        ChartManager.createAmortizationChart('credit-chart', amount, rate, years);
                    }

                    // Setup PDF export
                    const exportBtn = document.getElementById('export-credit-pdf');
                    if (exportBtn && window.PDFExport) {
                        exportBtn.onclick = () => {
                            window.PDFExport.exportCreditSimulation({
                                amount, rate, years,
                                monthlyPayment: monthly,
                                totalPayment,
                                totalInterest
                            });
                        };
                    }

                    // Setup Excel export
                    const exportExcelBtn = document.getElementById('export-credit-excel');
                    if (exportExcelBtn && window.ExcelExport) {
                        exportExcelBtn.onclick = () => {
                            window.ExcelExport.exportCreditSimulation({
                                amount, rate, years,
                                monthlyPayment: monthly,
                                totalPayment,
                                totalInterest
                            });
                        };
                    }

                    if (window.innerWidth < 600) {
                        loanResults.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    UI.showToast("Erreur de calcul. Vérifiez vos valeurs.", "error");
                }
            } catch (error) {
                console.error("Credit Calculation Error:", error);
                UI.showToast(error.message || "Une erreur est survenue lors du calcul", "error");
            }
        });
    }
}

function initProfitForm() {
    const profitForm = document.getElementById('profit-form');
    const profitResults = document.getElementById('profit-results');

    if (profitForm) {
        // Auto-calculate notary fees
        const priceInput = document.getElementById('price');
        const propertyTypeSelect = document.getElementById('property-type');
        const notaryInput = document.getElementById('notary');
        const notaryAutoInfo = document.getElementById('notary-auto-info');

        const updateNotaryFees = () => {
            const price = parseFloat(priceInput.value) || 0;
            const isNew = propertyTypeSelect.value === 'new';

            if (price > 0 && !notaryInput.value) {
                const autoNotary = ProfitabilityCalculator.calculateNotaryFees(price, isNew);
                notaryInput.value = Math.round(autoNotary);
                notaryAutoInfo.textContent = `✓ Calculé automatiquement (${isNew ? '2.5%' : '7.5%'})`;
            } else if (price > 0) {
                const autoNotary = ProfitabilityCalculator.calculateNotaryFees(price, isNew);
                notaryAutoInfo.textContent = `💡 Suggestion: ${UI.formatCurrency(autoNotary)} (${isNew ? '2.5%' : '7.5%'})`;
            }
        };

        if (priceInput && propertyTypeSelect && notaryInput) {
            priceInput.addEventListener('blur', updateNotaryFees);
            propertyTypeSelect.addEventListener('change', () => {
                notaryInput.value = ''; // Clear manual value on type change
                updateNotaryFees();
            });
        }

        // DPE Alert Logic
        const dpeSelect = document.getElementById('dpe-class');
        const dpeAlert = document.getElementById('dpe-alert');
        const dpeAlertTitle = document.getElementById('dpe-alert-title');
        const dpeAlertMessage = document.getElementById('dpe-alert-message');

        if (dpeSelect && dpeAlert) {
            dpeSelect.addEventListener('change', (e) => {
                const dpeClass = e.target.value;

                if (dpeClass === 'G') {
                    dpeAlert.style.display = 'block';
                    dpeAlert.className = 'result-interpretation error';
                    dpeAlertTitle.textContent = '🚫 Logement Interdit à la Location';
                    dpeAlertMessage.innerHTML = `
                        <strong>Classe G - Interdiction dès le 1er janvier 2025</strong><br>
                        Ce logement est considéré comme une "passoire thermique". Des travaux de rénovation énergétique sont <strong>obligatoires</strong> pour pouvoir le louer.<br>
                        <br>
                        💰 <strong>Coût estimé de rénovation :</strong> ${UI.formatCurrency(CONSTANTS.DPE.RENOVATION_COSTS.G_to_D)}<br>
                        ⚡ <strong>Économie d'énergie estimée :</strong> ${CONSTANTS.DPE.ENERGY_SAVINGS.G_to_D} kWh/m²/an<br>
                        <br>
                        💡 <strong>Conseil :</strong> Intégrez ces travaux dans votre budget initial ou négociez le prix d'achat en conséquence.
                    `;
                } else if (dpeClass === 'F') {
                    dpeAlert.style.display = 'block';
                    dpeAlert.className = 'result-interpretation warning';
                    dpeAlertTitle.textContent = '⚠️ Attention - Interdiction Prochaine';
                    dpeAlertMessage.innerHTML = `
                        <strong>Classe F - Interdiction dès le 1er janvier 2028</strong><br>
                        Vous avez quelques années, mais anticipez des travaux de rénovation énergétique pour continuer à louer ce bien.<br>
                        <br>
                        💰 <strong>Coût estimé de rénovation :</strong> ${UI.formatCurrency(CONSTANTS.DPE.RENOVATION_COSTS.F_to_D)}<br>
                        ⚡ <strong>Économie d'énergie estimée :</strong> ${CONSTANTS.DPE.ENERGY_SAVINGS.F_to_D} kWh/m²/an<br>
                        <br>
                        💡 <strong>Conseil :</strong> Planifiez ces travaux pour améliorer la rentabilité et la valeur du bien.
                    `;
                } else if (dpeClass === 'E') {
                    dpeAlert.style.display = 'block';
                    dpeAlert.className = 'result-interpretation info';
                    dpeAlertTitle.textContent = 'ℹ️ Information - Réglementation Future';
                    dpeAlertMessage.innerHTML = `
                        <strong>Classe E - Interdiction dès le 1er janvier 2034</strong><br>
                        Vous avez du temps devant vous, mais la rénovation énergétique peut améliorer la rentabilité (réduction des charges) et la valeur du bien.<br>
                        <br>
                        💰 <strong>Coût estimé de rénovation :</strong> ${UI.formatCurrency(CONSTANTS.DPE.RENOVATION_COSTS.E_to_D)}<br>
                        ⚡ <strong>Économie d'énergie estimée :</strong> ${CONSTANTS.DPE.ENERGY_SAVINGS.E_to_D} kWh/m²/an
                    `;
                } else {
                    dpeAlert.style.display = 'none';
                }
            });
        }

        profitForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate required inputs with realistic limits
            // Validate required inputs with centralized limits
            const LIMITS = CONSTANTS.VALIDATION.PROFITABILITY;
            const priceValidation = Security.validateNumber(
                document.getElementById('price').value,
                { required: true, min: LIMITS.PRICE.MIN, max: LIMITS.PRICE.MAX, allowZero: false }
            );
            const rentValidation = Security.validateNumber(
                document.getElementById('rent').value,
                { required: true, min: LIMITS.RENT.MIN, max: LIMITS.RENT.MAX, allowZero: false }
            );

            if (!priceValidation.valid) { UI.showToast(priceValidation.error, "error"); return; }
            if (!rentValidation.valid) { UI.showToast(rentValidation.error, "error"); return; }

            // Get validated values
            const price = priceValidation.value;
            const rent = rentValidation.value;
            const notary = Security.validateNumber(document.getElementById('notary').value).value || 0;
            const works = Security.validateNumber(document.getElementById('works').value).value || 0;
            const charges = Security.validateNumber(document.getElementById('charges').value).value || 0;
            const tax = Security.validateNumber(document.getElementById('tax').value).value || 0;
            const hasAgency = document.getElementById('has-agency').checked;
            const hasManagement = document.getElementById('has-management').checked;
            const vacancyRate = Security.validateNumber(document.getElementById('vacancy-rate').value).value / 100 || 0.05;

            // Calculations
            try {
                const annualRent = ProfitabilityCalculator.calculateAnnualRent(rent, vacancyRate);

                // Calculate additional fees
                const additionalFees = ProfitabilityCalculator.calculateAdditionalFees(
                    price, annualRent, hasAgency, hasManagement
                );

                // Update total project cost with one-time fees
                const totalProjectCost = ProfitabilityCalculator.calculateTotalProjectCost(price, notary, works) + additionalFees.oneTime;

                // Display fees breakdown
                const feesSummary = document.getElementById('fees-summary');
                const feesBreakdown = document.getElementById('fees-breakdown');
                feesSummary.style.display = 'block';
                feesBreakdown.innerHTML = `
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>Frais d'agence:</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.agency)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>Frais bancaires:</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.bank)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>Frais d'expertise:</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.expert)}</span>
                    </div>
                    <div style="border-top: 1px solid var(--border-color); margin: 8px 0; padding-top: 8px;"></div>
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>Assurance PNO (an):</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.pno)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>GLI (an):</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.gli)}</span>
                    </div>
                    ${hasManagement ? `
                    <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                        <span>Gestion locative (an):</span>
                        <span>${UI.formatCurrency(additionalFees.breakdown.management)}</span>
                    </div>
                    ` : ''}
                    <div style="border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 600; color: var(--text-main);">
                        <span>Total frais ponctuels:</span>
                        <span>${UI.formatCurrency(additionalFees.oneTime)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--primary-color);">
                        <span>Total frais annuels:</span>
                        <span>${UI.formatCurrency(additionalFees.annual)}</span>
                    </div>
                `;

                const grossYield = ProfitabilityCalculator.calculateGrossYield(annualRent, price);
                const netYield = ProfitabilityCalculator.calculateNetYield(annualRent, charges, tax, totalProjectCost, additionalFees.annual);
                const monthlyCashflow = ProfitabilityCalculator.calculateMonthlyCashflow(rent, charges, tax) - (additionalFees.annual / 12);

                // Calculate TRI (Internal Rate of Return)
                const initialInvestment = -totalProjectCost;
                const cashflows = [initialInvestment];
                for (let i = 0; i < 10; i++) {
                    let yearCashflow = monthlyCashflow * 12;
                    if (i === 9) {
                        yearCashflow += price;
                    }
                    cashflows.push(yearCashflow);
                }
                const tri = ProfitabilityCalculator.calculateTRI(cashflows);

                // Display Results
                profitResults.classList.remove('hidden');

                document.getElementById('gross-yield').textContent = UI.formatPercent(grossYield);
                document.getElementById('net-yield').textContent = UI.formatPercent(netYield);
                document.getElementById('total-project').textContent = UI.formatCurrency(totalProjectCost);
                document.getElementById('cashflow-gross').textContent = UI.formatCurrency(monthlyCashflow);

                const triElement = document.getElementById('tri-value');
                if (triElement) {
                    if (tri !== null && isFinite(tri)) {
                        triElement.textContent = UI.formatPercent(tri);
                        triElement.style.color = tri > 5 ? 'var(--success-color)' : tri > 0 ? 'var(--info-color)' : 'var(--error-color)';
                    } else {
                        triElement.textContent = "N/A";
                        triElement.style.color = 'var(--text-muted)';
                        triElement.title = "Calcul impossible avec ces données (cashflow négatif ou non convergent)";
                    }
                }

                // Add interpretation
                const interpretation = ProfitabilityCalculator.interpretYield(netYield);
                let interpretationEl = profitResults.querySelector('.result-interpretation');
                if (!interpretationEl) {
                    interpretationEl = document.createElement('div');
                    interpretationEl.className = 'result-interpretation';
                    profitResults.appendChild(interpretationEl);
                }
                interpretationEl.className = `result-interpretation ${interpretation.level}`;
                interpretationEl.innerHTML = `<h4>Analyse</h4><p>${interpretation.message}</p>`;

                // Generate chart
                if (ChartManager) {
                    ChartManager.createProfitabilityChart('profit-chart', rent, charges, tax);
                }

                // Setup PDF export
                const exportBtn = document.getElementById('export-profit-pdf');
                if (exportBtn && window.PDFExport) {
                    exportBtn.onclick = () => {
                        window.PDFExport.exportProfitabilitySimulation({
                            price, rent, charges, tax, notary, works,
                            grossYield: UI.formatPercent(grossYield),
                            netYield: UI.formatPercent(netYield),
                            cashflow: monthlyCashflow,
                            totalProject: totalProjectCost,
                            interpretation: interpretation.message
                        });
                    };
                }

                // Setup Excel export
                const exportExcelBtn = document.getElementById('export-profit-excel');
                if (exportExcelBtn && window.ExcelExport) {
                    exportExcelBtn.onclick = () => {
                        window.ExcelExport.exportProfitabilitySimulation({
                            price, rent, charges, tax, notary, works,
                            grossYield: UI.formatPercent(grossYield),
                            netYield: UI.formatPercent(netYield),
                            cashflow: monthlyCashflow,
                            totalProject: totalProjectCost,
                            interpretation: interpretation.message
                        });
                    };
                }

                if (window.innerWidth < 600) {
                    profitResults.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error("Profitability Calculation Error:", error);
                UI.showToast(error.message || "Une erreur est survenue lors de l'estimation", "error");
            }
        });
    }
}

function initTargetPriceForm() {
    const calculateBtn = document.getElementById('calculate-target-btn');
    const resultsContainer = document.getElementById('target-results');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const targetYieldVal = Security.validateNumber(document.getElementById('target-yield').value, { required: true, min: 0.1, max: 50 });
            const rentVal = Security.validateNumber(document.getElementById('target-rent').value, { required: true, min: 100 });

            if (!targetYieldVal.valid) { UI.showToast(targetYieldVal.error, "error"); return; }
            if (!rentVal.valid) { UI.showToast(rentVal.error, "error"); return; }

            const targetYield = targetYieldVal.value;
            const rent = rentVal.value;
            const works = Security.validateNumber(document.getElementById('target-works').value).value || 0;
            const tax = Security.validateNumber(document.getElementById('target-tax').value).value || 0;
            const charges = Security.validateNumber(document.getElementById('target-charges').value).value || 0;

            // Assumptions for reverse calculation
            const notaryRate = 0.075; // Average for old property
            const taxRate = 0.30; // Flat tax assumption

            const vacancyRate = 0.05; // Default for target price calculator
            const annualRent = ProfitabilityCalculator.calculateAnnualRent(rent, vacancyRate);
            const targetPrice = ProfitabilityCalculator.calculateTargetPrice(targetYield, annualRent, works, notaryRate, taxRate, charges, tax);

            resultsContainer.classList.remove('hidden');
            document.getElementById('res-target-price').textContent = UI.formatCurrency(targetPrice);

            const adviceEl = document.getElementById('target-advice');
            if (targetPrice > 0 && isFinite(targetPrice)) {
                const priceWithoutNotary = targetPrice / (1 + notaryRate);
                adviceEl.textContent = `Pour atteindre ${targetYield}% de rentabilité nette, votre offre d'achat (FAI, hors notaire) ne devrait pas dépasser ${UI.formatCurrency(priceWithoutNotary)}. Le montant affiché (${UI.formatCurrency(targetPrice)}) inclut les frais de notaire estimés à ${(notaryRate * 100).toFixed(1)}%.`;
                adviceEl.parentElement.className = 'result-interpretation info';
            } else {
                adviceEl.textContent = "⚠️ Impossible d'atteindre cette rentabilité avec ces paramètres. Le loyer est trop faible par rapport aux charges et à la rentabilité visée. Essayez de réduire vos charges ou d'augmenter le loyer espéré.";
                adviceEl.parentElement.className = 'result-interpretation warning';
            }
        });
    }
}

function initCapacityForm() {
    const capacityForm = document.getElementById('capacity-form');
    const capacityResults = document.getElementById('capacity-results');

    if (capacityForm) {
        capacityForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const LIMITS = CONSTANTS.VALIDATION.CAPACITY;
            const incomeVal = Security.validateNumber(document.getElementById('income').value, { required: true, min: LIMITS.INCOME.MIN, max: LIMITS.INCOME.MAX });
            const expensesVal = Security.validateNumber(document.getElementById('expenses').value, { required: false, min: LIMITS.EXPENSES.MIN, max: LIMITS.EXPENSES.MAX });
            const rateVal = Security.validateNumber(document.getElementById('capacity-rate').value, { required: true, min: CONSTANTS.VALIDATION.CREDIT.RATE.MIN });
            const yearsVal = Security.validateNumber(document.getElementById('capacity-years').value, { required: true, min: LIMITS.DEBT_RATIO.MIN }); // Error in original code: years validation used wrong constant potentially
            // Wait, years limits are in CREDIT usually
            const yearsValCorrect = Security.validateNumber(document.getElementById('capacity-years').value, { required: true, min: CONSTANTS.VALIDATION.CREDIT.YEARS.MIN, max: CONSTANTS.VALIDATION.CREDIT.YEARS.MAX });
            const debtRatioVal = Security.validateNumber(document.getElementById('debt-ratio').value, { required: true, min: LIMITS.DEBT_RATIO.MIN, max: LIMITS.DEBT_RATIO.MAX });

            if (!incomeVal.valid) { UI.showToast(incomeVal.error, "error"); return; }
            if (!rateVal.valid) { UI.showToast(rateVal.error, "error"); return; }
            if (!yearsValCorrect.valid) { UI.showToast(yearsValCorrect.error, "error"); return; }

            const income = incomeVal.value;
            const expenses = expensesVal.value || 0;
            const rate = rateVal.value;
            const years = yearsValCorrect.value;
            const debtRatio = debtRatioVal.value;

            try {
                const maxMonthly = CapacityCalculator.calculateMaxMonthlyPayment(income, expenses, debtRatio);
                const capacity = CapacityCalculator.calculateBorrowingCapacity(maxMonthly, rate, years);

                capacityResults.classList.remove('hidden');
                document.getElementById('max-monthly').textContent = UI.formatCurrency(maxMonthly);
                document.getElementById('total-capacity').textContent = UI.formatCurrency(capacity);

                if (window.innerWidth < 600) {
                    capacityResults.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error("Capacity Calculation Error:", error);
                UI.showToast(error.message || "Erreur de calcul capacité", "error");
            }
        });
    }
}

// --- Project Management Logic ---
// --- Project Management Logic ---
function initProjectManagement() {
    const newProjectBtn = document.getElementById('new-project-btn');
    const projectDetailsModal = document.getElementById('project-details-modal');

    // New Project Modal Elements
    const newProjectModal = document.getElementById('new-project-modal');
    const newProjectInput = document.getElementById('new-project-name');
    const createProjectConfirmBtn = document.getElementById('create-project-confirm-btn');

    // --- Detail Modal Logic ---
    const closeDetailModal = () => {
        if (projectDetailsModal) projectDetailsModal.classList.add('hidden');
    };

    const closeDetailBtn = document.querySelector('#project-details-modal .close-modal-btn');
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal);
    if (projectDetailsModal) {
        projectDetailsModal.addEventListener('click', (e) => {
            if (e.target === projectDetailsModal) closeDetailModal();
        });
    }

    // --- New Project Modal Logic ---
    const openNewProjectModal = () => {
        if (newProjectModal) {
            newProjectModal.classList.remove('hidden');
            if (newProjectInput) {
                newProjectInput.value = '';
                newProjectInput.focus();
            }
        }
    };

    const closeNewProjectModal = () => {
        if (newProjectModal) newProjectModal.classList.add('hidden');
    };

    const handleCreateProject = () => {
        const name = newProjectInput.value.trim();
        if (name) {
            ProjectManager.createProject(name);
            UIManager.renderProjectsList();
            ProjectManager.displayCurrentProject('current-project-display');
            UI.showToast("Nouveau dossier créé", "success");
            closeNewProjectModal();
        } else {
            UI.showToast("Le nom du dossier est requis", "warning");
        }
    };

    // Events for New Project Modal
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', openNewProjectModal);
    }

    if (newProjectModal) {
        const closeBtns = newProjectModal.querySelectorAll('.close-modal-btn');
        closeBtns.forEach(btn => btn.addEventListener('click', closeNewProjectModal));

        newProjectModal.addEventListener('click', (e) => {
            if (e.target === newProjectModal) closeNewProjectModal();
        });

        // Enter key to confirm
        if (newProjectInput) {
            newProjectInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleCreateProject();
            });
        }
    }

    if (createProjectConfirmBtn) {
        createProjectConfirmBtn.addEventListener('click', handleCreateProject);
    }

    // Global function to load simulation from modal
    window.loadSimulationFromModal = (id, type) => {
        loadProject(id, type);
        closeDetailModal();
    };

    // Save Buttons
    const saveCreditBtn = document.getElementById('save-credit');
    const saveProfitBtn = document.getElementById('save-profit');
    const saveCapacityBtn = document.getElementById('save-capacity');

    // Updated Save Logic: Open modal if no project active
    const handleSaveRequest = (type) => {
        const currentId = ProjectManager.getCurrentProjectId();
        if (!currentId) {
            UI.showToast("Veuillez créer un dossier pour sauvegarder", "info");
            openNewProjectModal();
        } else {
            saveCurrentSimulation(type);
        }
    };

    if (saveCreditBtn) saveCreditBtn.addEventListener('click', () => handleSaveRequest('credit'));
    if (saveProfitBtn) saveProfitBtn.addEventListener('click', () => handleSaveRequest('profit'));
    if (saveCapacityBtn) saveCapacityBtn.addEventListener('click', () => handleSaveRequest('capacity'));

    // Sort Logic
    const sortSelect = document.getElementById('sort-projects');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            UIManager.renderProjectsList(e.target.value);
        });
    }

    // Initial Render
    UIManager.renderProjectsList();
    ProjectManager.displayCurrentProject('current-project-display');
}

// --- Helper Functions ---
function saveCurrentSimulation(type) {
    let currentId = ProjectManager.getCurrentProjectId();

    // If no project, we should have handled it in the event listener, but double check
    if (!currentId) {
        UI.showToast("Aucun dossier sélectionné", "error");
        return;
    }

    // Helper function to parse French formatted currency (1 234,56 €)
    const parseCurrency = (str) => {
        if (!str) return 0;
        let cleaned = str.replace(/[€\s\u00A0]/g, '');
        cleaned = cleaned.replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    };

    // Helper function to parse French formatted percentage (12,34 %)
    const parsePercent = (str) => {
        if (!str) return 0;
        let cleaned = str.replace(/[%\s\u00A0]/g, '');
        cleaned = cleaned.replace(/,/g, '.');
        return parseFloat(cleaned) || 0;
    };

    let data = {};
    if (type === 'credit') {
        const amount = document.getElementById('amount').value;
        const rate = document.getElementById('rate').value;
        const years = document.getElementById('years').value;

        if (!amount) { UI.showToast("Rien à sauvegarder", "warning"); return; }

        const monthlyPaymentText = document.getElementById('monthly-payment').textContent;
        const totalPaymentText = document.getElementById('total-payment').textContent;
        const totalInterestText = document.getElementById('total-interest').textContent;

        data = {
            amount: amount,
            rate: rate,
            years: years,
            monthlyPayment: parseCurrency(monthlyPaymentText),
            totalPayment: parseCurrency(totalPaymentText),
            totalInterest: parseCurrency(totalInterestText)
        };
    } else if (type === 'profit') {
        const price = document.getElementById('price').value;

        if (!price) { UI.showToast("Rien à sauvegarder", "warning"); return; }

        const grossYieldText = document.getElementById('gross-yield').textContent;
        const netYieldText = document.getElementById('net-yield').textContent;
        const totalProjectText = document.getElementById('total-project').textContent;
        const cashflowText = document.getElementById('cashflow-gross').textContent;
        const triText = document.getElementById('tri-value')?.textContent;

        data = {
            price: price,
            propertyType: document.getElementById('property-type').value,
            rent: document.getElementById('rent').value,
            notary: document.getElementById('notary').value,
            works: document.getElementById('works').value,
            charges: document.getElementById('charges').value,
            tax: document.getElementById('tax').value,
            vacancyRate: document.getElementById('vacancy-rate').value,
            hasAgency: document.getElementById('has-agency').checked,
            hasManagement: document.getElementById('has-management').checked,
            dpeClass: document.getElementById('dpe-class').value,
            grossYield: parsePercent(grossYieldText),
            netYield: parsePercent(netYieldText),
            totalProject: parseCurrency(totalProjectText),
            cashflow: parseCurrency(cashflowText),
            tri: triText && triText !== 'N/A' ? parsePercent(triText) : null
        };
    } else if (type === 'capacity') {
        const maxMonthly = document.getElementById('max-monthly').textContent;
        const totalCapacity = document.getElementById('total-capacity').textContent;

        data = {
            income: document.getElementById('income').value,
            expenses: document.getElementById('expenses').value,
            rate: document.getElementById('capacity-rate').value,
            years: document.getElementById('capacity-years').value,
            debtRatio: document.getElementById('debt-ratio').value,
            maxMonthly: parseCurrency(maxMonthly),
            totalCapacity: parseCurrency(totalCapacity)
        };
        if (!data.income) { UI.showToast("Rien à sauvegarder", "warning"); return; }
    }

    const project = ProjectManager.getProject(currentId);
    let sim = project.simulation;

    // Handle migration or init
    if (!sim || sim.type) {
        const oldSim = sim;
        sim = { credit: null, profit: null };
        if (oldSim && oldSim.type) {
            if (oldSim.type === 'credit') sim.credit = oldSim.data;
            if (oldSim.type === 'profit') sim.profit = oldSim.data;
        }
    }

    if (type === 'credit') sim.credit = data;
    if (type === 'profit') sim.profit = data;
    if (type === 'capacity') sim.capacity = data;

    ProjectManager.updateProject(currentId, 'simulation', sim);
    UIManager.renderProjectsList();
    UI.showToast("Simulation sauvegardée dans le dossier !", "success");
}

const loadStrategies = {
    credit: (data) => {
        document.getElementById('amount').value = data.amount;
        document.getElementById('rate').value = data.rate;
        document.getElementById('years').value = data.years;
        document.querySelector('#loan-form button[type="submit"]').click();
    },
    profit: (data) => {
        document.getElementById('price').value = data.price;
        if (data.propertyType) document.getElementById('property-type').value = data.propertyType;
        document.getElementById('rent').value = data.rent;
        document.getElementById('notary').value = data.notary;
        document.getElementById('works').value = data.works;
        document.getElementById('charges').value = data.charges;
        document.getElementById('tax').value = data.tax;
        if (data.vacancyRate !== undefined) document.getElementById('vacancy-rate').value = data.vacancyRate;
        if (data.hasAgency !== undefined) document.getElementById('has-agency').checked = data.hasAgency;
        if (data.hasManagement !== undefined) document.getElementById('has-management').checked = data.hasManagement;
        if (data.dpeClass) {
            document.getElementById('dpe-class').value = data.dpeClass;
            document.getElementById('dpe-class').dispatchEvent(new Event('change'));
        }
        document.querySelector('#profit-form button[type="submit"]').click();
    },
    capacity: (data) => {
        document.getElementById('income').value = data.income;
        document.getElementById('expenses').value = data.expenses;
        document.getElementById('capacity-rate').value = data.rate;
        document.getElementById('capacity-years').value = data.years;
        document.getElementById('debt-ratio').value = data.debtRatio;
        document.querySelector('#capacity-form button[type="submit"]').click();
    }
};

function loadProject(id, specificType = null) {
    ProjectManager.setCurrentProject(id);
    UIManager.renderProjectsList();
    ProjectManager.displayCurrentProject('current-project-display');

    const project = ProjectManager.getProject(id);
    if (!project || !project.simulation) return;

    let sim = project.simulation;

    // Backward compatibility
    if (sim.type) {
        const oldType = sim.type;
        const oldData = sim.data;
        sim = { credit: null, profit: null, capacity: null };
        if (oldType === 'credit') sim.credit = oldData;
        if (oldType === 'profit') sim.profit = oldData;
    }

    // Determine what to load
    const typesToLoad = specificType ? [specificType] : Object.keys(loadStrategies);
    let loadedType = null;

    typesToLoad.forEach(type => {
        if (sim[type] && loadStrategies[type]) {
            loadStrategies[type](sim[type]);
            if (!loadedType) loadedType = type;
        }
    });

    // Tab Switching Logic
    if (specificType) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${specificType === 'credit' ? 'credit' : specificType === 'profit' ? 'profitability' : 'capacity'}"]`);
        if (tabBtn) tabBtn.click();
    } else if (loadedType) {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const activeTypeMap = { 'credit': 'credit', 'profitability': 'profit', 'capacity': 'capacity' };

        if (!sim[activeTypeMap[activeTab]]) {
            const targetTab = loadedType === 'credit' ? 'credit' : loadedType === 'profit' ? 'profitability' : 'capacity';
            document.querySelector(`.tab-btn[data-tab="${targetTab}"]`).click();
        }
    }

    UI.showToast("Dossier chargé", "success");
}

function initMobileSidebar() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar = document.querySelector('.saved-projects-sidebar');

    if (mobileMenuToggle && sidebarOverlay && sidebar) {
        const toggleSidebar = () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        };

        mobileMenuToggle.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
}

function initDPEModal() {
    const dpeBtn = document.getElementById('dpe-info-btn');
    const dpeModal = document.getElementById('dpe-modal');

    if (dpeBtn && dpeModal) {
        const openModal = () => {
            dpeModal.classList.remove('hidden');
        };

        const closeModal = () => {
            dpeModal.classList.add('hidden');
        };

        dpeBtn.addEventListener('click', openModal);

        const closeBtns = dpeModal.querySelectorAll('.close-modal-btn');
        closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

        dpeModal.addEventListener('click', (e) => {
            if (e.target === dpeModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !dpeModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
}

// --- Global Disclaimer Tooltip Function (for inline onclick) ---
let activeTooltip = null;

window.showDisclaimerTooltip = function (element, event) {
    event.stopPropagation();

    // Remove existing tooltip if any
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }

    // Get full text from data attribute
    const fullText = element.getAttribute('data-full-text');
    if (!fullText) return;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'disclaimer-tooltip';
    tooltip.textContent = fullText;

    // Position tooltip near the disclaimer
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;

    // Add to document
    document.body.appendChild(tooltip);
    activeTooltip = tooltip;

    // Auto-adjust if tooltip goes off screen
    setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
        }
    }, 10);
};

// Click anywhere to close tooltip
document.addEventListener('click', () => {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
});

// --- Disclaimer Tooltips (kept for non-inline usage) ---
function initDisclaimerTooltips() {
    const disclaimers = document.querySelectorAll('.disclaimer-clickable');
    let activeTooltip = null;

    disclaimers.forEach(disclaimer => {
        disclaimer.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove existing tooltip if any
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }

            // Get full text from data attribute
            const fullText = disclaimer.getAttribute('data-full-text');
            if (!fullText) return;

            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'disclaimer-tooltip';
            tooltip.textContent = fullText;

            // Position tooltip near the disclaimer
            const rect = disclaimer.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 8}px`;

            // Add to document
            document.body.appendChild(tooltip);
            activeTooltip = tooltip;

            // Auto-adjust if tooltip goes off screen
            setTimeout(() => {
                const tooltipRect = tooltip.getBoundingClientRect();
                if (tooltipRect.right > window.innerWidth) {
                    tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
                }
                if (tooltipRect.bottom > window.innerHeight) {
                    tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
                }
            }, 10);
        });
    });

    // Click anywhere to close tooltip
    document.addEventListener('click', () => {
        if (activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeTooltip) {
            activeTooltip.remove();
            activeTooltip = null;
        }
    });
}
