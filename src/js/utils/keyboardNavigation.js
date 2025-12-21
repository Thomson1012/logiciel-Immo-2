/**
 * Keyboard Navigation Module
 * Implements comprehensive keyboard navigation for WCAG AA compliance
 */

export const KeyboardNavigation = {
    /**
     * Initialize all keyboard navigation features
     */
    init() {
        this.setupTabTrapping();
        this.setupEscapeHandlers();
        this.setupArrowNavigation();
        this.setupSkipLinks();
        this.setupFocusManagement();
        console.log('✅ Keyboard navigation initialized');
    },

    /**
     * Trap focus within modals (WCAG 2.1.2 - No Keyboard Trap)
     */
    setupTabTrapping() {
        document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
            const focusableSelector =
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

            modal.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;

                const focusableElements = Array.from(modal.querySelectorAll(focusableSelector));
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                // Shift + Tab on first element → focus last
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
                // Tab on last element → focus first
                else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            });
        });
    },

    /**
     * Handle Escape key to close modals and dropdowns (WCAG 2.1.1 - Keyboard)
     */
    setupEscapeHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                // Close modals
                const openModal = document.querySelector('.modal:not(.hidden), [role="dialog"]:not(.hidden)');
                if (openModal) {
                    e.preventDefault();
                    this.closeModal(openModal);
                    return;
                }

                // Close dropdowns
                const openDropdown = document.querySelector('.dropdown.open, [aria-expanded="true"]');
                if (openDropdown) {
                    e.preventDefault();
                    this.closeDropdown(openDropdown);
                }
            }
        });
    },

    /**
     * Arrow key navigation for tabs and radio groups (WCAG 2.1.1 - Keyboard)
     */
    setupArrowNavigation() {
        // Tab navigation
        document.querySelectorAll('[role="tablist"]').forEach(tablist => {
            const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

            tablist.addEventListener('keydown', (e) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;

                e.preventDefault();
                const currentIndex = tabs.indexOf(document.activeElement);
                let nextIndex;

                switch (e.key) {
                    case 'ArrowRight':
                        nextIndex = (currentIndex + 1) % tabs.length;
                        break;
                    case 'ArrowLeft':
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = tabs.length - 1;
                        break;
                }

                tabs[nextIndex].focus();
                tabs[nextIndex].click(); // Activate the tab
            });
        });

        // Radio group navigation
        document.querySelectorAll('[role="radiogroup"]').forEach(group => {
            const radios = Array.from(group.querySelectorAll('[role="radio"]'));

            group.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

                e.preventDefault();
                const currentIndex = radios.indexOf(document.activeElement);
                let nextIndex;

                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % radios.length;
                } else {
                    nextIndex = (currentIndex - 1 + radios.length) % radios.length;
                }

                radios[nextIndex].focus();
                radios[nextIndex].click();
            });
        });
    },

    /**
     * Setup skip links for keyboard users (WCAG 2.4.1 - Bypass Blocks)
     */
    setupSkipLinks() {
        // Create skip link if it doesn't exist
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Aller au contenu principal';
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content') ||
                    document.querySelector('main') ||
                    document.querySelector('[role="main"]');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                    mainContent.removeAttribute('tabindex');
                }
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    },

    /**
     * Manage focus for dynamic content (WCAG 2.4.3 - Focus Order)
     */
    setupFocusManagement() {
        // Store last focused element before opening modal
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                trigger.dataset.returnFocus = 'true';
            }
        });

        // Restore focus when modal closes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('modal') && target.classList.contains('hidden')) {
                        const trigger = document.querySelector('[data-return-focus="true"]');
                        if (trigger) {
                            trigger.focus();
                            trigger.removeAttribute('data-return-focus');
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.modal, [role="dialog"]').forEach(modal => {
            observer.observe(modal, { attributes: true });
        });
    },

    /**
     * Close modal and restore focus
     */
    closeModal(modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');

        // Restore focus to trigger
        const triggerId = modal.dataset.trigger;
        if (triggerId) {
            const trigger = document.getElementById(triggerId);
            if (trigger) trigger.focus();
        }
    },

    /**
     * Close dropdown
     */
    closeDropdown(dropdown) {
        dropdown.classList.remove('open');
        dropdown.setAttribute('aria-expanded', 'false');
    },

    /**
     * Make an element keyboard accessible
     * @param {HTMLElement} element - Element to make accessible
     * @param {Function} callback - Click handler
     */
    makeAccessible(element, callback) {
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback(e);
            }
        });
    },

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        let announcer = document.getElementById('aria-live-announcer');

        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'aria-live-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        // Clear and set new message
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KeyboardNavigation.init());
} else {
    // DOM already loaded
    if (typeof window !== 'undefined') {
        window.KeyboardNavigation = KeyboardNavigation;
    }
}
