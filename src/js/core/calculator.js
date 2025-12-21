/**
 * Calculator Logic
 * Pure functions for financial calculations.
 */

import { CONSTANTS } from './constants.js';

export const CreditCalculator = {
    calculateMonthlyPayment(amount, rate, years, insuranceRate = CONSTANTS.CREDIT.DEFAULT_INSURANCE_RATE) {
        // Validation avec limites centralisées
        const LIMITS = CONSTANTS.VALIDATION.CREDIT;
        if (amount < LIMITS.AMOUNT.MIN) throw new Error(`Le montant du prêt doit être au minimum ${LIMITS.AMOUNT.MIN}€`);
        if (amount > LIMITS.AMOUNT.MAX) throw new Error(`Le montant du prêt ne peut pas dépasser ${LIMITS.AMOUNT.MAX}€`);
        if (rate < LIMITS.RATE.MIN) throw new Error('Le taux d\'intérêt ne peut pas être négatif');
        if (rate > LIMITS.RATE.MAX) throw new Error(`Le taux d\'intérêt ne peut pas dépasser ${LIMITS.RATE.MAX}%`);
        if (years < LIMITS.YEARS.MIN) throw new Error(`La durée doit être au minimum ${LIMITS.YEARS.MIN} an`);
        if (years > LIMITS.YEARS.MAX) throw new Error(`La durée ne peut pas dépasser ${LIMITS.YEARS.MAX} ans`);
        if (insuranceRate < LIMITS.INSURANCE_RATE.MIN || insuranceRate > LIMITS.INSURANCE_RATE.MAX) throw new Error(`Le taux d\'assurance doit être entre ${LIMITS.INSURANCE_RATE.MIN}% et ${LIMITS.INSURANCE_RATE.MAX}%`);

        const principal = amount;
        const monthlyRate = rate / 100 / 12;
        const totalPayments = years * 12;

        // Handle zero interest rate
        if (monthlyRate === 0) {
            const monthlyInsurance = (amount * (insuranceRate / 100)) / 12;
            return (principal / totalPayments) + monthlyInsurance;
        }

        // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        const x = Math.pow(1 + monthlyRate, totalPayments);
        const monthlyCapital = (principal * monthlyRate * x) / (x - 1);

        // Add insurance (typically 0.36% of borrowed amount per year)
        const monthlyInsurance = (amount * (insuranceRate / 100)) / 12;

        const monthly = monthlyCapital + monthlyInsurance;
        return isFinite(monthly) ? monthly : 0;
    },

    calculateTotalPayment(monthly, years) {
        return monthly * years * 12;
    },

    calculateTotalInterest(totalPayment, principal) {
        return totalPayment - principal;
    },

    calculateGuaranteeFees(amount) {
        // Typical guarantee fees: ~1% for caution, ~1.5-2% for hypothèque
        return amount * CONSTANTS.CREDIT.GUARANTEE_RATE; // Using caution as default
    },

    calculateTotalProjectCost(amount, notaryFees = 0, guaranteeFees = 0) {
        return amount + notaryFees + guaranteeFees;
    }
};

export const ProfitabilityCalculator = {
    /**
     * Calculate notary fees based on property price and type
     * @param {number} price - Property price
     * @param {boolean} isNew - True if new property (VEFA), false if old
     * @returns {number} - Notary fees amount
     */
    calculateNotaryFees(price, isNew = false) {
        // Validation
        const LIMITS = CONSTANTS.VALIDATION.PROFITABILITY;
        if (price < LIMITS.PRICE.MIN) throw new Error(`Le prix du bien doit être au minimum ${LIMITS.PRICE.MIN}€`);
        if (price > LIMITS.PRICE.MAX) throw new Error(`Le prix du bien ne peut pas dépasser ${LIMITS.PRICE.MAX}€`);

        // New property: 2-3% (average 2.5%)
        // Old property: 7-8% (average 7.5%)
        const rate = isNew ? CONSTANTS.PROFITABILITY.NOTARY_FEES_NEW : CONSTANTS.PROFITABILITY.NOTARY_FEES_OLD;
        return price * rate;
    },

    calculateAnnualRent(rent, vacancyRate = CONSTANTS.PROFITABILITY.VACANCY_RATE) {
        // Apply vacancy rate (typically 5-10%)
        return rent * 12 * (1 - vacancyRate);
    },

    calculateTotalProjectCost(price, notary, works) {
        return price + notary + works;
    },

    calculateGrossYield(annualRent, price) {
        if (price <= 0) return 0;
        // Gross yield: annualRent already has vacancy applied
        return (annualRent / price) * 100;
    },

    calculateNetYield(annualRent, charges, tax, totalProjectCost, additionalAnnualFees = 0, taxRate = CONSTANTS.PROFITABILITY.DEFAULT_TAX_RATE) {
        if (totalProjectCost <= 0) return 0;
        // Net income after charges, property tax, additional fees, and income tax estimation
        const totalAnnualCharges = charges + tax + additionalAnnualFees;
        const netIncome = annualRent - totalAnnualCharges;
        const afterTaxIncome = netIncome * (1 - taxRate); // Simplified tax
        return (afterTaxIncome / totalProjectCost) * 100;
    },

    calculateMonthlyCashflow(rent, charges, tax, vacancyRate = CONSTANTS.PROFITABILITY.VACANCY_RATE) {
        const effectiveRent = rent * (1 - vacancyRate);
        return effectiveRent - (charges / 12) - (tax / 12);
    },

    interpretYield(netYield) {
        if (netYield < CONSTANTS.PROFITABILITY.YIELD_THRESHOLDS.LOW) return { level: 'warning', message: 'Rentabilité faible. Investissement peu attractif.' };
        if (netYield < CONSTANTS.PROFITABILITY.YIELD_THRESHOLDS.MEDIUM) return { level: 'info', message: 'Rentabilité correcte pour un investissement sécurisé.' };
        if (netYield < CONSTANTS.PROFITABILITY.YIELD_THRESHOLDS.HIGH) return { level: 'success', message: 'Bonne rentabilité. Investissement intéressant.' };
        return { level: 'success', message: 'Excellente rentabilité. Vérifiez la fiabilité des données.' };
    },

    /**
     * Calculate additional fees for real estate investment
     * @param {number} price - Property price
     * @param {number} annualRent - Annual rent
     * @param {boolean} hasAgency - Include agency fees (5% of price)
     * @param {boolean} hasManagement - Include property management fees (8% of rent)
     * @returns {Object} - Breakdown of one-time and annual fees
     */
    calculateAdditionalFees(price, annualRent, hasAgency = true, hasManagement = false) {
        const fees = CONSTANTS.PROFITABILITY.ADDITIONAL_FEES;
        let oneTimeFees = 0;

        // One-time fees
        if (hasAgency) oneTimeFees += price * fees.AGENCY_RATE;
        oneTimeFees += fees.BANK_APPLICATION_FEE;
        oneTimeFees += fees.EXPERT_FEE;

        // Annual recurring fees
        const pnoInsurance = fees.PNO_INSURANCE_ANNUAL;
        const gliInsurance = annualRent * fees.GLI_RATE;
        const managementFees = hasManagement ? annualRent * fees.PROPERTY_MANAGEMENT_RATE : 0;
        const totalAnnualFees = pnoInsurance + gliInsurance + managementFees;

        return {
            oneTime: oneTimeFees,
            annual: totalAnnualFees,
            breakdown: {
                agency: hasAgency ? price * fees.AGENCY_RATE : 0,
                bank: fees.BANK_APPLICATION_FEE,
                expert: fees.EXPERT_FEE,
                pno: pnoInsurance,
                gli: gliInsurance,
                management: managementFees
            }
        };
    },

    /**
     * Calculate Internal Rate of Return (TRI)
     * @param {Array<number>} cashflows - Array of cashflows (first one should be negative initial investment)
     * @returns {number} - TRI percentage
     */
    calculateTRI(cashflows) {
        const maxIterations = 1000;
        const epsilon = 0.00001;
        let guess = 0.1; // Initial guess 10%

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let dNpv = 0;

            for (let t = 0; t < cashflows.length; t++) {
                npv += cashflows[t] / Math.pow(1 + guess, t);
                dNpv -= (t * cashflows[t]) / Math.pow(1 + guess, t + 1);
            }

            const newGuess = guess - npv / dNpv;
            if (Math.abs(newGuess - guess) < epsilon) {
                return newGuess * 100;
            }
            guess = newGuess;
        }
        return null; // Failed to converge
    },

    /**
     * Calculate Target Price for a desired yield
     * @param {number} targetYield - Desired net yield (%)
     * @param {number} annualRent - Annual rent
     * @param {number} works - Works amount
     * @param {number} notaryRate - Notary fees rate (e.g. 0.075)
     * @param {number} taxRate - Tax rate (e.g. 0.30)
     * @param {number} charges - Annual charges
     * @param {number} tax - Property tax
     * @returns {number} - Max purchase price
     */
    calculateTargetPrice(targetYield, annualRent, works, notaryRate, taxRate, charges, tax) {
        // Formula derived from Net Yield = (Net Income * (1 - TaxRate)) / (Price + Notary + Works)
        // Price * (1 + NotaryRate) = (Net Income * (1 - TaxRate) / TargetYield) - Works

        const netIncome = annualRent - charges - tax;
        const afterTaxIncome = netIncome * (1 - taxRate);
        const targetYieldDecimal = targetYield / 100;

        if (targetYieldDecimal <= 0) return 0;

        const totalProjectTarget = afterTaxIncome / targetYieldDecimal;
        const priceWithNotary = totalProjectTarget - works;

        // Price + Price * NotaryRate = PriceWithNotary
        // Price * (1 + NotaryRate) = PriceWithNotary
        const targetPrice = priceWithNotary / (1 + notaryRate);

        return Math.max(0, targetPrice);
    }
};

export const TaxCalculator = {
    // Barème IR 2024 (simplifié)
    TAX_BRACKETS: CONSTANTS.TAX.BRACKETS,

    calculateMicroFoncier(income) {
        return income * (1 - CONSTANTS.TAX.ABATEMENTS.MICRO_FONCIER); // 30% abatement
    },

    calculateMicroBIC(income) {
        return income * (1 - CONSTANTS.TAX.ABATEMENTS.MICRO_BIC); // 50% abatement
    },

    calculateReel(income, deductibleCharges, loanInterest, amortissement) {
        const charges = deductibleCharges + loanInterest + amortissement;
        return Math.max(0, income - charges);
    },

    calculateLMNP(income, charges, amortissement) {
        // LMNP allows amortization deduction
        const taxableBase = Math.max(0, income - charges - amortissement);
        return taxableBase;
    },

    calculateSCI_IS(netResult) {
        // IS Calculation: 15% up to 42500, 25% above
        let is = 0;
        if (netResult <= 0) return { is: 0, netResultAfterIS: netResult };

        if (netResult <= CONSTANTS.TAX.IS.REDUCED_THRESHOLD) {
            is = netResult * CONSTANTS.TAX.IS.REDUCED_RATE;
        } else {
            is = (CONSTANTS.TAX.IS.REDUCED_THRESHOLD * CONSTANTS.TAX.IS.REDUCED_RATE) +
                ((netResult - CONSTANTS.TAX.IS.REDUCED_THRESHOLD) * CONSTANTS.TAX.IS.NORMAL_RATE);
        }

        return {
            is: is,
            netResultAfterIS: netResult - is
        };
    },

    calculateTaxWithQuotient(taxableIncome, parts = 1) {
        // Quotient familial: divide income by number of parts
        const quotient = taxableIncome / parts;
        let tax = 0;
        let previousMax = 0;

        for (const bracket of this.TAX_BRACKETS) {
            if (quotient <= bracket.max) {
                tax += (quotient - previousMax) * bracket.rate;
                break;
            } else {
                tax += (bracket.max - previousMax) * bracket.rate;
                previousMax = bracket.max;
            }
        }

        // Multiply by parts to get total tax
        return tax * parts;
    },

    calculateTax(taxableBase, tmi) {
        const ir = taxableBase * (tmi / 100);
        const ps = taxableBase * CONSTANTS.TAX.CSG_CRDS_RATE; // 17.2% CSG/CRDS
        return { ir, ps, total: ir + ps };
    },

    calculateAdvancedTax(taxableBase, parts = 1) {
        const ir = this.calculateTaxWithQuotient(taxableBase, parts);
        const ps = taxableBase * CONSTANTS.TAX.CSG_CRDS_RATE; // 17.2% CSG/CRDS
        return {
            ir,
            ps,
            total: ir + ps,
            effectiveRate: ((ir + ps) / taxableBase * 100).toFixed(2)
        };
    },

    calculateNetIncome(income, totalTax, cashCharges) {
        // cashCharges = deductibleCharges + loanInterest (excluding amortissement)
        return income - cashCharges - totalTax;
    },

    compareRegimes(annualRent, charges, parts = 1) {
        // Micro-foncier (if rent < 15000€)
        const microEligible = annualRent <= CONSTANTS.TAX.MICRO_FONCIER_THRESHOLD;
        const microTaxable = microEligible ? this.calculateMicroFoncier(annualRent) : null;
        const microTax = microEligible ? this.calculateAdvancedTax(microTaxable, parts) : null;

        // Réel
        const reelTaxable = this.calculateReel(annualRent, charges, 0, 0);
        const reelTax = this.calculateAdvancedTax(reelTaxable, parts);

        // LMNP (if furnished rental)
        const lmnpTaxable = this.calculateLMNP(annualRent, charges, annualRent * CONSTANTS.TAX.ABATEMENTS.LMNP_AMORTIZATION_SIMPLIFIED); // 3% amortization
        const lmnpTax = this.calculateAdvancedTax(lmnpTaxable, parts);

        return {
            micro: microEligible ? {
                taxableBase: microTaxable,
                tax: microTax.total,
                netIncome: annualRent - microTax.total
            } : null,
            reel: {
                taxableBase: reelTaxable,
                tax: reelTax.total,
                netIncome: annualRent - charges - reelTax.total
            },
            lmnp: {
                taxableBase: lmnpTaxable,
                tax: lmnpTax.total,
                netIncome: annualRent - charges - lmnpTax.total
            },
            bestRegime: this.findBestRegime(microEligible ? microTax : null, reelTax, lmnpTax, annualRent, charges)
        };
    },

    findBestRegime(microTax, reelTax, lmnpTax, income, charges) {
        const options = [];

        if (microTax) {
            options.push({ name: 'Micro-foncier', netIncome: income - microTax.total });
        }
        options.push({ name: 'Réel', netIncome: income - charges - reelTax.total });
        options.push({ name: 'LMNP', netIncome: income - charges - lmnpTax.total });

        return options.reduce((best, current) =>
            current.netIncome > best.netIncome ? current : best
        );
    }
};

export const CapacityCalculator = {
    calculateMaxMonthlyPayment(income, expenses, debtRatio = 35) {
        // Validation
        const LIMITS = CONSTANTS.VALIDATION.CAPACITY;
        if (income < LIMITS.INCOME.MIN) throw new Error('Les revenus ne peuvent pas être négatifs');
        if (income > LIMITS.INCOME.MAX) throw new Error(`Les revenus mensuels ne peuvent pas dépasser ${LIMITS.INCOME.MAX}€`);
        if (expenses < LIMITS.EXPENSES.MIN) throw new Error('Les charges ne peuvent pas être négatives');
        if (debtRatio < LIMITS.DEBT_RATIO.MIN || debtRatio > LIMITS.DEBT_RATIO.MAX) throw new Error(`Le taux d'endettement doit être entre ${LIMITS.DEBT_RATIO.MIN}% et ${LIMITS.DEBT_RATIO.MAX}%`);

        if (income <= 0) return 0;
        const maxPayment = (income * (debtRatio / 100)) - expenses;
        return Math.max(0, maxPayment);
    },

    calculateBorrowingCapacity(maxMonthlyPayment, rate, years) {
        if (maxMonthlyPayment <= 0 || years <= 0) return 0;

        // If rate is 0, simple multiplication
        if (rate === 0) {
            return maxMonthlyPayment * years * 12;
        }

        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = years * 12;

        // Formula: PV = PMT * (1 - (1 + r)^-n) / r
        const capacity = maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate;

        return Math.round(capacity);
    }
};
