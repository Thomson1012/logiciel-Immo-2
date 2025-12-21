/**
 * Post-build script to create standalone HTML files
 * This script reads the dist HTML files and inlines all JavaScript and CSS
 * so they work directly from the file system (file:// protocol)
 */

const fs = require('fs');
const path = require('path');

// Go up one level from scripts folder to get to project root
const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');
const jsDir = path.join(assetsDir, 'js');
const htmlFiles = ['index.html', 'aides.html', 'comparateur.html', 'glossaire.html', 'guide.html', 'impots.html', 'travaux.html'];

// Cache for loaded JS modules
const moduleCache = new Map();

// Load all JS modules from assets/js into cache
function loadAllModules() {
    if (!fs.existsSync(jsDir)) {
        console.log('No JS directory found');
        return;
    }

    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    jsFiles.forEach(file => {
        const filePath = path.join(jsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        moduleCache.set(file, content);
        console.log(`  Loaded module: ${file}`);
    });
}

// Remove all import statements from bundled code
function cleanImports(jsContent) {
    // Remove various import patterns:
    // import"./module.js"
    // import "./module.js"
    // import { x } from "./module.js"
    // import * as x from "./module.js"
    // import x from "./module.js"
    let cleaned = jsContent
        // Simple imports: import"./file.js"
        .replace(/import\s*["'][^"']+["']\s*;?/g, '')
        // Named imports: import { a, b } from "./file.js"
        .replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["']\s*;?/g, '')
        // Default imports: import x from "./file.js"
        .replace(/import\s+[\w$]+\s+from\s*["'][^"']+["']\s*;?/g, '')
        // Star imports: import * as x from "./file.js"
        .replace(/import\s*\*\s*as\s+[\w$]+\s+from\s*["'][^"']+["']\s*;?/g, '')
        // Combined: import x, { y } from "./file.js"
        .replace(/import\s+[\w$]+\s*,\s*\{[^}]*\}\s*from\s*["'][^"']+["']\s*;?/g, '')
        // Remove empty CSS import comments: /* empty css */
        .replace(/\/\*\s*empty\s+css\s*\*\//gi, '')
        // Remove export statements
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+/g, '')
        .replace(/export\s*\{[^}]*\}\s*;?/g, '');

    return cleaned;
}

// Get all dependencies for a module and concatenate them
function getModuleDependencies(fileName) {
    const content = moduleCache.get(fileName);
    if (!content) return '';

    const dependencies = [];
    const importRegex = /import\s*["']\.\/([^"']+)["']/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        dependencies.push(match[1]);
    }

    // Recursively get dependencies (avoiding cycles)
    const visited = new Set();
    function collectDeps(deps) {
        let result = '';
        for (const dep of deps) {
            if (!visited.has(dep) && moduleCache.has(dep)) {
                visited.add(dep);
                const depContent = moduleCache.get(dep);
                // First get this module's dependencies
                const subDeps = [];
                const subImportRegex = /import\s*["']\.\/([^"']+)["']/g;
                let subMatch;
                while ((subMatch = subImportRegex.exec(depContent)) !== null) {
                    subDeps.push(subMatch[1]);
                }
                result += collectDeps(subDeps);
                result += cleanImports(depContent) + '\n';
            }
        }
        return result;
    }

    return collectDeps(dependencies);
}

function inlineAssets(htmlPath) {
    console.log(`Processing: ${htmlPath}`);
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Inline CSS files
    const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
    let match;
    const cssMatches = [];
    while ((match = cssLinkRegex.exec(html)) !== null) {
        cssMatches.push({ full: match[0], path: match[1] });
    }

    for (const cssMatch of cssMatches) {
        const cssPath = path.join(path.dirname(htmlPath), cssMatch.path.replace('./', ''));
        if (fs.existsSync(cssPath)) {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            const styleTag = `<style>${cssContent}</style>`;
            html = html.replace(cssMatch.full, styleTag);
            console.log(`  Inlined CSS: ${cssMatch.path}`);
        }
    }

    // Remove modulepreload links (not needed for inline scripts)
    html = html.replace(/<link[^>]+rel=["']modulepreload["'][^>]*>/gi, '');

    // Find and inline module scripts
    const moduleScriptRegex = /<script[^>]+type=["']module["'][^>]+src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi;
    const jsMatches = [];
    while ((match = moduleScriptRegex.exec(html)) !== null) {
        jsMatches.push({ full: match[0], path: match[1] });
    }

    for (const jsMatch of jsMatches) {
        const jsFileName = path.basename(jsMatch.path);

        // Get all dependencies first
        let allCode = getModuleDependencies(jsFileName);

        // Then add the main module
        if (moduleCache.has(jsFileName)) {
            allCode += cleanImports(moduleCache.get(jsFileName));
        }

        // Wrap in IIFE to avoid global scope pollution
        const scriptTag = `<script>(function(){\n${allCode}\n})()</script>`;
        html = html.replace(jsMatch.full, scriptTag);
        console.log(`  Inlined JS: ${jsMatch.path} (with dependencies)`);
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`  ✓ Saved: ${htmlPath}`);
}

// Main execution
console.log('=== Making dist files standalone ===\n');
console.log('Loading JS modules...');
loadAllModules();
console.log('');

for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(distDir, htmlFile);
    if (fs.existsSync(htmlPath)) {
        inlineAssets(htmlPath);
    } else {
        console.log(`File not found: ${htmlPath}`);
    }
}

console.log('\n=== Done! ===');
console.log('The HTML files in dist/ are now standalone and can be opened directly with file://');
