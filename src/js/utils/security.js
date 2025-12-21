/**
 * Security Module
 * Handles input sanitization, validation, and XSS prevention
 */

export const Security = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Create a safe DOM element from HTML string
     * @param {string} html - HTML string
     * @returns {DocumentFragment} - Safe DOM fragment
     */
    createSafeElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content;
    },

    /**
     * Validate numeric input
     * @param {any} value - Value to validate
     * @param {object} options - Validation options
     * @returns {object} - {valid: boolean, value: number, error: string}
     */
    validateNumber(value, options = {}) {
        const {
            min = -Infinity,
            max = Infinity,
            required = false,
            allowZero = true,
            integer = false
        } = options;

        // Check if required
        if (required && (value === null || value === undefined || value === '')) {
            return { valid: false, value: null, error: 'Ce champ est requis' };
        }

        // Allow empty for optional fields
        if (!required && (value === null || value === undefined || value === '')) {
            return { valid: true, value: 0, error: null };
        }

        const num = parseFloat(value);

        // Check if valid number
        if (isNaN(num) || !isFinite(num)) {
            return { valid: false, value: null, error: 'Veuillez entrer un nombre valide' };
        }

        // Check integer requirement
        if (integer && !Number.isInteger(num)) {
            return { valid: false, value: null, error: 'La valeur doit être un nombre entier' };
        }

        // Check zero
        if (!allowZero && num === 0) {
            return { valid: false, value: null, error: 'La valeur ne peut pas être zéro' };
        }

        // Check min/max
        if (num < min) {
            return { valid: false, value: null, error: `La valeur doit être au moins ${min}` };
        }

        if (num > max) {
            return { valid: false, value: null, error: `La valeur ne peut pas dépasser ${max}` };
        }

        return { valid: true, value: num, error: null };
    },

    /**
     * Validate string input
     * @param {any} value - Value to validate
     * @param {object} options - Validation options
     * @returns {object} - {valid: boolean, value: string, error: string}
     */
    validateString(value, options = {}) {
        const {
            minLength = 0,
            maxLength = Infinity,
            required = false,
            pattern = null
        } = options;

        // Check if required
        if (required && (!value || value.trim() === '')) {
            return { valid: false, value: null, error: 'Ce champ est requis' };
        }

        // Allow empty for optional fields
        if (!required && (!value || value.trim() === '')) {
            return { valid: true, value: '', error: null };
        }

        const str = String(value).trim();

        // Check length
        if (str.length < minLength) {
            return { valid: false, value: null, error: `Minimum ${minLength} caractères requis` };
        }

        if (str.length > maxLength) {
            return { valid: false, value: null, error: `Maximum ${maxLength} caractères autorisés` };
        }

        // Check pattern
        if (pattern && !pattern.test(str)) {
            return { valid: false, value: null, error: 'Format invalide' };
        }

        return { valid: true, value: this.sanitizeHTML(str), error: null };
    },

    /**
     * Validate email address
     * @param {string} value - Email to validate
     * @param {object} options - Validation options
     * @returns {object} - {valid: boolean, value: string, error: string}
     */
    validateEmail(value, options = {}) {
        const { required = false } = options;

        // Check if required
        if (required && (!value || value.trim() === '')) {
            return { valid: false, value: null, error: 'L\'email est requis' };
        }

        // Allow empty for optional fields
        if (!required && (!value || value.trim() === '')) {
            return { valid: true, value: '', error: null };
        }

        const email = String(value).trim();

        // RFC 5322 simplified email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return { valid: false, value: null, error: 'Format email invalide' };
        }

        return { valid: true, value: email, error: null };
    },

    /**
     * Safe LocalStorage operations with error handling
     */
    storage: {
        /**
         * Get item from localStorage with error handling
         * @param {string} key - Storage key
         * @returns {any} - Parsed value or null
         */
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error(`Error reading from localStorage: ${key}`, e);
                return null;
            }
        },

        /**
         * Set item in localStorage with error handling
         * @param {string} key - Storage key
         * @param {any} value - Value to store
         * @returns {boolean} - Success status
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.error('LocalStorage quota exceeded');
                } else {
                    console.error('Error writing to localStorage', e);
                }
                return false;
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} - Success status
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage', e);
                return false;
            }
        },

        /**
         * Check if localStorage is available
         * @returns {boolean} - Availability status
         */
        isAvailable() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
    },

    /**
     * Debounce function to limit execution rate
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
