/**
 * ModeManager.js
 * Gère le mode d'affichage (Débutant/Avancé) pour adapter l'interface utilisateur
 * @version 1.0.0
 */

export class ModeManager {
    static MODES = {
        BEGINNER: 'beginner',
        ADVANCED: 'advanced'
    };

    /**
     * Récupère le mode actuel depuis le localStorage
     * @returns {string} Mode actuel (beginner ou advanced)
     */
    static getCurrentMode() {
        return localStorage.getItem('userMode') || this.MODES.BEGINNER;
    }

    /**
     * Définit et applique un nouveau mode
     * @param {string} mode - Mode à appliquer (beginner ou advanced)
     */
    static setMode(mode) {
        localStorage.setItem('userMode', mode);
        this.applyMode(mode);

        // Notification utilisateur
        if (window.UI) {
            const modeText = mode === this.MODES.BEGINNER ? 'Débutant' : 'Avancé';
            window.UI.showToast(`Mode ${modeText} activé`, 'success');
        }
    }

    /**
     * Applique le mode à l'interface
     * @param {string} mode - Mode à appliquer
     */
    static applyMode(mode) {
        document.body.dataset.userMode = mode;

        // Masquer/afficher champs selon mode
        const advancedFields = document.querySelectorAll('[data-mode="advanced"]');
        advancedFields.forEach(field => {
            field.style.display = mode === this.MODES.ADVANCED ? 'block' : 'none';
        });

        // Mettre à jour le texte de description
        const descText = document.getElementById('mode-description-text');
        if (descText) {
            descText.textContent = mode === this.MODES.BEGINNER
                ? 'Interface simplifiée avec champs essentiels uniquement'
                : 'Tous les champs disponibles pour une analyse détaillée';
        }
    }

    /**
     * Initialise le gestionnaire de mode
     */
    static init() {
        const currentMode = this.getCurrentMode();
        this.applyMode(currentMode);

        // Setup toggle button
        const toggle = document.getElementById('mode-toggle');
        if (toggle) {
            toggle.checked = currentMode === this.MODES.ADVANCED;
            toggle.addEventListener('change', (e) => {
                this.setMode(e.target.checked ? this.MODES.ADVANCED : this.MODES.BEGINNER);
            });
        }

        console.log(`✓ ModeManager initialized - Current mode: ${currentMode}`);
    }
}
