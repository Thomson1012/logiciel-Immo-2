import { ThemeManager } from '../utils/themeManager.js';
import { KeyboardNavigation } from '../utils/keyboardNavigation.js';

document.addEventListener('DOMContentLoaded', () => {
    KeyboardNavigation.init();
    // Initialize Theme Manager
    ThemeManager.init();

    // Search functionality
    const searchInput = document.getElementById('glossary-search');
    const glossaryTerms = document.querySelectorAll('.glossary-term');
    const noResults = document.getElementById('no-results');
    const alphabetBtns = document.querySelectorAll('.alphabet-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            let hasResults = false;

            glossaryTerms.forEach(term => {
                const title = term.querySelector('h3').textContent.toLowerCase();
                const content = term.textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    term.style.display = 'block';
                    hasResults = true;
                } else {
                    term.style.display = 'none';
                }
            });

            if (noResults) {
                noResults.style.display = hasResults ? 'none' : 'block';
            }

            // Reset alphabet filter when searching
            if (searchTerm) {
                alphabetBtns.forEach(btn => btn.classList.remove('active'));
            }
        });
    }

    // Alphabet filter
    alphabetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const letter = btn.dataset.filter;

            // Update active state
            alphabetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Clear search
            if (searchInput) searchInput.value = '';

            // Filter terms
            let hasResults = false;
            glossaryTerms.forEach(term => {
                if (letter === 'all' || term.dataset.letter === letter) {
                    term.style.display = 'block';
                    hasResults = true;
                } else {
                    term.style.display = 'none';
                }
            });

            if (noResults) {
                noResults.style.display = hasResults ? 'none' : 'block';
            }
        });
    });

    // Smooth scroll to term from URL hash
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.style.animation = 'highlight 2s ease';
            }, 100);
        }
    }
});
