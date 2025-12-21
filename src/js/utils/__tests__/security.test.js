/**
 * Tests for Security module
 * Tests validation, sanitization, and storage utilities
 */

import { Security } from '../security.js';

describe('Security', () => {
    describe('validateString', () => {
        test('validates required string', () => {
            const result = Security.validateString('test', { required: true });
            expect(result.valid).toBe(true);
            expect(result.value).toBe('test');
        });

        test('fails for empty required string', () => {
            const result = Security.validateString('', { required: true });
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('validates min length', () => {
            const result = Security.validateString('ab', { minLength: 3 });
            expect(result.valid).toBe(false);
        });

        test('validates max length', () => {
            const result = Security.validateString('a'.repeat(101), { maxLength: 100 });
            expect(result.valid).toBe(false);
        });

        test('trims whitespace', () => {
            const result = Security.validateString('  test  ', {});
            expect(result.value).toBe('test');
        });

        test('sanitizes HTML', () => {
            const result = Security.validateString('<script>alert("xss")</script>', {});
            expect(result.value).not.toContain('<script>');
        });
    });

    describe('validateNumber', () => {
        test('validates valid number', () => {
            const result = Security.validateNumber(42, {});
            expect(result.valid).toBe(true);
            expect(result.value).toBe(42);
        });

        test('fails for NaN', () => {
            const result = Security.validateNumber(NaN, {});
            expect(result.valid).toBe(false);
        });

        test('validates min value', () => {
            const result = Security.validateNumber(5, { min: 10 });
            expect(result.valid).toBe(false);
        });

        test('validates max value', () => {
            const result = Security.validateNumber(100, { max: 50 });
            expect(result.valid).toBe(false);
        });

        test('validates integer requirement', () => {
            const result = Security.validateNumber(3.14, { integer: true });
            expect(result.valid).toBe(false);
        });

        test('accepts integer when required', () => {
            const result = Security.validateNumber(42, { integer: true });
            expect(result.valid).toBe(true);
        });
    });

    describe('validateEmail', () => {
        test('validates correct email', () => {
            const result = Security.validateEmail('test@example.com');
            expect(result.valid).toBe(true);
        });

        test('fails for invalid email', () => {
            const result = Security.validateEmail('not-an-email');
            expect(result.valid).toBe(false);
        });

        test('fails for email without domain', () => {
            const result = Security.validateEmail('test@');
            expect(result.valid).toBe(false);
        });
    });

    describe('sanitizeHTML', () => {
        test('escapes script tags', () => {
            const result = Security.sanitizeHTML('<script>alert("xss")</script>Hello');
            // The function escapes all HTML, so script tag becomes harmless text
            expect(result).not.toContain('<script>');
            expect(result).toContain('Hello');
            expect(result).toContain('&lt;script&gt;'); // Escaped version
        });

        test('escapes event handlers', () => {
            const result = Security.sanitizeHTML('<div onclick="alert()">Test</div>');
            // The function escapes all HTML, so onclick becomes harmless text
            expect(result).not.toContain('<div');
            expect(result).toContain('Test');
        });

        test('escapes all HTML tags for security', () => {
            const result = Security.sanitizeHTML('<p>Safe <strong>text</strong></p>');
            // The function escapes ALL HTML for maximum security
            expect(result).toContain('&lt;p&gt;');
            expect(result).toContain('&lt;strong&gt;');
            expect(result).toContain('Safe');
            expect(result).toContain('text');
        });
    });

    describe('storage utilities', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        test('isAvailable returns true when localStorage works', () => {
            expect(Security.storage.isAvailable()).toBe(true);
        });

        test('set and get work correctly', () => {
            const data = { test: 'value' };
            Security.storage.set('testKey', data);
            const retrieved = Security.storage.get('testKey');
            expect(retrieved).toEqual(data);
        });

        test('get returns null for non-existent key', () => {
            const result = Security.storage.get('nonExistent');
            expect(result).toBeNull();
        });

        test('remove deletes key', () => {
            Security.storage.set('testKey', { data: 'test' });
            Security.storage.remove('testKey');
            const result = Security.storage.get('testKey');
            expect(result).toBeNull();
        });

        test('handles JSON parse errors gracefully', () => {
            localStorage.setItem('badKey', 'not-valid-json{');
            const result = Security.storage.get('badKey');
            expect(result).toBeNull();
        });
    });
});
