/**
 * Input Validation Module
 * Provides robust validation for all form inputs
 */

export const InputValidator = {
    // Validation rules for different input types
    rules: {
        amount: {
            min: 10000,
            max: 10000000, // 10M max for loan amounts
            step: 100,
            required: true
        },
        rate: {
            min: 0.1,
            max: 15, // 15% max interest rate (realistic)
            step: 0.01,
            required: true
        },
        years: {
            min: 1,
            max: 35, // 35 years max (realistic for French market)
            step: 1,
            required: true
        },
        duration: {
            min: 1,
            max: 35,
            step: 1,
            required: true
        },
        price: {
            min: 10000,
            max: 50000000, // 50M max property price (large buildings)
            step: 100,
            required: true
        },
        rent: {
            min: 0,
            max: 100000, // 100k max monthly rent (realistic for large buildings)
            step: 10,
            required: true
        },
        charges: {
            min: 0,
            max: 1000000, // 1M max annual charges
            step: 10,
            required: false
        },
        income: {
            min: 0,
            max: 1000000, // 1M max monthly income (realistic limit)
            step: 10,
            required: true
        },
        percentage: {
            min: 0,
            max: 100,
            step: 1,
            required: true
        }
    },

    /**
     * Validate a single input value
     * @param {number} value - The value to validate
     * @param {string} type - The type of validation rule to apply
     * @returns {Object} - { valid: boolean, error: string|null, value: number }
     */
    validate(value, type) {
        const rule = this.rules[type];

        if (!rule) {
            console.warn(`No validation rule found for type: ${type}`);
            return { valid: true, value: value, error: null };
        }

        // Check if required
        if (rule.required && (value === null || value === undefined || value === '')) {
            return { valid: false, value: null, error: 'Ce champ est obligatoire' };
        }

        // Allow empty for non-required fields
        if (!rule.required && (value === null || value === undefined || value === '')) {
            return { valid: true, value: 0, error: null };
        }

        // Convert to number
        const numValue = parseFloat(value);

        // Check if valid number
        if (isNaN(numValue)) {
            return { valid: false, value: null, error: 'Veuillez entrer un nombre valide' };
        }

        // Check min
        if (numValue < rule.min) {
            return {
                valid: false,
                value: null,
                error: `La valeur doit être au minimum ${rule.min}`
            };
        }

        // Check max
        if (numValue > rule.max) {
            return {
                valid: false,
                value: null,
                error: `La valeur doit être au maximum ${this.formatNumber(rule.max)}`
            };
        }

        // Check for integer requirement (duration/years)
        if ((type === 'duration' || type === 'years') && !Number.isInteger(numValue)) {
            return {
                valid: false,
                value: null,
                error: 'La durée doit être un nombre entier'
            };
        }

        return { valid: true, value: numValue, error: null };
    },

    /**
     * Convenience method: Validate amount
     */
    validateAmount(value, options = {}) {
        const customRule = { ...this.rules.amount, ...options };
        const tempRules = this.rules;
        this.rules = { amount: customRule };
        const result = this.validate(value, 'amount');
        this.rules = tempRules;

        // Adjust error message for negative/zero
        if (!result.valid && value <= 0) {
            result.error = 'Le montant doit être positif';
        }

        return result;
    },

    /**
     * Convenience method: Validate rate
     */
    validateRate(value, options = {}) {
        const customRule = { ...this.rules.rate, min: 0, max: 100, ...options };
        const tempRules = this.rules;
        this.rules = { rate: customRule };
        const result = this.validate(value, 'rate');
        this.rules = tempRules;
        return result;
    },

    /**
     * Convenience method: Validate duration
     */
    validateDuration(value, options = {}) {
        const customRule = { ...this.rules.duration, ...options };
        const tempRules = this.rules;
        this.rules = { duration: customRule };
        const result = this.validate(value, 'duration');
        this.rules = tempRules;
        return result;
    },

    /**
     * Convenience method: Validate email
     */
    validateEmail(value) {
        if (!value || typeof value !== 'string') {
            return { valid: false, value: null, error: 'Email requis' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = emailRegex.test(value);

        return {
            valid,
            value: valid ? value : null,
            error: valid ? null : 'Format email invalide'
        };
    },

    /**
     * Convenience method: Validate phone
     */
    validatePhone(value) {
        if (!value || typeof value !== 'string') {
            return { valid: false, value: null, error: 'Téléphone requis' };
        }

        // French phone: 10 digits or +33 followed by 9 digits
        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
        const cleanValue = value.replace(/[\s.-]/g, '');
        const valid = phoneRegex.test(cleanValue);

        return {
            valid,
            value: valid ? cleanValue : null,
            error: valid ? null : 'Format téléphone invalide'
        };
    },

    /**
     * Convenience method: Sanitize input
     */
    sanitizeInput(value) {
        if (typeof value !== 'string') return value;

        // Remove HTML tags and trim
        return value
            .replace(/<[^>]*>/g, '')
            .trim();
    },

    /**
     * Validate a form with multiple inputs
     * @param {Object} formData - Object with field values
     * @param {Object} rules - Object with field rules { fieldName: { type, required } }
     * @returns {Object} - { valid: boolean, errors: Object, values: Object }
     */
    validateForm(formData, rules) {
        const errors = {};
        const values = {};
        let isValid = true;

        for (const [fieldName, rule] of Object.entries(rules)) {
            const value = formData[fieldName];

            // Check required
            if (rule.required && (value === null || value === undefined || value === '')) {
                errors[fieldName] = 'Ce champ est obligatoire';
                isValid = false;
                continue;
            }

            // Skip validation if not required and empty
            if (!rule.required && (value === null || value === undefined || value === '')) {
                values[fieldName] = null;
                continue;
            }

            // Validate based on type
            const result = this.validate(value, rule.type);

            if (!result.valid) {
                errors[fieldName] = result.error;
                isValid = false;
            } else {
                values[fieldName] = result.value;
            }
        }

        return { valid: isValid, errors, values };
    },

    /**
     * Apply validation to an input element
     * @param {HTMLInputElement} input - The input element
     * @param {string} type - The validation type
     */
    applyToInput(input, type) {
        const rule = this.rules[type];

        if (!rule) return;

        // Set HTML5 validation attributes
        if (rule.min !== undefined) input.min = rule.min;
        if (rule.max !== undefined) input.max = rule.max;
        if (rule.step !== undefined) input.step = rule.step;
        if (rule.required) input.required = true;

        // Add real-time validation
        input.addEventListener('blur', () => {
            const result = this.validate(input.value, type);
            this.showValidationFeedback(input, result);
        });

        // Clear error on input
        input.addEventListener('input', () => {
            this.clearValidationFeedback(input);
        });
    },

    /**
     * Show validation feedback on an input
     * @param {HTMLInputElement} input - The input element
     * @param {Object} result - The validation result
     */
    showValidationFeedback(input, result) {
        // Remove existing feedback
        this.clearValidationFeedback(input);

        if (!result.valid) {
            input.classList.add('input-error');

            // Create error message element
            const errorMsg = document.createElement('span');
            errorMsg.className = 'validation-error';
            errorMsg.textContent = result.error;
            errorMsg.style.color = 'var(--error-color)';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '4px';
            errorMsg.style.display = 'block';

            // Insert after input wrapper
            const wrapper = input.closest('.input-wrapper') || input.parentElement;
            wrapper.parentElement.insertBefore(errorMsg, wrapper.nextSibling);
        } else {
            input.classList.remove('input-error');
        }
    },

    /**
     * Clear validation feedback from an input
     * @param {HTMLInputElement} input - The input element
     */
    clearValidationFeedback(input) {
        input.classList.remove('input-error');

        const wrapper = input.closest('.input-wrapper') || input.parentElement;
        const errorMsg = wrapper.parentElement.querySelector('.validation-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    },

    /**
     * Format number for display
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },

    /**
     * Initialize validation for all inputs in a form
     * @param {HTMLFormElement} form - The form element
     * @param {Object} fieldTypes - Mapping of field IDs to validation types
     */
    initializeForm(form, fieldTypes) {
        for (const [fieldId, type] of Object.entries(fieldTypes)) {
            const input = form.querySelector(`#${fieldId}`);
            if (input) {
                this.applyToInput(input, type);
            }
        }
    }
};

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
    window.InputValidator = InputValidator;
}
