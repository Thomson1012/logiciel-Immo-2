/**
 * Project Comparator - Compare multiple projects side by side
 */

import { ProjectManager } from '../managers/projectManager.js';
import { UI } from './ui.js';
import { Security } from './security.js';
import { CreditCalculator, ProfitabilityCalculator } from '../core/calculator.js';

export const ProjectComparator = {
    compareProjects(projectIds) {
        const projects = projectIds.map(id => ProjectManager.getProject(id)).filter(p => p);

        if (projects.length < 2) {
            UI.showToast('Sélectionnez au moins 2 projets à comparer', 'warning');
            return null;
        }

        return projects.map(project => this.analyzeProject(project));
    },

    analyzeProject(project) {
        const sim = project.simulation || {};
        const credit = sim.credit;
        const profit = sim.profit;
        const capacity = sim.capacity;

        let analysis = {
            id: project.id,
            name: project.name,
            createdAt: project.createdAt,
            score: 0,
            metrics: {}
        };

        // Credit analysis
        if (credit) {
            const monthly = CreditCalculator.calculateMonthlyPayment(
                parseFloat(credit.amount),
                parseFloat(credit.rate),
                parseFloat(credit.years)
            );
            const total = CreditCalculator.calculateTotalPayment(monthly, parseFloat(credit.years));
            const interest = CreditCalculator.calculateTotalInterest(total, parseFloat(credit.amount));

            analysis.metrics.credit = {
                amount: parseFloat(credit.amount),
                monthly,
                totalInterest: interest,
                interestRate: (interest / parseFloat(credit.amount)) * 100
            };
        }

        // Profitability analysis
        if (profit) {
            const price = parseFloat(profit.price);
            const rent = parseFloat(profit.rent);
            const charges = parseFloat(profit.charges) || 0;
            const tax = parseFloat(profit.tax) || 0;

            const annualRent = ProfitabilityCalculator.calculateAnnualRent(rent);
            const totalCost = ProfitabilityCalculator.calculateTotalProjectCost(
                price,
                parseFloat(profit.notary) || 0,
                parseFloat(profit.works) || 0
            );
            const netYield = ProfitabilityCalculator.calculateNetYield(annualRent, charges, tax, totalCost);
            const cashflow = ProfitabilityCalculator.calculateMonthlyCashflow(rent, charges, tax);

            analysis.metrics.profit = {
                price,
                netYield,
                cashflow,
                totalCost,
                roi: (annualRent / totalCost) * 100
            };

            // Score based on profitability
            if (netYield > 6) analysis.score += 40;
            else if (netYield > 4) analysis.score += 30;
            else if (netYield > 2) analysis.score += 15;

            if (cashflow > 0) analysis.score += 20;
            else if (cashflow > -100) analysis.score += 10;
        }

        // Capacity analysis
        if (capacity) {
            analysis.metrics.capacity = {
                income: parseFloat(capacity.income),
                maxMonthly: capacity.maxMonthly,
                totalCapacity: capacity.totalCapacity
            };
        }

        // Overall score (0-100)
        analysis.score = Math.min(100, analysis.score);
        analysis.rating = this.getRating(analysis.score);

        return analysis;
    },

    getRating(score) {
        if (score >= 70) return { level: 'excellent', label: 'Excellent', color: 'success' };
        if (score >= 50) return { level: 'good', label: 'Bon', color: 'info' };
        if (score >= 30) return { level: 'average', label: 'Moyen', color: 'warning' };
        return { level: 'poor', label: 'Faible', color: 'error' };
    },

    findBestProject(analyses) {
        if (!analyses || analyses.length === 0) return null;
        return analyses.reduce((best, current) =>
            current.score > best.score ? current : best
        );
    },

    renderComparison(analyses) {
        if (!analyses || analyses.length === 0) return '';

        const best = this.findBestProject(analyses);

        let html = '<div class="comparison-container">';
        html += '<h3>Comparaison des projets</h3>';
        html += '<div class="comparison-grid">';

        analyses.forEach(analysis => {
            const isBest = analysis.id === best.id;
            html += `
                <div class="comparison-card ${isBest ? 'best-project' : ''}">
                    ${isBest ? '<div class="best-badge">Meilleur choix</div>' : ''}
                    <h4>${Security.sanitizeHTML(analysis.name)}</h4>
                    <div class="score-badge ${analysis.rating.color}">
                        Score: ${analysis.score}/100 - ${analysis.rating.label}
                    </div>
                    
                    ${analysis.metrics.profit ? `
                        <div class="metric-row">
                            <span>Rentabilité nette:</span>
                            <strong>${UI.formatPercent(analysis.metrics.profit.netYield)}</strong>
                        </div>
                        <div class="metric-row">
                            <span>Cashflow:</span>
                            <strong class="${analysis.metrics.profit.cashflow > 0 ? 'positive' : 'negative'}">
                                ${UI.formatCurrency(analysis.metrics.profit.cashflow)}
                            </strong>
                        </div>
                        <div class="metric-row">
                            <span>Prix:</span>
                            <strong>${UI.formatCurrency(analysis.metrics.profit.price)}</strong>
                        </div>
                    ` : ''}
                    
                    ${analysis.metrics.credit ? `
                        <div class="metric-row">
                            <span>Mensualité:</span>
                            <strong>${UI.formatCurrency(analysis.metrics.credit.monthly)}</strong>
                        </div>
                        <div class="metric-row">
                            <span>Intérêts totaux:</span>
                            <strong>${UI.formatCurrency(analysis.metrics.credit.totalInterest)}</strong>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div></div>';
        return html;
    }
};
