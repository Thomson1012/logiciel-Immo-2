/**
 * Enhanced Chart Manager - Accessible, pedagogical graphs for all levels
 */

// import { Chart } from 'chart.js/auto'; // Removed: Chart is loaded via CDN
import { CreditCalculator } from '../core/calculator.js';
import { UI } from '../utils/ui.js';

export const ChartManager = {
    charts: {},

    // Helper: Format currency for tooltips
    formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    // Helper: Export chart as image
    exportChart(chartId, filename = 'graphique') {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            UI.showToast('Graphique non trouvé', 'error');
            return;
        }

        try {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${filename}-${Date.now()}.png`;
            link.href = url;
            link.click();
            UI.showToast('Graphique téléchargé', 'success');
        } catch (e) {
            console.error('Export error:', e);
            UI.showToast('Erreur lors de l\'export', 'error');
        }
    },

    // Helper: Create data table for accessibility
    createDataTable(containerId, data, headers) {
        const tableId = `${containerId}-table`;
        let existingTable = document.getElementById(tableId);

        if (existingTable) {
            existingTable.remove();
        }

        const table = document.createElement('table');
        table.id = tableId;
        table.className = 'chart-data-table sr-only';
        table.setAttribute('aria-label', 'Données du graphique');

        // Headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        const rowCount = data[Object.keys(data)[0]].length;
        for (let i = 0; i < rowCount; i++) {
            const row = document.createElement('tr');
            Object.values(data).forEach(values => {
                const td = document.createElement('td');
                td.textContent = typeof values[i] === 'number'
                    ? this.formatCurrency(values[i])
                    : values[i];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        }
        table.appendChild(tbody);

        // Insert after canvas
        const canvas = document.getElementById(containerId);
        canvas.parentNode.insertBefore(table, canvas.nextSibling);
    },

    createAmortizationChart(containerId, amount, rate, years) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        // Set accessibility attributes
        ctx.setAttribute('role', 'img');
        ctx.setAttribute('aria-label', `Graphique d'évolution de l'amortissement sur ${years} ans`);

        // Destroy existing chart
        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        const monthlyRate = rate / 100 / 12;
        const months = years * 12;
        const monthlyPayment = CreditCalculator.calculateMonthlyPayment(amount, rate, years);

        const data = {
            labels: [],
            capital: [],
            interest: [],
            remaining: []
        };

        let remainingCapital = amount;

        for (let month = 0; month <= months; month += 12) {
            data.labels.push(`Année ${month / 12}`);

            if (month === 0) {
                data.capital.push(0);
                data.interest.push(0);
                data.remaining.push(amount);
            } else {
                let yearCapital = 0;
                let yearInterest = 0;

                for (let m = 0; m < 12; m++) {
                    const monthInterest = remainingCapital * monthlyRate;
                    const monthCapital = monthlyPayment - monthInterest;
                    yearCapital += monthCapital;
                    yearInterest += monthInterest;
                    remainingCapital -= monthCapital;
                }

                data.capital.push(yearCapital);
                data.interest.push(yearInterest);
                data.remaining.push(Math.max(0, remainingCapital));
            }
        }

        // Create accessible data table
        this.createDataTable(containerId, data, ['Année', 'Capital remboursé', 'Intérêts payés', 'Capital restant']);

        this.charts[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Capital remboursé',
                        data: data.capital,
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Intérêts payés',
                        data: data.interest,
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Capital restant',
                        data: data.remaining,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#f8fafc',
                            font: { size: 12 },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: 'Évolution de l\'amortissement',
                        color: '#f8fafc',
                        font: { size: 16, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            title: (items) => items[0].label,
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = this.formatCurrency(context.parsed.y);
                                return `${label}: ${value}`;
                            },
                            footer: (items) => {
                                const year = parseInt(items[0].label.split(' ')[1]);
                                if (year === 0) return '';

                                const totalPaid = items[0].parsed.y + items[1].parsed.y;
                                return `\nTotal payé: ${this.formatCurrency(totalPaid)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#64748b',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });

        // Add explanation
        this.addChartExplanation(containerId, 'amortization', { amount, rate, years, monthlyPayment });
    },

    createProfitabilityChart(containerId, rent, charges, tax, years = 10, scenario = 'realiste') {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        // Set accessibility attributes
        ctx.setAttribute('role', 'img');
        ctx.setAttribute('aria-label', `Graphique de projection de rentabilité sur ${years} ans (scénario ${scenario})`);

        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
        }

        // Scenario parameters
        const scenarios = {
            optimiste: { inflation: 0.03, vacancy: 0.05, chargesIncrease: 0.015 },
            realiste: { inflation: 0.02, vacancy: 0.08, chargesIncrease: 0.02 },
            pessimiste: { inflation: 0.01, vacancy: 0.12, chargesIncrease: 0.03 }
        };

        const params = scenarios[scenario] || scenarios.realiste;

        const data = {
            labels: [],
            grossIncome: [],
            netIncome: [],
            cumulative: []
        };

        let cumul = 0;

        for (let year = 1; year <= years; year++) {
            // Apply inflation to rent
            const adjustedRent = rent * Math.pow(1 + params.inflation, year - 1);
            const annualRent = adjustedRent * 12 * (1 - params.vacancy);

            // Apply increase to charges
            const adjustedCharges = charges * Math.pow(1 + params.chargesIncrease, year - 1);
            const adjustedTax = tax * Math.pow(1 + params.chargesIncrease, year - 1);

            const netAnnual = annualRent - adjustedCharges - adjustedTax;

            data.labels.push(`An ${year}`);
            data.grossIncome.push(annualRent);
            data.netIncome.push(netAnnual);
            cumul += netAnnual;
            data.cumulative.push(cumul);
        }

        // Create accessible data table
        this.createDataTable(containerId, data, ['Année', 'Revenus bruts', 'Revenus nets', 'Cumulé']);

        this.charts[containerId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Revenus bruts',
                        data: data.grossIncome,
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 2
                    },
                    {
                        label: 'Revenus nets',
                        data: data.netIncome,
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 2
                    },
                    {
                        label: 'Cumulé',
                        data: data.cumulative,
                        type: 'line',
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: false,
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#f8fafc',
                            font: { size: 12 },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    title: {
                        display: true,
                        text: `Projection de rentabilité (${scenario})`,
                        color: '#f8fafc',
                        font: { size: 16, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(99, 102, 241, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            title: (items) => items[0].label,
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = this.formatCurrency(context.parsed.y);
                                return `${label}: ${value}`;
                            },
                            footer: (items) => {
                                const year = parseInt(items[0].label.split(' ')[1]);
                                const avgAnnual = cumul / year;
                                const roi = (avgAnnual / (rent * 12)) * 100;
                                return `\nROI moyen: ${roi.toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#64748b',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            color: '#64748b',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });

        // Add explanation with scenario info
        this.addChartExplanation(containerId, 'profitability', {
            rent,
            charges,
            tax,
            netAnnual: data.netIncome[0],
            cumul,
            scenario,
            params
        });
    },

    addChartExplanation(containerId, type, data) {
        const explanationId = `${containerId}-explanation`;
        let existingExplanation = document.getElementById(explanationId);

        if (existingExplanation) {
            existingExplanation.remove();
        }

        const explanation = document.createElement('div');
        explanation.id = explanationId;
        explanation.className = 'chart-explanation';

        if (type === 'amortization') {
            const totalInterest = (data.monthlyPayment * data.years * 12) - data.amount;
            const interestRate = (totalInterest / data.amount) * 100;

            explanation.innerHTML = `
                <div class="explanation-section">
                    <h4>💡 Pour les débutants</h4>
                    <p>Ce graphique montre comment votre prêt de <strong>${this.formatCurrency(data.amount)}</strong> sera remboursé sur ${data.years} ans.</p>
                    <ul>
                        <li><strong>Ligne bleue</strong> : L'argent que vous remboursez à la banque chaque année</li>
                        <li><strong>Ligne orange</strong> : Les intérêts que vous payez (le coût du crédit)</li>
                        <li><strong>Ligne rouge</strong> : Ce qu'il vous reste à rembourser</li>
                    </ul>
                    <p class="insight">💰 Au total, vous paierez <strong>${this.formatCurrency(totalInterest)}</strong> d'intérêts (${interestRate.toFixed(1)}% du montant emprunté).</p>
                </div>
                <div class="explanation-section expert">
                    <h4>📊 Pour les experts</h4>
                    <p>Mensualité : <strong>${this.formatCurrency(data.monthlyPayment)}</strong> (capital + intérêts + assurance 0.36%)</p>
                    <p>Coût total du crédit : <strong>${this.formatCurrency(totalInterest)}</strong></p>
                    <p>TAEG estimé : <strong>${(data.rate + 0.36).toFixed(2)}%</strong></p>
                    <p class="tip">💡 Les premières années, vous payez surtout des intérêts. Le capital remboursé accélère en fin de prêt.</p>
                </div>
            `;
        } else if (type === 'profitability') {
            const roi = (data.netAnnual / (data.rent * 12)) * 100;
            const scenarioInfo = data.scenario ? {
                optimiste: { emoji: '🚀', label: 'Optimiste', desc: 'Inflation +3%, vacance 5%' },
                realiste: { emoji: '📊', label: 'Réaliste', desc: 'Inflation +2%, vacance 8%' },
                pessimiste: { emoji: '⚠️', label: 'Prudent', desc: 'Inflation +1%, vacance 12%' }
            }[data.scenario] : null;

            explanation.innerHTML = `
                ${scenarioInfo ? `
                    <div class="scenario-badge ${data.scenario}">
                        ${scenarioInfo.emoji} Scénario ${scenarioInfo.label} : ${scenarioInfo.desc}
                    </div>
                ` : ''}
                <div class="explanation-section">
                    <h4>💡 Pour les débutants</h4>
                    <p>Ce graphique montre combien vous gagnerez avec votre investissement locatif sur 10 ans.</p>
                    <ul>
                        <li><strong>Barres bleues</strong> : Tous les loyers perçus dans l'année (avec ${data.params ? (data.params.vacancy * 100).toFixed(0) : 8}% de vacance locative)</li>
                        <li><strong>Barres vertes</strong> : Votre gain réel après charges et taxe foncière</li>
                        <li><strong>Ligne orange</strong> : Le total cumulé de vos gains</li>
                    </ul>
                    <p class="insight">💰 Vous gagnerez <strong>${this.formatCurrency(data.netAnnual)}</strong> la première année, soit <strong>${this.formatCurrency(data.cumul)}</strong> sur 10 ans${data.params ? ` (avec inflation de ${(data.params.inflation * 100).toFixed(0)}% par an)` : ''}.</p>
                </div>
                <div class="explanation-section expert">
                    <h4>📊 Pour les experts</h4>
                    <p>Cashflow annuel net (An 1) : <strong>${this.formatCurrency(data.netAnnual)}</strong></p>
                    <p>ROI annuel (An 1) : <strong>${roi.toFixed(2)}%</strong></p>
                    <p>Cumul 10 ans : <strong>${this.formatCurrency(data.cumul)}</strong></p>
                    ${data.params ? `
                        <p>Paramètres : Inflation ${(data.params.inflation * 100).toFixed(1)}%, Vacance ${(data.params.vacancy * 100).toFixed(0)}%, Charges +${(data.params.chargesIncrease * 100).toFixed(1)}%/an</p>
                    ` : ''}
                    <p class="tip">💡 Cette projection ${data.params ? 'intègre' : 'suppose'} l'inflation${data.params ? '' : '. En réalité, prévoir +2% d\'inflation annuelle sur les loyers'}.</p>
                </div>
            `;
        }

        const canvas = document.getElementById(containerId);
        const chartContainer = canvas.parentNode;
        chartContainer.parentNode.insertBefore(explanation, chartContainer.nextSibling);
    },

    destroyChart(containerId) {
        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
            delete this.charts[containerId];
        }
    }
};

