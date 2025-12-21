/**
 * ExampleScenarios.js
 * Bibliothèque de scénarios pré-configurés pour faciliter les tests et la découverte
 * @version 1.0.0
 */

export const EXAMPLE_SCENARIOS = {
    credit: {
        'premier-achat': {
            name: '🏠 Premier Achat',
            description: 'T2 en province, primo-accédant',
            data: {
                amount: 150000,
                rate: 3.5,
                years: 25
            }
        },
        'investissement': {
            name: '💰 Investissement Locatif',
            description: 'Studio en centre-ville',
            data: {
                amount: 80000,
                rate: 3.8,
                years: 20
            }
        },
        'maison': {
            name: '🏡 Maison Familiale',
            description: 'Maison 4 pièces en périphérie',
            data: {
                amount: 300000,
                rate: 3.2,
                years: 25
            }
        }
    },
    profit: {
        'studio-etudiant': {
            name: '🎓 Studio Étudiant',
            description: 'Lille, 25m², DPE D',
            data: {
                price: 80000,
                propertyType: 'old',
                dpeClass: 'D',
                rent: 450,
                notary: 6000,
                works: 5000,
                charges: 600,
                tax: 400,
                vacancyRate: 5,
                hasAgency: true,
                hasManagement: false
            }
        },
        't2-lyon': {
            name: '🏙️ T2 Lyon',
            description: 'Lyon 7ème, 45m², DPE C',
            data: {
                price: 180000,
                propertyType: 'old',
                dpeClass: 'C',
                rent: 750,
                notary: 13500,
                works: 10000,
                charges: 1200,
                tax: 800,
                vacancyRate: 4,
                hasAgency: true,
                hasManagement: true
            }
        },
        'immeuble-rapport': {
            name: '🏢 Immeuble de Rapport',
            description: 'Bordeaux, 6 appartements',
            data: {
                price: 800000,
                propertyType: 'old',
                dpeClass: 'E',
                rent: 4500,
                notary: 60000,
                works: 50000,
                charges: 8000,
                tax: 5000,
                vacancyRate: 6,
                hasAgency: false,
                hasManagement: true
            }
        }
    },
    capacity: {
        'jeune-actif': {
            name: '👔 Jeune Actif',
            description: 'Salaire 2500€, charges 400€',
            data: {
                income: 2500,
                expenses: 400,
                rate: 3.5,
                years: 25,
                debtRatio: 35
            }
        },
        'couple': {
            name: '👫 Couple',
            description: 'Revenus cumulés 5000€',
            data: {
                income: 5000,
                expenses: 800,
                rate: 3.3,
                years: 25,
                debtRatio: 35
            }
        },
        'investisseur': {
            name: '💼 Investisseur',
            description: 'Revenus élevés, projet ambitieux',
            data: {
                income: 8000,
                expenses: 1200,
                rate: 3.0,
                years: 20,
                debtRatio: 35
            }
        }
    }
};

export class ExampleLoader {
    /**
     * Charge un exemple dans le formulaire
     * @param {string} type - Type de formulaire (credit, profit, capacity)
     * @param {string} scenarioKey - Clé du scénario à charger
     */
    static loadExample(type, scenarioKey) {
        const scenario = EXAMPLE_SCENARIOS[type]?.[scenarioKey];
        if (!scenario) {
            console.warn(`Scenario not found: ${type}.${scenarioKey}`);
            return;
        }

        // Remplir les champs
        Object.entries(scenario.data).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
                // Déclencher l'événement input pour la validation en temps réel
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Déclencher les événements spécifiques pour mettre à jour l'UI
        if (type === 'profit') {
            const propertyTypeSelect = document.getElementById('property-type');
            const dpeSelect = document.getElementById('dpe-class');
            if (propertyTypeSelect) propertyTypeSelect.dispatchEvent(new Event('change'));
            if (dpeSelect) dpeSelect.dispatchEvent(new Event('change'));
        }

        // Notification utilisateur
        if (window.UI) {
            window.UI.showToast(`Exemple "${scenario.name}" chargé`, 'success');
        }
    }

    /**
     * Crée un bouton d'exemple
     * @param {string} type - Type de formulaire
     * @param {string} scenarioKey - Clé du scénario
     * @param {object} scenario - Données du scénario
     * @returns {HTMLElement} Bouton d'exemple
     */
    static createExampleButton(type, scenarioKey, scenario) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'example-btn';
        button.innerHTML = `
      <div class="example-btn-icon">${scenario.name.split(' ')[0]}</div>
      <div class="example-btn-content">
        <div class="example-btn-title">${scenario.name.substring(3)}</div>
        <div class="example-btn-desc">${scenario.description}</div>
      </div>
    `;
        button.addEventListener('click', () => {
            this.loadExample(type, scenarioKey);
        });
        return button;
    }

    /**
     * Initialise les exemples pour un onglet
     * @param {string} type - Type de formulaire
     * @param {string} formId - ID du formulaire
     */
    static initTabExamples(type, formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Form not found: ${formId}`);
            return;
        }

        const scenarios = EXAMPLE_SCENARIOS[type];
        if (!scenarios) {
            console.warn(`No scenarios for type: ${type}`);
            return;
        }

        // Créer le container d'exemples
        const container = document.createElement('div');
        container.className = 'examples-container';
        container.innerHTML = '<h4 class="examples-title">📋 Exemples Rapides</h4>';

        const grid = document.createElement('div');
        grid.className = 'examples-grid';

        Object.entries(scenarios).forEach(([key, scenario]) => {
            grid.appendChild(this.createExampleButton(type, key, scenario));
        });

        container.appendChild(grid);

        // Insérer au début du formulaire
        form.insertBefore(container, form.firstChild);
    }

    /**
     * Initialise tous les exemples
     */
    static init() {
        // Créer les containers d'exemples pour chaque onglet
        this.initTabExamples('credit', 'loan-form');
        this.initTabExamples('profit', 'profit-form');
        this.initTabExamples('capacity', 'capacity-form');

        console.log('✓ ExampleLoader initialized');
    }
}
