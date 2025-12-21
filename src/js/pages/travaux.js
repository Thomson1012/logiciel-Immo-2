import { ProjectManager } from '../managers/projectManager.js';
import { UI } from '../utils/ui.js';
import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    ThemeManager.init();
    // Initialize Keyboard Navigation
    KeyboardNavigation.init();

    const calculateBtn = document.getElementById('calculate-travaux-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resultsContainer = document.getElementById('results-container');
    const formContainer = document.getElementById('travaux-form-container');

    // Cost data per m2 for different trades and renovation types
    // These are estimations and should be refined with real market data if possible
    const costData = {
        amenagement: {
            min: 200,
            max: 500,
            breakdown: {
                'Peinture & Finitions': 0.45,
                'Sols': 0.35,
                'Petite Électricité/Plomberie': 0.10,
                'Divers': 0.10
            }
        },
        legere: {
            min: 500,
            max: 900,
            breakdown: {
                'Sols & Murs': 0.30,
                'Cuisine & SDB': 0.30,
                'Électricité': 0.15,
                'Plomberie': 0.15,
                'Divers': 0.10
            }
        },
        moderee: {
            min: 900,
            max: 1300,
            breakdown: {
                'Cloisons & Isolation': 0.25,
                'Électricité & Plomberie': 0.25,
                'Sols & Murs': 0.20,
                'Menuiseries': 0.15,
                'Cuisine & SDB': 0.15
            }
        },
        severe: {
            min: 1300,
            max: 2000,
            breakdown: {
                'Gros Œuvre & Structure': 0.30,
                'Isolation & Toiture': 0.20,
                'Électricité & Plomberie': 0.20,
                'Menuiseries': 0.15,
                'Finitions intérieures': 0.15
            }
        }
    };

    // Quality multipliers
    const qualityMultipliers = {
        standard: 1.0,
        milieu: 1.3,    // +30%
        haut: 1.7       // +70%
    };

    let travauxChart = null;

    calculateBtn.addEventListener('click', () => {
        const surface = parseFloat(document.getElementById('surface').value);
        const renovationType = document.querySelector('input[name="renovationType"]:checked').value;
        const qualityLevel = document.querySelector('input[name="qualityLevel"]:checked').value;

        if (!surface || surface <= 0) {
            alert("Veuillez entrer une surface valide.");
            return;
        }

        calculateAndDisplay(surface, renovationType, qualityLevel);
    });

    restartBtn.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        formContainer.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Save button listener
    const saveBtn = document.getElementById('save-travaux-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveTravauxEstimation();
        });
    }

    // Store current estimation data
    let currentEstimation = null;

    function saveTravauxEstimation() {
        if (!currentEstimation) {
            if (UI && UI.showToast) {
                UI.showToast('Aucune estimation à sauvegarder', 'warning');
            } else {
                alert('Aucune estimation à sauvegarder');
            }
            return;
        }

        // Get or create current project
        let currentProject = ProjectManager.getCurrentProject();

        if (!currentProject) {
            // Create new project
            const projectName = prompt('Nom du dossier pour cette estimation :', 'Estimation Travaux');
            if (!projectName) return; // User cancelled

            currentProject = ProjectManager.createProject(projectName);
            if (!currentProject) {
                if (UI && UI.showToast) {
                    UI.showToast('Erreur lors de la création du dossier', 'error');
                } else {
                    alert('Erreur lors de la création du dossier');
                }
                return;
            }
        }

        // Save travaux data to project
        ProjectManager.updateProject(currentProject.id, 'travaux', currentEstimation);

        if (UI && UI.showToast) {
            UI.showToast(`Estimation sauvegardée dans "${currentProject.name}"`, 'success');
        } else {
            alert(`Estimation sauvegardée dans "${currentProject.name}"`);
        }
    }

    function calculateAndDisplay(surface, type, quality) {
        const data = costData[type];
        const qualityMultiplier = qualityMultipliers[quality];

        // Calculate average cost per m2 for the estimation with quality multiplier
        const baseCostPerM2 = (data.min + data.max) / 2;
        const avgCostPerM2 = baseCostPerM2 * qualityMultiplier;
        const totalCost = surface * avgCostPerM2;

        // Build breakdown object
        const breakdown = {};
        for (const [trade, percentage] of Object.entries(data.breakdown)) {
            breakdown[trade] = totalCost * percentage;
        }

        // Store current estimation for saving
        currentEstimation = {
            surface: surface,
            renovationType: type,
            qualityLevel: quality,
            totalCost: totalCost,
            costPerM2: avgCostPerM2,
            baseCostPerM2: baseCostPerM2,
            qualityMultiplier: qualityMultiplier,
            breakdown: breakdown,
            estimatedAt: new Date().toISOString()
        };

        // Update summary
        document.getElementById('res-total-cost').textContent = formatCurrency(totalCost);
        document.getElementById('res-cost-per-m2').textContent = formatCurrency(avgCostPerM2) + '/m²';

        // Generate breakdown
        const breakdownContainer = document.getElementById('breakdown-container');
        breakdownContainer.innerHTML = '';

        const labels = [];
        const values = [];
        const colors = [
            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
        ];

        let colorIndex = 0;
        for (const [trade, tradeCost] of Object.entries(breakdown)) {
            const row = document.createElement('div');
            row.className = 'result-row';
            row.style.padding = '10px';
            row.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            row.style.borderRadius = '8px';
            row.innerHTML = `
                <span>${trade}</span>
                <span>${formatCurrency(tradeCost)}</span>
            `;
            breakdownContainer.appendChild(row);

            labels.push(trade);
            values.push(tradeCost);
        }

        // Update Chart
        updateChart(labels, values, colors);

        // Show results
        formContainer.style.display = 'none';
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
    }

    function updateChart(labels, data, colors) {
        const ctx = document.getElementById('travaux-chart').getContext('2d');

        if (travauxChart) {
            travauxChart.destroy();
        }

        travauxChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                family: "'Outfit', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatCurrency(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});
