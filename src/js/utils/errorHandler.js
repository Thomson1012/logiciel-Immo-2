/**
 * Error Handler - Global error boundary and logging
 */

import { UI } from './ui.js';

export const ErrorHandler = {
    errors: [],
    maxErrors: 50,

    init() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                error: event.reason
            });
        });

        // Chart.js fallback
        this.checkDependencies();
    },

    handleError(errorInfo) {
        console.error('Error caught:', errorInfo);

        // Store error
        this.errors.push({
            ...errorInfo,
            timestamp: new Date().toISOString()
        });

        // Limit stored errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Show user-friendly message
        const userMessage = this.getUserFriendlyMessage(errorInfo.type);
        UI.showToast(userMessage, 'error');

        // In production, send to monitoring service
        // this.sendToMonitoring(errorInfo);
    },

    getUserFriendlyMessage(errorType) {
        const messages = {
            'JavaScript Error': 'Une erreur est survenue. Veuillez rafraîchir la page.',
            'Unhandled Promise Rejection': 'Une erreur de chargement est survenue.',
            'Chart Error': 'Impossible de charger les graphiques.',
            'PDF Error': 'Impossible de générer le PDF.',
            'Storage Error': 'Erreur de sauvegarde des données.'
        };
        return messages[errorType] || 'Une erreur inattendue est survenue.';
    },

    checkDependencies() {
        // Check if Chart.js loaded
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded - graphs will not be available');
        }

        // Check if jsPDF loaded
        if (typeof window.jspdf === 'undefined') {
            console.warn('jsPDF not loaded - PDF export will not be available');
        }

        // Check localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            this.handleError({
                type: 'Storage Error',
                message: 'localStorage not available'
            });
        }
    },

    getErrors() {
        return this.errors;
    },

    clearErrors() {
        this.errors = [];
    },

    // Send to monitoring service (placeholder)
    sendToMonitoring(errorInfo) {
        // In production, send to Sentry, LogRocket, etc.
        // Example:
        // fetch('/api/log-error', {
        //     method: 'POST',
        //     body: JSON.stringify(errorInfo)
        // });
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
} else {
    ErrorHandler.init();
}
