import { CreditCalculator, ProfitabilityCalculator, CapacityCalculator } from './calculator.js';
import { CONSTANTS } from './constants.js';

describe('Calculator Validation and Error Handling', () => {

    describe('CreditCalculator', () => {
        test('validates valid credit inputs', () => {
            const result = CreditCalculator.calculateMonthlyPayment(200000, 3.5, 20);
            expect(result).toBeGreaterThan(0);
        });

        test('allows low amount loan (1000€)', () => {
            // Should not throw
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(1000, 5, 2);
            }).not.toThrow();
        });

        test('throws for amount below minimum', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(999, 5, 2);
            }).toThrow();
        });

        test('throws for rate below 0', () => {
            expect(() => {
                CreditCalculator.calculateMonthlyPayment(10000, -1, 2);
            }).toThrow();
        });
    });

    describe('ProfitabilityCalculator', () => {
        test('validates valid profitability inputs', () => {
            const rent = 1000;
            const price = 200000;
            const annualRent = ProfitabilityCalculator.calculateAnnualRent(rent);
            const yieldVal = ProfitabilityCalculator.calculateGrossYield(annualRent, price);
            expect(yieldVal).toBeGreaterThan(0);
        });

        test('allows low price property (1000€)', () => {
            expect(() => {
                ProfitabilityCalculator.calculateNotaryFees(1000, false);
            }).not.toThrow();
        });

        test('throws for price below minimum', () => {
            expect(() => {
                ProfitabilityCalculator.calculateNotaryFees(999, false);
            }).toThrow();
        });
    });

    describe('CapacityCalculator', () => {
        test('calculates correct capacity', () => {
            const maxMonthly = CapacityCalculator.calculateMaxMonthlyPayment(3000, 500, 33);
            expect(maxMonthly).toBeGreaterThan(0);
        });

        test('throws for negative income', () => {
            expect(() => {
                CapacityCalculator.calculateMaxMonthlyPayment(-100, 0, 33);
            }).toThrow();
        });

        test('throws for invalid debt ratio', () => {
            expect(() => {
                CapacityCalculator.calculateMaxMonthlyPayment(3000, 0, 60);
            }).toThrow();
        });
    });
});
