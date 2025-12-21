#!/usr/bin/env python3
"""
Script to add theme toggle button to all HTML pages
"""

import re
from pathlib import Path

THEME_TOGGLE_HTML = '''    <!-- Theme Toggle Button -->
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
    
'''

def add_toggle_to_html(filepath):
    """Add theme toggle to HTML file if not already present"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if toggle already exists
    if 'theme-toggle' in content:
        print(f"⏭️  {filepath.name} - Toggle already exists")
        return False
    
    # Add toggle after <body> tag
    pattern = r'(<body>)\s*\n'
    replacement = r'\1\n' + THEME_TOGGLE_HTML
    new_content = re.sub(pattern, replacement, content, count=1)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ {filepath.name} - Toggle added")
        return True
    else:
        print(f"❌ {filepath.name} - Could not find <body> tag")
        return False

def main():
    # List of HTML files to update
    html_files = [
        'aides.html',
        'travaux.html',
        'comparateur.html',
        'glossaire.html',
        'guide.html'
    ]
    
    base_dir = Path('.')
    updated = 0
    
    for filename in html_files:
        filepath = base_dir / filename
        if filepath.exists():
            if add_toggle_to_html(filepath):
                updated += 1
        else:
            print(f"❌ {filename} - File not found")
    
    print(f"\n🎉 Complete! {updated} files updated")

if __name__ == '__main__':
    main()
