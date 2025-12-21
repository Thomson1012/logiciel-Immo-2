/**
 * Excel/CSV Export Manager
 * Handles CSV generation for simulations, compatible with Excel and Numbers.
 */

import { UI } from './ui.js';

export const ExcelExport = {
    /**
     * Export Credit Simulation to CSV
     * @param {Object} data - The simulation data
     */
    exportCreditSimulation(data) {
        const rows = [
            ['Simulation de Crédit Immobilier'],
            ['Date', new Date().toLocaleDateString('fr-FR')],
            [],
            ['Données de la simulation'],
            ['Montant emprunté', data.amount],
            ['Taux d\'intérêt (%)', data.rate],
            ['Durée (années)', data.years],
            [],
            ['Résultats'],
            ['Mensualité', data.monthlyPayment],
            ['Coût total', data.totalPayment],
            ['Total intérêts', data.totalInterest]
        ];

        this.downloadCSV(rows, `simulation-credit-${Date.now()}.csv`);
        UI.showToast('Export Excel généré avec succès', 'success');
    },

    /**
     * Export Profitability Simulation to CSV
     * @param {Object} data - The simulation data
     */
    exportProfitabilitySimulation(data) {
        const rows = [
            ['Simulation de Rentabilité Locative'],
            ['Date', new Date().toLocaleDateString('fr-FR')],
            [],
            ['Données du projet'],
            ['Prix d\'achat', data.price],
            ['Loyer mensuel', data.rent],
            ['Charges annuelles', data.charges],
            ['Taxe foncière', data.tax],
            [],
            ['Résultats'],
            ['Rentabilité brute (%)', data.grossYield],
            ['Rentabilité nette (%)', data.netYield],
            ['Cashflow mensuel', data.cashflow],
            ['Coût total projet', data.totalProject]
        ];

        if (data.interpretation) {
            rows.push([]);
            rows.push(['Analyse']);
            // Clean interpretation text (remove newlines if any to avoid breaking CSV)
            rows.push([data.interpretation.replace(/(\r\n|\n|\r)/gm, " ")]);
        }

        this.downloadCSV(rows, `simulation-rentabilite-${Date.now()}.csv`);
        UI.showToast('Export Excel généré avec succès', 'success');
    },

    /**
     * Helper to download CSV file with BOM for Excel compatibility
     * @param {Array} rows - Array of arrays representing rows
     * @param {String} filename - Name of the file
     */
    downloadCSV(rows, filename) {
        // Convert rows to CSV string
        const csvContent = rows.map(e => e.map(cell => {
            // Escape quotes and wrap in quotes if necessary
            const stringCell = String(cell);
            if (stringCell.includes(';') || stringCell.includes('"') || stringCell.includes('\n')) {
                return `"${stringCell.replace(/"/g, '""')}"`;
            }
            return stringCell;
        }).join(';')).join('\n'); // Use semicolon for Excel FR compatibility

        // Add BOM for UTF-8 support in Excel
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create download link
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};
