/**
 * Tests for InputValidator module
 * Tests form validation utilities
 */

import { InputValidator } from '../inputValidator.js';

describe('InputValidator', () => {
    describe('validateAmount', () => {
        test('validates valid amount', () => {
            const result = InputValidator.validateAmount(200000);
            expect(result.valid).toBe(true);
            expect(result.value).toBe(200000);
        });

        test('fails for negative amount', () => {
            const result = InputValidator.validateAmount(-1000);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('positif');
        });

        test('fails for zero', () => {
            const result = InputValidator.validateAmount(0);
            expect(result.valid).toBe(false);
        });

        test('validates with custom min', () => {
            const result = InputValidator.validateAmount(5000, { min: 10000 });
            expect(result.valid).toBe(false);
        });

        test('validates with custom max', () => {
            const result = InputValidator.validateAmount(2000000, { max: 1000000 });
            expect(result.valid).toBe(false);
        });
    });

    describe('validateRate', () => {
        test('validates valid rate', () => {
            const result = InputValidator.validateRate(3.5);
            expect(result.valid).toBe(true);
        });

        test('fails for negative rate', () => {
            const result = InputValidator.validateRate(-1);
            expect(result.valid).toBe(false);
        });

        test('fails for rate above 100%', () => {
            const result = InputValidator.validateRate(150);
            expect(result.valid).toBe(false);
        });

        test('accepts zero rate', () => {
            const result = InputValidator.validateRate(0);
            expect(result.valid).toBe(true);
        });
    });

    describe('validateDuration', () => {
        test('validates valid duration', () => {
            const result = InputValidator.validateDuration(20);
            expect(result.valid).toBe(true);
        });

        test('fails for zero duration', () => {
            const result = InputValidator.validateDuration(0);
            expect(result.valid).toBe(false);
        });

        test('fails for negative duration', () => {
            const result = InputValidator.validateDuration(-5);
            expect(result.valid).toBe(false);
        });

        test('fails for duration too long', () => {
            const result = InputValidator.validateDuration(50, { max: 35 });
            expect(result.valid).toBe(false);
        });

        test('requires integer', () => {
            const result = InputValidator.validateDuration(20.5);
            expect(result.valid).toBe(false);
        });
    });

    describe('validateEmail', () => {
        test('validates correct email format', () => {
            const result = InputValidator.validateEmail('user@example.com');
            expect(result.valid).toBe(true);
        });

        test('fails for invalid format', () => {
            const result = InputValidator.validateEmail('not-an-email');
            expect(result.valid).toBe(false);
        });

        test('fails for missing @', () => {
            const result = InputValidator.validateEmail('userexample.com');
            expect(result.valid).toBe(false);
        });

        test('fails for missing domain', () => {
            const result = InputValidator.validateEmail('user@');
            expect(result.valid).toBe(false);
        });
    });

    describe('validatePhone', () => {
        test('validates French phone number', () => {
            const result = InputValidator.validatePhone('0612345678');
            expect(result.valid).toBe(true);
        });

        test('validates international format', () => {
            const result = InputValidator.validatePhone('+33612345678');
            expect(result.valid).toBe(true);
        });

        test('fails for too short number', () => {
            const result = InputValidator.validatePhone('061234');
            expect(result.valid).toBe(false);
        });

        test('fails for letters in number', () => {
            const result = InputValidator.validatePhone('06abc12345');
            expect(result.valid).toBe(false);
        });
    });

    describe('sanitizeInput', () => {
        test('removes HTML tags', () => {
            const result = InputValidator.sanitizeInput('<script>alert("xss")</script>');
            expect(result).not.toContain('<script>');
        });

        test('trims whitespace', () => {
            const result = InputValidator.sanitizeInput('  test  ');
            expect(result).toBe('test');
        });

        test('preserves normal text', () => {
            const result = InputValidator.sanitizeInput('Normal text 123');
            expect(result).toBe('Normal text 123');
        });
    });

    describe('validateForm', () => {
        test('validates all fields in form', () => {
            const formData = {
                amount: 200000,
                rate: 3.5,
                duration: 20
            };

            const rules = {
                amount: { type: 'amount', required: true },
                rate: { type: 'rate', required: true },
                duration: { type: 'duration', required: true }
            };

            const result = InputValidator.validateForm(formData, rules);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual({});
        });

        test('returns errors for invalid fields', () => {
            const formData = {
                amount: -1000,
                rate: 150,
                duration: 0
            };

            const rules = {
                amount: { type: 'amount', required: true },
                rate: { type: 'rate', required: true },
                duration: { type: 'duration', required: true }
            };

            const result = InputValidator.validateForm(formData, rules);
            expect(result.valid).toBe(false);
            expect(Object.keys(result.errors)).toHaveLength(3);
        });

        test('validates required fields', () => {
            const formData = {
                amount: 200000
            };

            const rules = {
                amount: { type: 'amount', required: true },
                rate: { type: 'rate', required: true }
            };

            const result = InputValidator.validateForm(formData, rules);
            expect(result.valid).toBe(false);
            expect(result.errors.rate).toBeDefined();
        });
    });
});
