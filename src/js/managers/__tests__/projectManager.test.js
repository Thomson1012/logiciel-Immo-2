/**
 * Tests for ProjectManager module
 * Tests CRUD operations, export/import, trash, backup, tags, and search
 */

import { ProjectManager } from '../projectManager.js';

// Create a mock storage that simulates localStorage behavior
let mockStorage = {};

// Mock dependencies
jest.mock('../../utils/security.js', () => ({
    Security: {
        storage: {
            isAvailable: () => true,
            get: jest.fn((key) => mockStorage[key] || null),
            set: jest.fn((key, value) => {
                mockStorage[key] = value;
                return true;
            }),
            remove: jest.fn((key) => {
                delete mockStorage[key];
                return true;
            })
        },
        validateString: (value, options) => ({
            valid: value && value.length >= options.minLength && value.length <= options.maxLength,
            value: value,
            error: 'Invalid string'
        })
    }
}));

jest.mock('../../utils/ui.js', () => ({
    UI: {
        showToast: jest.fn()
    }
}));

describe('ProjectManager', () => {
    beforeEach(() => {
        // Clear mock storage before each test
        mockStorage = {};
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('CRUD Operations', () => {
        describe('createProject', () => {
            test('creates a new project with valid name', () => {
                const project = ProjectManager.createProject('Mon Appartement');

                expect(project).toBeDefined();
                expect(project.name).toBe('Mon Appartement');
                expect(project.id).toBeDefined();
                expect(project.createdAt).toBeDefined();
                expect(project.simulation).toEqual({ credit: null, profit: null, capacity: null });
            });

            test('sets default values for new project', () => {
                const project = ProjectManager.createProject('Test Project');

                expect(project.tags).toEqual([]);
                expect(project.category).toBe('autre');
                expect(project.status).toBe('en-cours');
                expect(project.color).toBe('#6366f1');
                expect(project.notes).toBe('');
            });

            test('sets project as current after creation', () => {
                const project = ProjectManager.createProject('Test');
                const currentId = ProjectManager.getCurrentProjectId();

                expect(currentId).toBe(project.id);
            });
        });

        describe('getAllProjects', () => {
            test('returns empty array when no projects', () => {
                const projects = ProjectManager.getAllProjects();
                expect(projects).toEqual([]);
            });

            test('returns all created projects', () => {
                ProjectManager.createProject('Project 1');
                ProjectManager.createProject('Project 2');

                const projects = ProjectManager.getAllProjects();
                expect(projects).toHaveLength(2);
            });
        });

        describe('getProject', () => {
            test('retrieves project by id', () => {
                const created = ProjectManager.createProject('Test');
                const retrieved = ProjectManager.getProject(created.id);

                expect(retrieved).toEqual(created);
            });

            test('returns undefined for non-existent id', () => {
                const project = ProjectManager.getProject('non-existent-id');
                expect(project).toBeUndefined();
            });
        });

        describe('updateProject', () => {
            test('updates project name', () => {
                const project = ProjectManager.createProject('Old Name');
                const updated = ProjectManager.updateProject(project.id, 'name', 'New Name');

                expect(updated.name).toBe('New Name');
                expect(updated.updatedAt).toBeDefined();
            });

            test('updates project section data', () => {
                const project = ProjectManager.createProject('Test');
                const simulationData = { credit: { amount: 200000 } };

                const updated = ProjectManager.updateProject(project.id, 'simulation', simulationData);
                expect(updated.simulation).toEqual(simulationData);
            });

            test('returns null for non-existent project', () => {
                const result = ProjectManager.updateProject('fake-id', 'name', 'New Name');
                expect(result).toBeNull();
            });
        });

        describe('deleteProject', () => {
            test('deletes project by id', () => {
                const project = ProjectManager.createProject('To Delete');
                ProjectManager.deleteProject(project.id);

                const projects = ProjectManager.getAllProjects();
                expect(projects).toHaveLength(0);
            });

            test('clears current project if deleted', () => {
                const project = ProjectManager.createProject('Test');
                ProjectManager.deleteProject(project.id);

                const currentId = ProjectManager.getCurrentProjectId();
                expect(currentId).toBeNull();
            });

            test('returns deleted project', () => {
                const project = ProjectManager.createProject('Test');
                const deleted = ProjectManager.deleteProject(project.id);

                expect(deleted).toEqual(project);
            });
        });
    });

    describe('Export/Import', () => {
        test('exportToJSON creates blob with project data', () => {
            ProjectManager.createProject('Project 1');
            ProjectManager.createProject('Project 2');

            // Mock URL.createObjectURL and URL.revokeObjectURL
            global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
            global.URL.revokeObjectURL = jest.fn();

            // Mock document.createElement
            const mockClick = jest.fn();
            const mockAnchor = { click: mockClick, href: '', download: '' };
            jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

            ProjectManager.exportToJSON();

            expect(mockClick).toHaveBeenCalled();
            expect(mockAnchor.download).toContain('mes-projets-immobiliers');
        });
    });

    describe('Trash Management', () => {
        test('moveToTrash moves project to trash', () => {
            const project = ProjectManager.createProject('To Trash');
            ProjectManager.moveToTrash(project.id);

            const projects = ProjectManager.getAllProjects();
            const trash = ProjectManager.getTrashedProjects();

            expect(projects).toHaveLength(0);
            expect(trash).toHaveLength(1);
            expect(trash[0].id).toBe(project.id);
        });

        test('restoreFromTrash restores project', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.moveToTrash(project.id);
            ProjectManager.restoreFromTrash(project.id);

            const projects = ProjectManager.getAllProjects();
            const trash = ProjectManager.getTrashedProjects();

            expect(projects).toHaveLength(1);
            expect(trash).toHaveLength(0);
        });

        test('emptyTrash clears all trashed projects', () => {
            const p1 = ProjectManager.createProject('P1');
            const p2 = ProjectManager.createProject('P2');

            ProjectManager.moveToTrash(p1.id);
            ProjectManager.moveToTrash(p2.id);
            ProjectManager.emptyTrash();

            const trash = ProjectManager.getTrashedProjects();
            expect(trash).toHaveLength(0);
        });
    });

    describe('Tags and Categories', () => {
        test('addTag adds tag to project', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.addTag(project.id, 'investissement');

            const updated = ProjectManager.getProject(project.id);
            expect(updated.tags).toContain('investissement');
        });

        test('addTag normalizes tag to lowercase', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.addTag(project.id, 'INVESTISSEMENT');

            const updated = ProjectManager.getProject(project.id);
            expect(updated.tags).toContain('investissement');
        });

        test('addTag prevents duplicates', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.addTag(project.id, 'test');
            ProjectManager.addTag(project.id, 'test');

            const updated = ProjectManager.getProject(project.id);
            expect(updated.tags).toHaveLength(1);
        });

        test('removeTag removes tag from project', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.addTag(project.id, 'test');
            ProjectManager.removeTag(project.id, 'test');

            const updated = ProjectManager.getProject(project.id);
            expect(updated.tags).toHaveLength(0);
        });

        test('setCategory updates project category', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.setCategory(project.id, 'appartement');

            const updated = ProjectManager.getProject(project.id);
            expect(updated.category).toBe('appartement');
        });

        test('filterByTag returns projects with tag', () => {
            const p1 = ProjectManager.createProject('P1');
            const p2 = ProjectManager.createProject('P2');

            ProjectManager.addTag(p1.id, 'paris');
            ProjectManager.addTag(p2.id, 'lyon');

            const filtered = ProjectManager.filterByTag('paris');
            expect(filtered).toHaveLength(1);
            expect(filtered[0].id).toBe(p1.id);
        });
    });

    describe('Search', () => {
        test('searchProjects finds by name', () => {
            ProjectManager.createProject('Appartement Paris');
            ProjectManager.createProject('Maison Lyon');

            const results = ProjectManager.searchProjects('Paris');
            expect(results).toHaveLength(1);
            expect(results[0].name).toContain('Paris');
        });

        test('searchProjects is case insensitive', () => {
            ProjectManager.createProject('Appartement Paris');

            const results = ProjectManager.searchProjects('paris');
            expect(results).toHaveLength(1);
        });

        test('searchProjects returns all for empty query', () => {
            ProjectManager.createProject('P1');
            ProjectManager.createProject('P2');

            const results = ProjectManager.searchProjects('');
            expect(results).toHaveLength(2);
        });

        test('searchProjects finds by tags', () => {
            const project = ProjectManager.createProject('Test');
            ProjectManager.addTag(project.id, 'investissement');

            const results = ProjectManager.searchProjects('investissement');
            expect(results).toHaveLength(1);
        });
    });

    describe('Utilities', () => {
        test('duplicateProject creates copy', () => {
            const original = ProjectManager.createProject('Original');
            const duplicate = ProjectManager.duplicateProject(original.id);

            expect(duplicate.name).toBe('Original (copie)');
            expect(duplicate.id).not.toBe(original.id);

            const projects = ProjectManager.getAllProjects();
            expect(projects).toHaveLength(2);
        });

        test('getProjectStats returns statistics', () => {
            ProjectManager.createProject('P1');
            ProjectManager.createProject('P2');

            const stats = ProjectManager.getProjectStats();
            expect(stats.total).toBe(2);
            expect(stats.byCategory).toBeDefined();
            expect(stats.byStatus).toBeDefined();
        });
    });
});
