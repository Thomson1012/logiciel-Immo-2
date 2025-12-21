/**
 * PDF Export Manager - Handles PDF generation for simulations
 */

import { UI } from './ui.js';

export const PDFExport = {
    async exportCreditSimulation(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('Simulation de Crédit Immobilier', 20, 20);

        // Disclaimer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 20, 30);
        doc.text('Simulation indicative - Consultez un professionnel pour un conseil personnalisé', 20, 35);

        // Input data
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Données de la simulation', 20, 50);

        doc.setFontSize(11);
        doc.text(`Montant emprunté : ${UI.formatCurrency(data.amount)}`, 30, 60);
        doc.text(`Taux d'intérêt : ${data.rate} %`, 30, 68);
        doc.text(`Durée : ${data.years} ans`, 30, 76);

        // Results
        doc.setFontSize(14);
        doc.text('Résultats', 20, 95);

        doc.setFontSize(11);
        doc.text(`Mensualité : ${UI.formatCurrency(data.monthlyPayment)}`, 30, 105);
        doc.text(`Coût total : ${UI.formatCurrency(data.totalPayment)}`, 30, 113);
        doc.text(`Total intérêts : ${UI.formatCurrency(data.totalInterest)}`, 30, 121);

        // Add chart if canvas exists
        const canvas = document.getElementById('credit-chart');
        if (canvas) {
            try {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 20, 135, 170, 100);
            } catch (e) {
                console.warn('Could not add chart to PDF', e);
            }
        }

        // Save
        doc.save(`simulation-credit-${Date.now()}.pdf`);
        UI.showToast('PDF exporté avec succès', 'success');
    },

    async exportProfitabilitySimulation(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('Simulation de Rentabilité Locative', 20, 20);

        // Disclaimer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 20, 30);
        doc.text('Simulation indicative - Consultez un professionnel pour un conseil personnalisé', 20, 35);

        // Input data
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Données du projet', 20, 50);

        doc.setFontSize(11);
        doc.text(`Prix d'achat : ${UI.formatCurrency(data.price)}`, 30, 60);
        doc.text(`Loyer mensuel : ${UI.formatCurrency(data.rent)}`, 30, 68);
        doc.text(`Charges annuelles : ${UI.formatCurrency(data.charges)}`, 30, 76);
        doc.text(`Taxe foncière : ${UI.formatCurrency(data.tax)}`, 30, 84);

        // Results
        doc.setFontSize(14);
        doc.text('Résultats', 20, 100);

        doc.setFontSize(11);
        doc.text(`Rentabilité brute : ${data.grossYield} %`, 30, 110);
        doc.text(`Rentabilité nette : ${data.netYield} %`, 30, 118);
        doc.text(`Cashflow mensuel : ${UI.formatCurrency(data.cashflow)}`, 30, 126);
        doc.text(`Coût total projet : ${UI.formatCurrency(data.totalProject)}`, 30, 134);

        // Interpretation
        if (data.interpretation) {
            doc.setFontSize(12);
            doc.setTextColor(99, 102, 241);
            doc.text('Analyse', 20, 150);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            const splitText = doc.splitTextToSize(data.interpretation, 170);
            doc.text(splitText, 30, 160);
        }

        // Save
        doc.save(`simulation-rentabilite-${Date.now()}.pdf`);
        UI.showToast('PDF exporté avec succès', 'success');
    }
};
