#!/bin/bash
# Script to add theme toggle button to all HTML pages

# Theme toggle HTML snippet
THEME_TOGGLE='    <!-- Theme Toggle Button -->
    <div class="theme-toggle">
        <button id="theme-toggle-btn" aria-label="Changer le thème (clair/sombre)" title="Changer le thème">
            <svg class="sun-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="4" fill="currentColor"/>
                <path d="M10 0v3M10 17v3M20 10h-3M3 10H0M16.36 16.36l-2.12-2.12M5.76 5.76L3.64 3.64M16.36 3.64l-2.12 2.12M5.76 14.24l-2.12 2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg class="moon-icon hidden" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" fill="currentColor"/>
            </svg>
        </button>
    </div>
    '

# Pages to update
PAGES=("impots.html" "aides.html" "travaux.html" "comparateur.html" "glossaire.html" "guide.html")

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        # Check if theme toggle already exists
        if ! grep -q "theme-toggle" "$page"; then
            # Add after <body> tag
            sed -i '' "/<body>/a\\
$THEME_TOGGLE
" "$page"
            echo "✅ Added theme toggle to $page"
        else
            echo "⏭️  Theme toggle already exists in $page"
        fi
    else
        echo "❌ File not found: $page"
    fi
done

echo ""
echo "🎉 Theme toggle deployment complete!"
