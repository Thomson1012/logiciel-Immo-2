import { ProjectManager } from '../managers/projectManager.js';
import { UI } from '../utils/ui.js';
import { Security } from '../utils/security.js';
import { ProjectComparator } from '../utils/projectComparator.js';
import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme Manager
    ThemeManager.init();
    // Initialize Keyboard Navigation
    KeyboardNavigation.init();

    const selector = document.getElementById('project-selector');
    const compareBtn = document.getElementById('compare-btn');
    const results = document.getElementById('comparison-results');

    try {
        const projects = ProjectManager.getAllProjects();

        if (!projects || projects.length === 0) {
            selector.innerHTML = '<p class="text-muted" style="text-align: center;">Aucun projet sauvegardé.<br><a href="index.html">Créer un projet</a></p>';
            compareBtn.disabled = true;
            return;
        }

        if (projects.length < 2) {
            selector.innerHTML = `<p class="text-muted" style="text-align: center;">Vous avez 1 projet: <strong>${Security.sanitizeHTML(projects[0].name)}</strong><br>Il en faut 2 minimum pour comparer.</p>`;
            compareBtn.disabled = true;
            return;
        }

        // Render project checkboxes
        let html = '<div class="project-checkbox-grid">';
        projects.forEach(project => {
            html += `
                <label class="project-checkbox-label">
                    <input type="checkbox" name="project-compare" value="${project.id}">
                    <span>${Security.sanitizeHTML(project.name)}</span>
                    <small>${new Date(project.createdAt).toLocaleDateString('fr-FR')}</small>
                </label>
            `;
        });
        html += '</div>';
        selector.innerHTML = html;

        // Compare button handler
        compareBtn.addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('input[name="project-compare"]:checked'))
                .map(cb => cb.value);

            if (selected.length < 2) {
                UI.showToast('Sélectionnez au moins 2 projets', 'warning');
                return;
            }

            const analyses = ProjectComparator.compareProjects(selected);
            if (analyses) {
                results.innerHTML = ProjectComparator.renderComparison(analyses);
                results.classList.remove('hidden');
                results.scrollIntoView({ behavior: 'smooth' });
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
        selector.innerHTML = `<p style="color: #ef4444;">Erreur: ${error.message}</p>`;
        compareBtn.disabled = true;
    }
});
