/**
 * FormValidator.js
 * Validation en temps réel des formulaires avec feedback visuel et indicateurs de progression
 * @version 1.0.0
 */

export class FormValidator {
    /**
     * Valide un champ de saisie et affiche le feedback
     * @param {HTMLElement} input - Élément input à valider
     * @param {object} rules - Règles de validation
     * @returns {boolean} true si valide, false sinon
     */
    static validateInput(input, rules = {}) {
        const value = parseFloat(input.value);
        const wrapper = input.closest('.input-wrapper');

        if (!wrapper) return true;

        // Supprimer ancien feedback
        const oldFeedback = wrapper.parentElement.querySelector('.input-feedback');
        if (oldFeedback) oldFeedback.remove();

        // Si vide, réinitialiser
        if (input.value === '') {
            wrapper.classList.remove('valid', 'invalid');
            return true;
        }

        // Validation
        let isValid = true;
        let message = '';
        let type = 'success';

        if (isNaN(value)) {
            isValid = false;
            message = '❌ Valeur invalide';
            type = 'error';
        } else if (rules.min !== undefined && value < rules.min) {
            isValid = false;
            message = `❌ Minimum : ${rules.min}`;
            type = 'error';
        } else if (rules.max !== undefined && value > rules.max) {
            isValid = false;
            message = `❌ Maximum : ${rules.max}`;
            type = 'error';
        } else if (rules.goodRange) {
            const { min, max, message: goodMsg } = rules.goodRange;
            if (value >= min && value <= max) {
                message = goodMsg || '✓ Valeur optimale';
                type = 'success';
            } else {
                message = '⚠️ Valeur inhabituelle';
                type = 'info';
            }
        } else {
            message = '✓ Valeur valide';
            type = 'success';
        }

        // Appliquer classes
        wrapper.classList.toggle('valid', isValid);
        wrapper.classList.toggle('invalid', !isValid);

        // Ajouter feedback
        if (message) {
            const feedback = document.createElement('div');
            feedback.className = `input-feedback ${type}`;
            feedback.textContent = message;
            wrapper.parentElement.appendChild(feedback);
        }

        return isValid;
    }

    /**
     * Configure la validation en temps réel pour tous les champs
     */
    static setupRealtimeValidation() {
        // Taux d'intérêt
        const rateInput = document.getElementById('rate');
        if (rateInput) {
            rateInput.addEventListener('input', () => {
                this.validateInput(rateInput, {
                    min: 0,
                    max: 10,
                    goodRange: { min: 2.5, max: 4.5, message: '✓ Taux actuel du marché (2024)' }
                });
            });
        }

        // Taux capacité
        const capacityRateInput = document.getElementById('capacity-rate');
        if (capacityRateInput) {
            capacityRateInput.addEventListener('input', () => {
                this.validateInput(capacityRateInput, {
                    min: 0,
                    max: 10,
                    goodRange: { min: 2.5, max: 4.5, message: '✓ Taux actuel du marché (2024)' }
                });
            });
        }

        // Montant
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.validateInput(amountInput, {
                    min: 1000,
                    max: 100000000
                });
            });
        }

        // Loyer
        const rentInput = document.getElementById('rent');
        if (rentInput) {
            rentInput.addEventListener('input', () => {
                this.validateInput(rentInput, {
                    min: 100,
                    max: 500000
                });
            });
        }

        // Prix
        const priceInput = document.getElementById('price');
        if (priceInput) {
            priceInput.addEventListener('input', () => {
                this.validateInput(priceInput, {
                    min: 10000,
                    max: 500000000
                });
            });
        }

        // Revenus
        const incomeInput = document.getElementById('income');
        if (incomeInput) {
            incomeInput.addEventListener('input', () => {
                this.validateInput(incomeInput, {
                    min: 0,
                    max: 1000000
                });
            });
        }

        // Taux d'endettement
        const debtRatioInput = document.getElementById('debt-ratio');
        if (debtRatioInput) {
            debtRatioInput.addEventListener('input', () => {
                this.validateInput(debtRatioInput, {
                    min: 1,
                    max: 50,
                    goodRange: { min: 30, max: 35, message: '✓ Taux standard accepté par les banques' }
                });
            });
        }
    }

    /**
   * Initialise le validateur de formulaires
   */
    static init() {
        this.setupRealtimeValidation();

        console.log('✓ FormValidator initialized');
    }
}
