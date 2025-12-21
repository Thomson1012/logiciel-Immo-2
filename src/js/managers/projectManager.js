/**
 * Project Manager - Handles saving, loading, and managing projects (dossiers).
 * Shared across index.html, aides.html, and impots.html
 */

import { Security } from '../utils/security.js';
import { UI } from '../utils/ui.js';

export const ProjectManager = {
    STORAGE_KEY: 'real_estate_projects',
    CURRENT_PROJECT_KEY: 'current_project_id',
    TRASH_KEY: 'real_estate_projects_trash',
    BACKUP_KEY: 'real_estate_projects_backup',
    LAST_BACKUP_KEY: 'last_backup_timestamp',
    TRASH_RETENTION_DAYS: 30,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours

    // --- Core Data Management ---
    // Note: Cache removed to ensure fresh data on each page load
    // Each page load gets its own module instance, so cache doesn't help cross-page

    getAllProjects() {
        // Always read from storage to get fresh data
        if (Security && Security.storage.isAvailable()) {
            return Security.storage.get(this.STORAGE_KEY) || [];
        } else {
            // Fallback for older browsers
            try {
                const projects = localStorage.getItem(this.STORAGE_KEY);
                return projects ? JSON.parse(projects) : [];
            } catch (e) {
                console.error('Error loading projects', e);
                return [];
            }
        }
    },

    saveAllProjects(projects) {
        // Validate data before saving
        if (!Array.isArray(projects)) {
            console.error('ProjectManager: Invalid data - projects must be an array');
            return false;
        }

        // Validate each project has required fields
        const validProjects = projects.filter(p => {
            if (!p || typeof p !== 'object') return false;
            if (!p.id || !p.name) return false;
            return true;
        });


        if (validProjects.length !== projects.length) {
            console.warn('ProjectManager: Some invalid projects were filtered out');
        }

        if (Security && Security.storage.isAvailable()) {
            try {
                Security.storage.set(this.STORAGE_KEY, validProjects);
                return true;
            } catch (e) {
                return this._handleStorageError(e);
            }
        } else {
            // Fallback
            try {
                const dataString = JSON.stringify(validProjects);
                localStorage.setItem(this.STORAGE_KEY, dataString);
                return true;
            } catch (e) {
                return this._handleStorageError(e);
            }
        }
    },

    /**
     * Handle LocalStorage errors with user-friendly messages
     * @private
     */
    _handleStorageError(error) {
        console.error('ProjectManager: Failed to save projects', error);

        let userMessage = 'Erreur lors de la sauvegarde des données';

        // Check for quota exceeded error
        if (error.name === 'QuotaExceededError' ||
            error.code === 22 ||
            error.code === 1014) {
            userMessage = 'Espace de stockage insuffisant. Supprimez d\'anciens projets ou exportez vos données.';
        }
        // Check if localStorage is disabled
        else if (error.name === 'SecurityError') {
            userMessage = 'Le stockage local est désactivé dans votre navigateur. Activez-le dans les paramètres.';
        }

        if (UI && UI.showToast) {
            UI.showToast(userMessage, 'error');
        } else {
            alert(userMessage);
        }

        return false;
    },

    getProject(id) {
        const projects = this.getAllProjects();
        return projects.find(p => p.id === id);
    },

    createProject(name) {
        // Validate name
        if (Security) {
            const validation = Security.validateString(name, {
                required: true,
                minLength: 1,
                maxLength: 100
            });
            if (!validation.valid) {
                if (UI && UI.showToast) {
                    UI.showToast(validation.error, 'error');
                }
                return null;
            }
            name = validation.value;
        }

        const projects = this.getAllProjects();
        const newProject = {
            id: Date.now().toString(),
            name: name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Data sections
            simulation: { credit: null, profit: null, capacity: null },
            aides: null,
            impots: null,
            travaux: null,
            notes: "",
            // Organization
            tags: [],
            category: "autre",
            status: "en-cours",
            color: "#6366f1"
        };
        projects.unshift(newProject);
        this.saveAllProjects(projects);
        this.setCurrentProject(newProject.id);
        return newProject;
    },

    updateProject(id, section, data) {
        const projects = this.getAllProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            if (section === 'name') {
                projects[index].name = data;
            } else {
                projects[index][section] = data;
            }
            projects[index].updatedAt = new Date().toISOString();
            this.saveAllProjects(projects);
            return projects[index];
        }
        return null;
    },

    renameProject(id, newName) {
        return this.updateProject(id, 'name', newName);
    },

    deleteProject(id) {
        let projects = this.getAllProjects();
        const projectToDelete = projects.find(p => p.id === id);

        if (!projectToDelete) return null;

        projects = projects.filter(p => p.id !== id);
        this.saveAllProjects(projects);

        // If deleted project was active, clear active
        if (this.getCurrentProjectId() === id) {
            if (Security && Security.storage.isAvailable()) {
                Security.storage.remove(this.CURRENT_PROJECT_KEY);
            } else {
                localStorage.removeItem(this.CURRENT_PROJECT_KEY);
            }
        }
        return projectToDelete;
    },

    restoreProject(project) {
        if (!project) return;
        const projects = this.getAllProjects();
        // Add back to top or sort by date? Let's add to top for visibility
        projects.unshift(project);
        this.saveAllProjects(projects);
    },

    // --- Active Project Context ---

    setCurrentProject(id) {
        localStorage.setItem(this.CURRENT_PROJECT_KEY, id);
        // Dispatch event so other components can react if needed
        window.dispatchEvent(new CustomEvent('projectChanged', { detail: { id } }));
    },

    getCurrentProjectId() {
        return localStorage.getItem(this.CURRENT_PROJECT_KEY);
    },

    getCurrentProject() {
        const id = this.getCurrentProjectId();
        if (!id) return null;
        return this.getProject(id);
    },

    // --- UI Helpers (Shared) ---

    // Renders the current project name in a specific element
    displayCurrentProject(elementId) {
        const project = this.getCurrentProject();
        const el = document.getElementById(elementId);
        if (el) {
            if (project) {
                el.textContent = `Dossier : ${project.name}`;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    },

    // --- Export/Import ---

    /**
     * Export all projects as JSON file
     */
    exportToJSON() {
        const projects = this.getAllProjects();
        const exportData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            projectsCount: projects.length,
            projects: projects
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mes-projets-immobiliers-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (UI && UI.showToast) {
            UI.showToast(`${projects.length} projet(s) exporté(s) avec succès`, 'success');
        }
    },

    /**
     * Import projects from JSON file
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);

                    // Validation
                    if (!importData.projects || !Array.isArray(importData.projects)) {
                        throw new Error('Format de fichier invalide');
                    }

                    // Merge strategy: ask user
                    const currentProjects = this.getAllProjects();

                    if (currentProjects.length > 0) {
                        const choice = confirm(
                            `Vous avez ${currentProjects.length} projet(s) existant(s).\n\n` +
                            `Voulez-vous FUSIONNER les projets importés avec les existants ?\n\n` +
                            `OK = Fusionner | Annuler = Remplacer tout`
                        );

                        if (choice) {
                            // Merge: add imported projects
                            const merged = [...currentProjects, ...importData.projects];
                            this.saveAllProjects(merged);
                        } else {
                            // Replace: overwrite all
                            this.saveAllProjects(importData.projects);
                        }
                    } else {
                        this.saveAllProjects(importData.projects);
                    }

                    if (UI && UI.showToast) {
                        UI.showToast(
                            `${importData.projects.length} projet(s) importé(s) avec succès`,
                            'success'
                        );
                    }

                    // Refresh UI
                    if (UIManager && UIManager.renderProjectsList) {
                        UIManager.renderProjectsList();
                    }

                    resolve(importData.projects.length);
                } catch (error) {
                    if (UI && UI.showToast) {
                        UI.showToast('Erreur lors de l\'import: ' + error.message, 'error');
                    }
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    },

    // --- Trash Management ---

    /**
     * Move project to trash instead of deleting permanently
     */
    moveToTrash(id) {
        const project = this.getProject(id);
        if (!project) return null;

        // Add deletion metadata
        project.deletedAt = new Date().toISOString();

        // Get trash
        let trash = [];
        try {
            const trashData = localStorage.getItem(this.TRASH_KEY);
            trash = trashData ? JSON.parse(trashData) : [];
        } catch (e) {
            console.error('Error loading trash', e);
        }

        // Add to trash
        trash.unshift(project);

        // Clean old items (> 30 days)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.TRASH_RETENTION_DAYS);
        trash = trash.filter(p => new Date(p.deletedAt) > cutoffDate);

        // Save trash
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));

        // Remove from active projects
        let projects = this.getAllProjects();
        projects = projects.filter(p => p.id !== id);
        this.saveAllProjects(projects);

        // Clear current project if it was the deleted one
        if (this.getCurrentProjectId() === id) {
            localStorage.removeItem(this.CURRENT_PROJECT_KEY);
        }

        if (UI && UI.showToast) {
            UI.showToast('Projet déplacé dans la corbeille', 'info');
        }

        return project;
    },

    /**
     * Restore project from trash
     */
    restoreFromTrash(id) {
        let trash = [];
        try {
            const trashData = localStorage.getItem(this.TRASH_KEY);
            trash = trashData ? JSON.parse(trashData) : [];
        } catch (e) {
            return null;
        }

        const project = trash.find(p => p.id === id);
        if (!project) return null;

        // Remove from trash
        trash = trash.filter(p => p.id !== id);
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));

        // Remove deletion metadata
        delete project.deletedAt;

        // Add back to projects
        const projects = this.getAllProjects();
        projects.unshift(project);
        this.saveAllProjects(projects);

        if (UI && UI.showToast) {
            UI.showToast('Projet restauré avec succès', 'success');
        }

        return project;
    },

    /**
     * Get all trashed projects
     */
    getTrashedProjects() {
        try {
            const trashData = localStorage.getItem(this.TRASH_KEY);
            return trashData ? JSON.parse(trashData) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Permanently delete a project from trash
     */
    permanentlyDelete(id) {
        let trash = this.getTrashedProjects();
        trash = trash.filter(p => p.id !== id);
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(trash));

        if (UI && UI.showToast) {
            UI.showToast('Projet supprimé définitivement', 'success');
        }
    },

    /**
     * Empty entire trash
     */
    emptyTrash() {
        localStorage.removeItem(this.TRASH_KEY);
        if (UI && UI.showToast) {
            UI.showToast('Corbeille vidée', 'success');
        }
    },

    // --- Auto Backup ---

    /**
     * Setup automatic backup system
     */
    setupAutoBackup() {
        const checkBackup = () => {
            const lastBackup = localStorage.getItem(this.LAST_BACKUP_KEY);
            const now = Date.now();

            if (!lastBackup || (now - parseInt(lastBackup)) > this.BACKUP_INTERVAL) {
                this.createAutoBackup();
                localStorage.setItem(this.LAST_BACKUP_KEY, now.toString());
            }
        };

        // Check on load
        checkBackup();

        // Check every hour
        setInterval(checkBackup, 60 * 60 * 1000);
    },

    /**
     * Create automatic backup
     */
    createAutoBackup() {
        const projects = this.getAllProjects();
        const backup = {
            timestamp: new Date().toISOString(),
            projects: projects
        };

        try {
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
            console.log('Auto-backup created:', backup.timestamp);
        } catch (e) {
            console.error('Auto-backup failed', e);
        }
    },

    /**
     * Restore from last backup
     */
    restoreFromBackup() {
        try {
            const backupData = localStorage.getItem(this.BACKUP_KEY);
            if (!backupData) {
                if (UI && UI.showToast) {
                    UI.showToast('Aucune sauvegarde disponible', 'warning');
                }
                return false;
            }

            const backup = JSON.parse(backupData);
            const confirmed = confirm(
                `Restaurer la sauvegarde du ${new Date(backup.timestamp).toLocaleString('fr-FR')} ?\n\n` +
                `Cela remplacera vos projets actuels.`
            );

            if (confirmed) {
                this.saveAllProjects(backup.projects);
                if (UI && UI.showToast) {
                    UI.showToast('Sauvegarde restaurée avec succès', 'success');
                }
                // Refresh UI
                if (UIManager && UIManager.renderProjectsList) {
                    UIManager.renderProjectsList();
                }
                return true;
            }
        } catch (e) {
            if (UI && UI.showToast) {
                UI.showToast('Erreur lors de la restauration', 'error');
            }
        }
        return false;
    },

    /**
     * Get last backup info
     */
    getLastBackupInfo() {
        try {
            const backupData = localStorage.getItem(this.BACKUP_KEY);
            const lastBackupTime = localStorage.getItem(this.LAST_BACKUP_KEY);

            if (!backupData) return null;

            const backup = JSON.parse(backupData);
            return {
                timestamp: backup.timestamp,
                projectsCount: backup.projects.length,
                lastBackupTime: lastBackupTime ? new Date(parseInt(lastBackupTime)) : null
            };
        } catch (e) {
            return null;
        }
    },

    // --- Tags and Categories ---

    /**
     * Add tag to project
     */
    addTag(projectId, tag) {
        const project = this.getProject(projectId);
        if (!project) return false;

        if (!project.tags) project.tags = [];
        const normalizedTag = tag.toLowerCase().trim();

        if (!project.tags.includes(normalizedTag)) {
            project.tags.push(normalizedTag);
            this.updateProject(projectId, 'tags', project.tags);
            return true;
        }
        return false;
    },

    /**
     * Remove tag from project
     */
    removeTag(projectId, tag) {
        const project = this.getProject(projectId);
        if (!project || !project.tags) return false;

        project.tags = project.tags.filter(t => t !== tag);
        this.updateProject(projectId, 'tags', project.tags);
        return true;
    },

    /**
     * Set project category
     */
    setCategory(projectId, category) {
        return this.updateProject(projectId, 'category', category);
    },

    /**
     * Set project status
     */
    setStatus(projectId, status) {
        return this.updateProject(projectId, 'status', status);
    },

    /**
     * Set project color
     */
    setColor(projectId, color) {
        return this.updateProject(projectId, 'color', color);
    },

    /**
     * Filter projects by tag
     */
    filterByTag(tag) {
        return this.getAllProjects().filter(p =>
            p.tags && p.tags.includes(tag)
        );
    },

    /**
     * Filter projects by category
     */
    filterByCategory(category) {
        return this.getAllProjects().filter(p =>
            p.category === category
        );
    },

    /**
     * Filter projects by status
     */
    filterByStatus(status) {
        return this.getAllProjects().filter(p =>
            p.status === status
        );
    },

    /**
     * Get all unique tags used across projects
     */
    getAllTags() {
        const allTags = new Set();
        this.getAllProjects().forEach(project => {
            if (project.tags) {
                project.tags.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags).sort();
    },

    // --- Search ---

    /**
     * Search projects by query
     */
    searchProjects(query) {
        if (!query || query.trim() === '') {
            return this.getAllProjects();
        }

        const lowerQuery = query.toLowerCase().trim();

        return this.getAllProjects().filter(project => {
            // Search in name
            if (project.name.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in tags
            if (project.tags && project.tags.some(tag =>
                tag.toLowerCase().includes(lowerQuery)
            )) {
                return true;
            }

            // Search in category
            if (project.category && project.category.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in notes
            if (project.notes && project.notes.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in simulation data (basic)
            if (project.simulation) {
                const simStr = JSON.stringify(project.simulation).toLowerCase();
                if (simStr.includes(lowerQuery)) {
                    return true;
                }
            }

            return false;
        });
    },

    // --- Templates ---

    /**
     * Create project from template
     */
    createFromTemplate(templateKey) {
        // Templates will be defined in templates.js
        if (!window.ProjectTemplates || !window.ProjectTemplates[templateKey]) {
            console.error('Template not found:', templateKey);
            return null;
        }

        const template = window.ProjectTemplates[templateKey];

        const project = {
            id: Date.now().toString(),
            name: template.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            simulation: template.simulation || { credit: null, profit: null, capacity: null },
            aides: null,
            impots: null,
            notes: template.description || "",
            tags: template.tags || [],
            category: template.category || "autre",
            status: "en-cours",
            color: template.color || "#6366f1"
        };

        const projects = this.getAllProjects();
        projects.unshift(project);
        this.saveAllProjects(projects);
        this.setCurrentProject(project.id);

        if (UI && UI.showToast) {
            UI.showToast(`Projet "${template.name}" créé depuis le modèle`, 'success');
        }

        return project;
    },

    // --- Utilities ---

    /**
     * Duplicate a project
     */
    duplicateProject(id) {
        const original = this.getProject(id);
        if (!original) return null;

        const duplicate = JSON.parse(JSON.stringify(original)); // Deep clone
        duplicate.id = Date.now().toString();
        duplicate.name = `${original.name} (copie)`;
        duplicate.createdAt = new Date().toISOString();
        duplicate.updatedAt = new Date().toISOString();

        const projects = this.getAllProjects();
        projects.unshift(duplicate);
        this.saveAllProjects(projects);

        if (UI && UI.showToast) {
            UI.showToast('Projet dupliqué avec succès', 'success');
        }

        return duplicate;
    },

    /**
     * Get project statistics
     */
    getProjectStats() {
        const projects = this.getAllProjects();

        const stats = {
            total: projects.length,
            byCategory: {},
            byStatus: {},
            totalValue: 0,
            tags: this.getAllTags()
        };

        projects.forEach(project => {
            // Count by category
            const cat = project.category || 'autre';
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

            // Count by status
            const status = project.status || 'en-cours';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Sum total value
            if (project.simulation && project.simulation.profit && project.simulation.profit.price) {
                stats.totalValue += project.simulation.profit.price;
            }
        });

        return stats;
    }
};
