/**
 * UI Manager - Handles complex UI rendering and interactions.
 * Depends on UI (utilities) and ProjectManager.
 */

import { UI } from '../utils/ui.js';
import { Security } from '../utils/security.js';
import { ProjectManager } from './projectManager.js';

export const UIManager = {
    // --- Modal Rendering Helpers ---
    renderModalSimulation(project, container) {
        if (!project.simulation) {
            container.innerHTML = '<p class="empty-msg">Aucune simulation enregistrée.</p>';
            return;
        }

        let sim = project.simulation;
        // Backward compat
        if (sim.type) {
            if (sim.type === 'credit') sim = { credit: sim.data, profit: null };
            else if (sim.type === 'profit') sim = { credit: null, profit: sim.data };
        }

        let simHtml = '';
        let hasSim = false;

        if (sim.credit) {
            hasSim = true;
            const data = sim.credit;
            simHtml += `
                <div class="mb-3 pb-3 border-bottom">
                    <div class="detail-row"><span>Type</span><strong>Crédit Immo</strong></div>
                    <div class="detail-row"><span>Montant</span><span>${UI.formatCurrency(data.amount)}</span></div>
                    <div class="detail-row"><span>Taux</span><span>${data.rate} %</span></div>
                    <div class="detail-row"><span>Durée</span><span>${data.years} ans</span></div>
                    <div class="detail-row"><span>Mensualité</span><span class="highlight-value">${UI.formatCurrency(data.monthlyPayment || 0)}</span></div>
                    ${data.totalPayment ? `<div class="detail-row"><span>Coût total</span><span>${UI.formatCurrency(data.totalPayment)}</span></div>` : ''}
                    ${data.totalInterest ? `<div class="detail-row"><span>Intérêts</span><span>${UI.formatCurrency(data.totalInterest)}</span></div>` : ''}
                </div>
            `;
        }

        if (sim.profit) {
            hasSim = true;
            const data = sim.profit;
            simHtml += `
                <div class="mb-3">
                    <div class="detail-row"><span>Type</span><strong>Rentabilité</strong></div>
                    <div class="detail-row"><span>Prix</span><span>${UI.formatCurrency(data.price)}</span></div>
                    <div class="detail-row"><span>Loyer</span><span>${UI.formatCurrency(data.rent)}</span></div>
                    ${data.grossYield ? `<div class="detail-row"><span>Rentabilité Brute</span><span>${data.grossYield.toFixed(2)} %</span></div>` : ''}
                    <div class="detail-row"><span>Rentabilité Nette</span><span class="highlight-value">${data.netYield ? data.netYield.toFixed(2) : '0.00'} %</span></div>
                    ${data.cashflow !== undefined ? `<div class="detail-row"><span>Cashflow</span><span class="highlight-value">${UI.formatCurrency(data.cashflow)}</span></div>` : ''}
                    ${data.tri ? `<div class="detail-row"><span>TRI (10 ans)</span><span>${data.tri.toFixed(2)} %</span></div>` : ''}
                </div>
            `;
        }

        if (hasSim) {
            simHtml += `<button class="load-sim-btn" onclick="window.loadSimulationFromModal('${project.id}')">Charger dans le simulateur</button>`;
            container.innerHTML = simHtml;
        } else {
            container.innerHTML = '<p class="empty-msg">Aucune simulation enregistrée.</p>';
        }
    },

    renderModalCapacity(project, container) {
        if (project.simulation && project.simulation.capacity) {
            const cap = project.simulation.capacity;
            container.innerHTML = `
                <div class="detail-row"><span>Revenus</span><span>${UI.formatCurrency(cap.income)}</span></div>
                <div class="detail-row"><span>Charges</span><span>${UI.formatCurrency(cap.expenses)}</span></div>
                <div class="detail-row"><span>Taux Endettement</span><span>${cap.debtRatio} %</span></div>
                <div class="detail-row"><span>Mensualité Max</span><span>${UI.formatCurrency(cap.maxMonthly)}</span></div>
                <div class="detail-row"><span>Capacité Totale</span><span class="highlight-value">${UI.formatCurrency(cap.totalCapacity)}</span></div>
                <button class="load-sim-btn mt-2" onclick="window.loadSimulationFromModal('${project.id}', 'capacity')">Charger la capacité</button>
            `;
        } else {
            container.innerHTML = '<p class="empty-msg">Aucune capacité enregistrée.</p>';
        }
    },

    renderModalAides(project, container) {
        if (project.aides && project.aides.eligibleAids && project.aides.eligibleAids.length > 0) {
            let aidesHtml = '<div class="tags-container">';
            project.aides.eligibleAids.forEach(aid => {
                aidesHtml += `<span class="aid-tag ${aid.tag}">${aid.name}</span>`;
            });
            aidesHtml += '</div>';

            const inputs = project.aides.inputs;
            if (inputs) {
                aidesHtml += `
                    <div class="mt-3 text-sm text-muted">
                        <p>Revenus: ${UI.formatCurrency(inputs.income)} • Occupants: ${inputs.occupants}</p>
                    </div>
                `;
            }
            container.innerHTML = aidesHtml;
        } else {
            container.innerHTML = '<p class="empty-msg">Aucune aide détectée.</p>';
        }
    },

    renderModalImpots(project, container) {
        if (project.impots && project.impots.results) {
            const res = project.impots.results;
            const inputs = project.impots.inputs;
            container.innerHTML = `
                <div class="detail-row"><span>Régime</span><span class="text-capitalize">${inputs.regime}</span></div>
                <div class="detail-row"><span>Base Imposable</span><span>${UI.formatCurrency(res.taxableBase)}</span></div>
                <div class="detail-row"><span>Impôt Total</span><span class="highlight-value">${UI.formatCurrency(res.totalTax)}</span></div>
                <div class="detail-row"><span>Taux Moyen</span><span>${res.averageRate} %</span></div>
            `;
        } else {
            container.innerHTML = '<p class="empty-msg">Aucune estimation fiscale enregistrée.</p>';
        }
    },

    renderModalTravaux(project, container) {
        if (project.travaux && project.travaux.totalCost) {
            const data = project.travaux;
            let html = `
                <div class="detail-row"><span>Surface</span><span>${data.surface} m²</span></div>
                <div class="detail-row"><span>Type</span><span class="text-capitalize">${data.renovationType}</span></div>
                <div class="detail-row"><span>Coût Total</span><span class="highlight-value">${UI.formatCurrency(data.totalCost)}</span></div>
                <div class="detail-row"><span>Coût/m²</span><span>${UI.formatCurrency(data.costPerM2)}/m²</span></div>
            `;

            if (data.breakdown && Object.keys(data.breakdown).length > 0) {
                html += '<div style="margin-top: 16px;"><strong style="color: var(--text-main); font-size: 0.9rem;">Détail par métier:</strong></div>';
                for (const [trade, cost] of Object.entries(data.breakdown)) {
                    html += `<div class="detail-row" style="margin-top: 8px;"><span>${trade}</span><span>${UI.formatCurrency(cost)}</span></div>`;
                }
            }

            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="empty-msg">Aucune estimation de travaux enregistrée.</p>';
        }
    },

    openProjectDetails(id) {
        const project = ProjectManager.getProject(id);
        if (!project) return;

        // Set Active Project
        ProjectManager.setCurrentProject(id);
        this.renderProjectsList();
        ProjectManager.displayCurrentProject('current-project-display');

        // Elements
        const modalProjectName = document.getElementById('modal-project-name');
        const modalSimSection = document.getElementById('modal-simulation-section').querySelector('.section-content');
        const modalCapacitySection = document.getElementById('modal-capacity-section').querySelector('.section-content');
        const modalAidesSection = document.getElementById('modal-aides-section').querySelector('.section-content');
        const modalImpotsSection = document.getElementById('modal-impots-section').querySelector('.section-content');
        const modalTravauxSection = document.getElementById('modal-travaux-section')?.querySelector('.section-content');
        const modal = document.getElementById('project-details-modal');

        // Populate
        modalProjectName.textContent = Security.sanitizeHTML(project.name);

        this.renderModalSimulation(project, modalSimSection);
        this.renderModalCapacity(project, modalCapacitySection);
        this.renderModalAides(project, modalAidesSection);
        this.renderModalImpots(project, modalImpotsSection);
        if (modalTravauxSection) {
            this.renderModalTravaux(project, modalTravauxSection);
        }

        // Show Modal
        modal.classList.remove('hidden');
    },

    renderProjectsList(sortMethod = 'date_desc') {
        const savedList = document.getElementById('saved-list');
        const currentProjectDisplay = document.getElementById('current-project-display');

        if (!savedList) return;

        let projects = ProjectManager.getAllProjects();
        const currentId = ProjectManager.getCurrentProjectId();

        // Sorting logic
        projects.sort((a, b) => {
            if (sortMethod === 'date_desc') return new Date(b.updatedAt) - new Date(a.updatedAt);
            if (sortMethod === 'date_asc') return new Date(a.updatedAt) - new Date(b.updatedAt);
            if (sortMethod === 'name_asc') return a.name.localeCompare(b.name);
            if (sortMethod === 'name_desc') return b.name.localeCompare(a.name);
            return 0;
        });

        savedList.innerHTML = '';

        // Handle Notes Display
        let notesContainer = document.getElementById('project-notes-container');
        if (!notesContainer && currentProjectDisplay) {
            notesContainer = document.createElement('div');
            notesContainer.id = 'project-notes-container';
            notesContainer.className = 'mt-3';
            notesContainer.style.display = 'none';
            notesContainer.innerHTML = `
                <label class="text-sm text-muted mb-3" style="display:block;">Notes du dossier</label>
                <textarea id="project-notes" style="width:100%; height:100px; padding:8px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); resize:vertical; font-family:inherit;"></textarea>
                <button id="save-notes-btn" class="save-btn" style="margin-top:5px; padding:4px 8px; font-size:0.8rem; width:auto;">Enregistrer les notes</button>
            `;
            currentProjectDisplay.parentNode.insertBefore(notesContainer, currentProjectDisplay.nextSibling);

            // Add listener for save notes
            document.getElementById('save-notes-btn').addEventListener('click', () => {
                const cid = ProjectManager.getCurrentProjectId();
                if (cid) {
                    const text = document.getElementById('project-notes').value;
                    ProjectManager.updateProject(cid, 'notes', text);
                    UI.showToast("Notes sauvegardées !", "success");
                }
            });
        }

        if (currentId) {
            const currentP = ProjectManager.getProject(currentId);
            if (currentP && notesContainer) {
                notesContainer.style.display = 'block';
                document.getElementById('project-notes').value = currentP.notes || "";
            } else if (notesContainer) {
                notesContainer.style.display = 'none';
            }
        } else if (notesContainer) {
            notesContainer.style.display = 'none';
        }

        if (projects.length === 0) {
            savedList.innerHTML = '<div class="empty-state"><p>Aucun projet sauvegardé</p></div>';
            return;
        }

        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = `saved-item ${project.id === currentId ? 'active-project' : ''}`;
            item.style.cursor = 'pointer';

            // Build badges for data types
            const badges = [];
            if (project.simulation && (project.simulation.credit || project.simulation.profit || project.simulation.capacity)) {
                badges.push('<span class="saved-item-badge has-simulation">💳 Simul.</span>');
            }
            if (project.travaux) {
                badges.push('<span class="saved-item-badge has-travaux">🔨 Travaux</span>');
            }
            if (project.aides && project.aides.eligibleAids && project.aides.eligibleAids.length > 0) {
                badges.push('<span class="saved-item-badge has-aides">🎁 Aides</span>');
            }
            if (project.impots && project.impots.results) {
                badges.push('<span class="saved-item-badge has-impots">💼 Impôts</span>');
            }

            // Build details HTML
            let detailsHtml = '<div class="saved-details">';

            // Simulation
            if (project.simulation) {
                let sim = project.simulation;
                // Backward compat
                if (sim.type) {
                    if (sim.type === 'credit') sim = { credit: sim.data, profit: null };
                    else if (sim.type === 'profit') sim = { credit: null, profit: sim.data };
                }

                if (sim.credit) {
                    const amount = sim.credit.amount || 0;
                    const monthly = sim.credit.monthlyPayment || 0;
                    detailsHtml += `<div class="saved-detail-row"><span>💳 Crédit</span><span>${UI.formatCurrency(amount)}</span></div>`;
                    if (monthly > 0) {
                        detailsHtml += `<div class="saved-detail-row"><span>Mensualité</span><span>${UI.formatCurrency(monthly)}</span></div>`;
                    }
                }
                if (sim.profit) {
                    const netYield = sim.profit.netYield || 0;
                    const cashflow = sim.profit.cashflow || 0;
                    detailsHtml += `<div class="saved-detail-row"><span>📊 Rentabilité</span><span>${netYield.toFixed(2)}%</span></div>`;
                    if (cashflow !== 0) {
                        detailsHtml += `<div class="saved-detail-row"><span>Cashflow</span><span>${UI.formatCurrency(cashflow)}</span></div>`;
                    }
                }
                if (sim.capacity) {
                    detailsHtml += `<div class="saved-detail-row"><span>💰 Capacité</span><span>${UI.formatCurrency(sim.capacity.totalCapacity)}</span></div>`;
                }
            }

            // Travaux
            if (project.travaux && project.travaux.totalCost) {
                detailsHtml += `<div class="saved-detail-row"><span>🔨 Travaux</span><span>${UI.formatCurrency(project.travaux.totalCost)}</span></div>`;
            }

            // Aides
            if (project.aides && project.aides.eligibleAids) {
                const count = project.aides.eligibleAids.length;
                detailsHtml += `<div class="saved-detail-row"><span>🎁 Aides</span><span>${count} aide(s)</span></div>`;
            }

            // Impots
            if (project.impots && project.impots.results) {
                const tax = project.impots.results.totalTax;
                detailsHtml += `<div class="saved-detail-row"><span>💼 Impôts</span><span>${UI.formatCurrency(tax)}</span></div>`;
            }

            if (!project.simulation && !project.travaux && !project.aides && !project.impots) {
                detailsHtml += `<div class="saved-detail-row"><span>Aucune donnée</span><span>-</span></div>`;
            }

            detailsHtml += '</div>';

            item.innerHTML = `
                <div class="saved-item-header">
                    <div class="saved-item-title">
                        <span class="saved-item-name" data-project-name></span>
                        <div class="saved-item-meta">
                            <span>${UI.formatRelativeDate(project.updatedAt)}</span>
                            ${badges.join('')}
                        </div>
                    </div>
                    <div class="saved-item-actions">
                        <button class="rename-btn" data-id="${project.id}" title="Renommer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V16C3 16.5523 3.44772 17 4 17H15C15.5523 17 16 16.5523 16 16V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="delete-btn" data-id="${project.id}" title="Supprimer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                ${detailsHtml}
            `;

            // Safely set project name using textContent
            const nameSpan = item.querySelector('[data-project-name]');
            if (nameSpan) {
                nameSpan.textContent = project.name;
            }

            // Load project details on click
            item.addEventListener('click', () => {
                this.openProjectDetails(project.id);
            });

            savedList.appendChild(item);
        });

        this.setupProjectActionListeners();
    },

    setupProjectActionListeners() {
        // Add rename listeners (Open Modal)
        document.querySelectorAll('.rename-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const project = ProjectManager.getProject(id);
                if (project) {
                    const modal = document.getElementById('rename-project-modal');
                    const input = document.getElementById('rename-input');
                    const saveBtn = document.getElementById('save-rename-btn');

                    input.value = project.name;
                    modal.classList.remove('hidden');
                    input.focus();

                    // One-time save handler
                    const handleSave = () => {
                        const newName = input.value.trim();
                        if (newName) {
                            ProjectManager.renameProject(id, newName);
                            // Re-render with current sort
                            const sortSelect = document.getElementById('sort-projects');
                            this.renderProjectsList(sortSelect ? sortSelect.value : 'date_desc');
                            ProjectManager.displayCurrentProject('current-project-display');
                            UI.showToast("Dossier renommé", "success");
                            modal.classList.add('hidden');
                        }
                        cleanup();
                    };

                    const handleClose = () => {
                        modal.classList.add('hidden');
                        cleanup();
                    };

                    const cleanup = () => {
                        saveBtn.removeEventListener('click', handleSave);
                        modal.querySelectorAll('.close-modal-btn').forEach(b => b.removeEventListener('click', handleClose));
                    };

                    saveBtn.addEventListener('click', handleSave);
                    modal.querySelectorAll('.close-modal-btn').forEach(b => b.addEventListener('click', handleClose));
                }
            });
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const deletedProject = ProjectManager.deleteProject(id);

                if (deletedProject) {
                    this.renderProjectsList();
                    ProjectManager.displayCurrentProject('current-project-display');

                    // Show Undo Toast
                    const toast = document.createElement('div');
                    toast.className = 'toast toast-info show';
                    toast.innerHTML = `
                        <span>Dossier supprimé</span>
                        <button class="undo-btn" style="background:none; border:none; color:inherit; text-decoration:underline; cursor:pointer; margin-left:10px; font-weight:bold;">Annuler</button>
                    `;

                    const container = document.getElementById('toast-container') || document.body;
                    if (!document.getElementById('toast-container')) {
                        const tc = document.createElement('div');
                        tc.id = 'toast-container';
                        document.body.appendChild(tc);
                        tc.appendChild(toast);
                    } else {
                        container.appendChild(toast);
                    }

                    // Undo Logic
                    const undoBtn = toast.querySelector('.undo-btn');
                    let undone = false;

                    undoBtn.onclick = () => {
                        undone = true;
                        ProjectManager.restoreProject(deletedProject);
                        this.renderProjectsList();
                        ProjectManager.displayCurrentProject('current-project-display');
                        toast.remove();
                        UI.showToast("Suppression annulée", "success");
                    };

                    // Auto remove after 5s
                    setTimeout(() => {
                        if (!undone && toast.parentNode) {
                            toast.classList.remove('show');
                            setTimeout(() => toast.remove(), 300);
                        }
                    }, 5000);
                }
            });
        });
    }
};

