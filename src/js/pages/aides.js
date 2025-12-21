import { CONSTANTS } from '../core/constants.js';
import { ProjectManager } from '../managers/projectManager.js';
import { UI } from '../utils/ui.js';
import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    ThemeManager.init();
    // Initialize Keyboard Navigation
    KeyboardNavigation.init();

    const steps = document.querySelectorAll('.question-step');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    const showResultsBtn = document.getElementById('show-results');
    const restartBtn = document.getElementById('restart-btn');
    const questionnaireContainer = document.getElementById('questionnaire-container');
    const resultsContainer = document.getElementById('results-container');
    const aidsList = document.getElementById('aids-list');
    const saveBtn = document.getElementById('save-aides-btn');

    let currentStep = 0;

    // --- Project Management Integration ---
    const projectHeader = document.getElementById('project-header');

    // Check for active project
    const currentProject = ProjectManager.getCurrentProject();
    if (currentProject) {
        projectHeader.textContent = `Dossier : ${currentProject.name}`;
        projectHeader.style.display = 'block';
    }

    // Navigation Logic
    const updateSteps = () => {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    };

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateSteps();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateSteps();
            }
        });
    });

    restartBtn.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        questionnaireContainer.classList.remove('hidden');
        currentStep = 0;
        updateSteps();
        if (saveBtn) saveBtn.style.display = 'none';
    });

    // Calculation Logic - UPDATED 2024
    showResultsBtn.addEventListener('click', () => {
        const projectType = document.querySelector('input[name="projectType"]:checked').value;
        const propertyState = document.getElementById('propertyState').value;
        const isFirstTime = document.querySelector('input[name="firstTime"]:checked').value === 'yes';
        const income = parseFloat(document.getElementById('income').value) || 0;
        const occupants = parseInt(document.getElementById('occupants').value) || 1;

        const eligibleAids = [];
        const ptzZone = document.getElementById('ptz-zone').value;

        // Logic 1: PTZ (Prêt à Taux Zéro) - 2024 conditions with zones
        if (projectType === 'purchase' && isFirstTime && ptzZone) {
            const zoneLimits = CONSTANTS.AIDS.PTZ.INCOME_LIMITS[ptzZone];
            const incomeLimitPTZ = zoneLimits[occupants] || zoneLimits[5];

            if (income < incomeLimitPTZ) {
                // Estimate property price (we don't have it, so we'll give general info)
                const maxPTZ = CONSTANTS.AIDS.PTZ.MAX_AMOUNT[ptzZone];
                const quotite = propertyState === 'new' ?
                    CONSTANTS.AIDS.PTZ.QUOTITE.NEW :
                    CONSTANTS.AIDS.PTZ.QUOTITE.OLD_WORKS;

                eligibleAids.push({
                    name: `Prêt à Taux Zéro (PTZ) 2024 - Zone ${ptzZone}`,
                    tag: "tag-ptz",
                    desc: `✅ Vous êtes éligible au PTZ en zone ${ptzZone} !
                           <br><br>
                           <strong>Montant maximum :</strong> ${UI.formatCurrency(maxPTZ)} 
                           (${quotite * 100}% du prix d'achat, plafonné)
                           <br>
                           <strong>Durée :</strong> 20-25 ans selon vos revenus
                           <br>
                           <strong>Plafond de revenus :</strong> ${UI.formatCurrency(incomeLimitPTZ)} pour ${occupants} personne(s)
                           <br><br>
                           💡 <em>Le PTZ finance ${quotite * 100}% de votre achat ${propertyState === 'new' ? '(neuf)' : '(ancien avec travaux)'} sans intérêts ni frais de dossier.</em>`
                });
            } else {
                // Not eligible - show why
                eligibleAids.push({
                    name: `PTZ - Non éligible (Zone ${ptzZone})`,
                    tag: "tag-warning",
                    desc: `❌ Vos revenus (${UI.formatCurrency(income)}) dépassent le plafond de ${UI.formatCurrency(incomeLimitPTZ)} pour ${occupants} personne(s) en zone ${ptzZone}.`
                });
            }
        } else if (projectType === 'purchase' && isFirstTime && !ptzZone) {
            eligibleAids.push({
                name: "PTZ - Zone non renseignée",
                tag: "tag-warning",
                desc: "⚠️ Veuillez sélectionner votre zone géographique pour vérifier votre éligibilité au PTZ."
            });
        }

        // Logic 2: MaPrimeRénov' - 2024
        if (projectType === 'renovation' || (projectType === 'purchase' && propertyState === 'old_works')) {
            const maprimeDesc = income < CONSTANTS.AIDS.MA_PRIME_RENOV.THRESHOLDS.BLUE ?
                "MaPrimeRénov' BLEU: Vous êtes éligible aux aides maximales (ex: 10 000€ pour pompe à chaleur, 25€/m² isolation). Bonus sortie passoire thermique: +10 000€." :
                income < CONSTANTS.AIDS.MA_PRIME_RENOV.THRESHOLDS.YELLOW ?
                    "MaPrimeRénov' JAUNE: Aides intermédiaires (ex: 8 000€ pour pompe à chaleur, 20€/m² isolation). Bonus BBC: +1 500€." :
                    income < CONSTANTS.AIDS.MA_PRIME_RENOV.THRESHOLDS.VIOLET ?
                        "MaPrimeRénov' VIOLET: Aides réduites (ex: 4 000€ pour pompe à chaleur, 15€/m² isolation)." :
                        "MaPrimeRénov' ROSE: Aides limitées aux travaux d'isolation et ventilation. Consultez France Rénov' pour le détail.";

            eligibleAids.push({
                name: "MaPrimeRénov' 2024",
                tag: "tag-renov",
                desc: maprimeDesc
            });
        }

        // Logic 3: Loc'Avantages (remplace Pinel/Pinel+) - 2024
        if (projectType === 'investment' && propertyState === 'new') {
            eligibleAids.push({
                name: "Loc'Avantages (nouveau 2024)",
                tag: "tag-locavantages",
                desc: "Nouveau dispositif remplaçant Pinel. Réduction d'impôt de 15% à 25% selon le loyer pratiqué vs loyer marché. Engagement 6, 9 ou 12 ans. Plafonds loyers stricts selon zone."
            });
        }

        // Logic 4: Denormandie - 2024
        if (projectType === 'investment' && propertyState === 'old_works') {
            eligibleAids.push({
                name: "Denormandie",
                tag: "tag-denormandie",
                desc: "Réduction d'impôt de 12% à 21% pour achat ancien avec travaux (min 25% du coût total). Réservé aux villes moyennes éligibles. Engagement location 6, 9 ou 12 ans."
            });
        }

        // Logic 5: Éco-PTZ - 2024
        if (projectType === 'renovation' || propertyState === 'old_works') {
            eligibleAids.push({
                name: `Éco-PTZ 2024`,
                tag: "tag-renov",
                desc: `Prêt sans intérêts jusqu'à ${UI.formatCurrency(CONSTANTS.AIDS.ECO_PTZ.MAX_AMOUNT)} pour travaux de rénovation énergétique. Cumulable avec MaPrimeRénov'. Durée: 15-20 ans. Conditions: logement de plus de 2 ans.`
            });
        }

        // Logic 6: TVA Réduite (5.5%) - 2024
        if ((projectType === 'renovation' || propertyState === 'old_works')) {
            eligibleAids.push({
                name: `TVA Réduite ${(CONSTANTS.AIDS.TVA_REDUCED * 100).toFixed(1)}%`,
                tag: "tag-renov",
                desc: `TVA à ${(CONSTANTS.AIDS.TVA_REDUCED * 100).toFixed(1)}% au lieu de 20% pour les travaux de rénovation énergétique. Applicable directement sur la facture. Conditions: logement de plus de 2 ans.`
            });
        }

        // Logic 7: Exonération Taxe Foncière
        if ((projectType === 'purchase' && propertyState === 'new') ||
            (projectType === 'renovation' && income < CONSTANTS.AIDS.MA_PRIME_RENOV.THRESHOLDS.YELLOW)) {
            eligibleAids.push({
                name: "Exonération Taxe Foncière",
                tag: "tag-ptz",
                desc: "Exonération partielle ou totale de taxe foncière pendant 2 à 5 ans pour logement neuf BBC ou après travaux d'économie d'énergie. Décision communale."
            });
        }

        displayResults(eligibleAids);

        // Save Logic
        if (saveBtn) {
            saveBtn.style.display = 'block';
            saveBtn.onclick = () => {
                const currentId = ProjectManager.getCurrentProjectId();
                if (!currentId) {
                    UI.showToast("Veuillez d'abord créer ou sélectionner un dossier sur la page principale.", "warning");
                    return;
                }

                ProjectManager.updateProject(currentId, 'aides', {
                    eligibleAids: eligibleAids,
                    inputs: { projectType, propertyState, isFirstTime, income, occupants }
                });

                UI.showToast("Résultats sauvegardés dans le dossier !", "success");
            };
        }
    });

    const displayResults = (aids) => {
        questionnaireContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        aidsList.innerHTML = '';

        if (aids.length === 0) {
            aidsList.innerHTML = `
                <div class="aid-card">
                    <h3>Aucune aide spécifique détectée</h3>
                    <p>D'après vos réponses, nous n'avons pas identifié d'aides majeures. Cependant, n'hésitez pas à consulter un conseiller France Rénov' ou votre banque pour une étude personnalisée.</p>
                </div>
            `;
            return;
        }

        aids.forEach(aid => {
            const card = document.createElement('div');
            card.className = 'aid-card';
            card.innerHTML = `
                <span class="aid-tag ${aid.tag}">${aid.name}</span>
                <p>${aid.desc}</p>
            `;
            aidsList.appendChild(card);
        });
    };
});
