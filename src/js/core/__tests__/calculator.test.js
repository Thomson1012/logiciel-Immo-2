/**
 * Comprehensive tests for Calculator module
 * Tests all calculators: Credit, Profitability, Tax, Capacity
 */

import { CreditCalculator, ProfitabilityCalculator, TaxCalculator, CapacityCalculator } from '../calculator.js';

describe('CreditCalculator', () => {
    describe('calculateMonthlyPayment', () => {
        test('calculates correct monthly payment for standard loan', () => {
            const result = CreditCalculator.calculateMonthlyPayment(200000, 3.5, 20, 0.36);
            // Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1] + insurance
            // Capital: 1159.92 + Insurance: 60.00 = 1219.92
            expect(result).toBeCloseTo(1219.92, 2);
        });

        test('calculates payment with zero interest rate', () => {
            const result = CreditCalculator.calculateMonthlyPayment(120000, 0, 10, 0);
            expect(result).toBe(1000); // 120000 / (10 * 12)
        });

        test('includes insurance in monthly payment', () => {
            const withInsurance = CreditCalculator.calculateMonthlyPayment(100000, 2, 15, 0.36);
            const withoutInsurance = CreditCalculator.calculateMonthlyPayment(100000, 2, 15, 0);
            expect(withInsurance).toBeGreaterThan(withoutInsurance);
        });

        test('throws error for amount below minimum', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(500, 3, 20);
            }).toThrow('Le montant du prêt doit être au minimum 1000€');
        });

        test('throws error for amount above maximum', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(150000000, 3, 20);
            }).toThrow('Le montant du prêt ne peut pas dépasser 100000000€');
        });

        test('throws error for negative interest rate', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(200000, -1, 20);
            }).toThrow('Le taux d\'intérêt ne peut pas être négatif');
        });

        test('throws error for duration too short', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(200000, 3, 0);
            }).toThrow('La durée doit être au minimum 1 an');
        });

        test('throws error for duration too long', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(200000, 3, 40);
            }).toThrow('La durée ne peut pas dépasser 35 ans');
        });
    });

    describe('calculateTotalPayment', () => {
        test('calculates total payment correctly', () => {
            const monthly = 1000;
            const years = 20;
            const result = CreditCalculator.calculateTotalPayment(monthly, years);
            expect(result).toBe(240000); // 1000 * 20 * 12
        });
    });

    describe('calculateTotalInterest', () => {
        test('calculates total interest correctly', () => {
            const totalPayment = 240000;
            const principal = 200000;
            const result = CreditCalculator.calculateTotalInterest(totalPayment, principal);
            expect(result).toBe(40000);
        });
    });

    describe('calculateGuaranteeFees', () => {
        test('calculates guarantee fees', () => {
            const result = CreditCalculator.calculateGuaranteeFees(200000);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(5000); // Should be around 1%
        });
    });
});

describe('ProfitabilityCalculator', () => {
    describe('calculateNotaryFees', () => {
        test('calculates higher fees for old property', () => {
            const oldProperty = ProfitabilityCalculator.calculateNotaryFees(200000, false);
            const newProperty = ProfitabilityCalculator.calculateNotaryFees(200000, true);
            expect(oldProperty).toBeGreaterThan(newProperty);
        });

        test('old property fees around 7.5%', () => {
            const result = ProfitabilityCalculator.calculateNotaryFees(200000, false);
            expect(result).toBeCloseTo(15000, -3); // Around 15000
        });

        test('new property fees around 2.5%', () => {
            const result = ProfitabilityCalculator.calculateNotaryFees(200000, true);
            expect(result).toBeCloseTo(5000, -3); // Around 5000
        });

        test('throws error for price too low', () => {
            expect(() => {
                ProfitabilityCalculator.calculateNotaryFees(500, false);
            }).toThrow('Le prix du bien doit être au minimum 1000€');
        });

        test('throws error for price too high', () => {
            expect(() => {
                ProfitabilityCalculator.calculateNotaryFees(600000000, false);
            }).toThrow('Le prix du bien ne peut pas dépasser 500000000€');
        });
    });

    describe('calculateAnnualRent', () => {
        test('calculates annual rent with vacancy rate', () => {
            const monthlyRent = 1000;
            const vacancyRate = 0.05; // 5%
            const result = ProfitabilityCalculator.calculateAnnualRent(monthlyRent, vacancyRate);
            expect(result).toBe(11400); // 1000 * 12 * 0.95
        });

        test('uses default vacancy rate', () => {
            const monthlyRent = 1000;
            const result = ProfitabilityCalculator.calculateAnnualRent(monthlyRent);
            expect(result).toBeLessThan(12000); // Should apply some vacancy
        });
    });

    describe('calculateGrossYield', () => {
        test('calculates gross yield correctly', () => {
            const annualRent = 12000;
            const price = 200000;
            const result = ProfitabilityCalculator.calculateGrossYield(annualRent, price);
            // Gross yield = (annualRent / price) * 100 = (12000 / 200000) * 100 = 6%
            expect(result).toBeCloseTo(6.0, 1);
        });

        test('returns 0 for invalid price', () => {
            const result = ProfitabilityCalculator.calculateGrossYield(12000, 0);
            expect(result).toBe(0);
        });
    });

    describe('calculateNetYield', () => {
        test('calculates net yield with all expenses', () => {
            const annualRent = 12000;
            const charges = 1200;
            const tax = 800;
            const totalCost = 200000;
            const result = ProfitabilityCalculator.calculateNetYield(annualRent, charges, tax, totalCost);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(10);
        });

        test('returns 0 for invalid total cost', () => {
            const result = ProfitabilityCalculator.calculateNetYield(12000, 1000, 500, 0);
            expect(result).toBe(0);
        });
    });

    describe('calculateTRI', () => {
        test('calculates positive TRI for profitable investment', () => {
            const cashflows = [-200000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 210000];
            const result = ProfitabilityCalculator.calculateTRI(cashflows);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(20);
        });

        test('returns null for non-converging cashflows', () => {
            const cashflows = [-100000, 0, 0, 0];
            const result = ProfitabilityCalculator.calculateTRI(cashflows);
            expect(result).toBeNull();
        });
    });

    describe('calculateTargetPrice', () => {
        test('calculates target price for desired yield', () => {
            const targetYield = 5; // 5%
            const annualRent = 12000;
            const works = 20000;
            const notaryRate = 0.075;
            const taxRate = 0.30;
            const charges = 1200;
            const tax = 800;

            const result = ProfitabilityCalculator.calculateTargetPrice(
                targetYield, annualRent, works, notaryRate, taxRate, charges, tax
            );

            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(300000);
        });

        test('returns 0 for invalid yield', () => {
            const result = ProfitabilityCalculator.calculateTargetPrice(0, 12000, 20000, 0.075, 0.30, 1200, 800);
            expect(result).toBe(0);
        });
    });
});

describe('TaxCalculator', () => {
    describe('calculateMicroFoncier', () => {
        test('applies 30% abatement', () => {
            const income = 10000;
            const result = TaxCalculator.calculateMicroFoncier(income);
            expect(result).toBe(7000); // 10000 * 0.7
        });
    });

    describe('calculateMicroBIC', () => {
        test('applies 50% abatement', () => {
            const income = 10000;
            const result = TaxCalculator.calculateMicroBIC(income);
            expect(result).toBe(5000); // 10000 * 0.5
        });
    });

    describe('calculateReel', () => {
        test('deducts all charges from income', () => {
            const income = 15000;
            const charges = 3000;
            const interest = 2000;
            const amortization = 1000;
            const result = TaxCalculator.calculateReel(income, charges, interest, amortization);
            expect(result).toBe(9000); // 15000 - 6000
        });

        test('returns 0 if charges exceed income', () => {
            const result = TaxCalculator.calculateReel(10000, 8000, 5000, 2000);
            expect(result).toBe(0);
        });
    });

    describe('calculateSCI_IS', () => {
        test('applies reduced rate for income below threshold', () => {
            const result = TaxCalculator.calculateSCI_IS(30000);
            expect(result.is).toBe(4500); // 30000 * 0.15
            expect(result.netResultAfterIS).toBe(25500);
        });

        test('applies progressive rates for income above threshold', () => {
            const result = TaxCalculator.calculateSCI_IS(50000);
            expect(result.is).toBeGreaterThan(6375); // 42500 * 0.15 + 7500 * 0.25
            expect(result.netResultAfterIS).toBeLessThan(50000);
        });

        test('returns 0 tax for negative result', () => {
            const result = TaxCalculator.calculateSCI_IS(-5000);
            expect(result.is).toBe(0);
            expect(result.netResultAfterIS).toBe(-5000);
        });
    });

    describe('calculateTaxWithQuotient', () => {
        test('calculates tax with family quotient', () => {
            const income = 50000;
            const parts = 2;
            const result = TaxCalculator.calculateTaxWithQuotient(income, parts);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(income);
        });

        test('higher parts reduce total tax', () => {
            const income = 50000;
            const tax1Part = TaxCalculator.calculateTaxWithQuotient(income, 1);
            const tax2Parts = TaxCalculator.calculateTaxWithQuotient(income, 2);
            expect(tax2Parts).toBeLessThan(tax1Part);
        });
    });
});

describe('CapacityCalculator', () => {
    describe('calculateMaxMonthlyPayment', () => {
        test('calculates max payment with 35% debt ratio', () => {
            const income = 3000;
            const expenses = 200;
            const debtRatio = 35;
            const result = CapacityCalculator.calculateMaxMonthlyPayment(income, expenses, debtRatio);
            expect(result).toBe(850); // 3000 * 0.35 - 200
        });

        test('returns 0 if expenses exceed debt capacity', () => {
            const result = CapacityCalculator.calculateMaxMonthlyPayment(3000, 1500, 35);
            expect(result).toBe(0);
        });

        test('throws error for negative income', () => {
            expect(() => {
                CapacityCalculator.calculateMaxMonthlyPayment(-1000, 200, 35);
            }).toThrow('Les revenus ne peuvent pas être négatifs');
        });

        test('throws error for income too high', () => {
            expect(() => {
                CapacityCalculator.calculateMaxMonthlyPayment(2000000, 200, 35);
            }).toThrow('Les revenus mensuels ne peuvent pas dépasser 1000000€');
        });

        test('throws error for invalid debt ratio', () => {
            expect(() => {
                CapacityCalculator.calculateMaxMonthlyPayment(3000, 200, 60);
            }).toThrow('Le taux d\'endettement doit être entre 1% et 50%');
        });
    });

    describe('calculateBorrowingCapacity', () => {
        test('calculates capacity with interest rate', () => {
            const maxPayment = 1000;
            const rate = 3.5;
            const years = 20;
            const result = CapacityCalculator.calculateBorrowingCapacity(maxPayment, rate, years);
            expect(result).toBeGreaterThan(150000);
            expect(result).toBeLessThan(200000);
        });

        test('calculates capacity with zero interest', () => {
            const maxPayment = 1000;
            const rate = 0;
            const years = 20;
            const result = CapacityCalculator.calculateBorrowingCapacity(maxPayment, rate, years);
            expect(result).toBe(240000); // 1000 * 20 * 12
        });

        test('returns 0 for invalid inputs', () => {
            const result = CapacityCalculator.calculateBorrowingCapacity(0, 3, 20);
            expect(result).toBe(0);
        });

        test('higher rate reduces capacity', () => {
            const maxPayment = 1000;
            const years = 20;
            const lowRate = CapacityCalculator.calculateBorrowingCapacity(maxPayment, 2, years);
            const highRate = CapacityCalculator.calculateBorrowingCapacity(maxPayment, 5, years);
            expect(lowRate).toBeGreaterThan(highRate);
        });
    });
});
