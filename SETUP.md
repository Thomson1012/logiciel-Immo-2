# Calculateur Immobilier - Guide de Setup

## Installation des Dépendances

### 1. Installer Node.js
Si ce n'est pas déjà fait, téléchargez Node.js depuis [nodejs.org](https://nodejs.org/)

### 2. Installer les dépendances
```bash
cd "chemin/vers/Logiciel Immo  en ligne copie"
npm install
```

Cela installera :
- **chart.js** : Graphiques
- **jspdf** : Export PDF
- **html2canvas** : Capture graphiques
- **vite** : Bundler
- **jest** : Tests
- **postcss, cssnano** : Optimisation CSS

## Développement

### Lancer le serveur de développement
```bash
npm run dev
```
Ouvre automatiquement http://localhost:3000

### Lancer les tests
```bash
npm test
```

### Lancer les tests en mode watch
```bash
npm run test:watch
```

## Production

### Build pour production
```bash
npm run build
```

Génère les fichiers optimisés dans `/dist` :
- JS minifié et code-splitted
- CSS minifié et autoprefixé
- Assets optimisés

### Prévisualiser le build
```bash
npm run preview
```

## Structure après Build

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js (main bundle)
│   ├── vendor-charts-[hash].js (Chart.js)
│   ├── vendor-pdf-[hash].js (jsPDF)
│   └── index-[hash].css (minified)
└── ...
```

## Avantages du Setup

### Performance
- ✅ Code splitting automatique
- ✅ Lazy loading des modules lourds
- ✅ Minification JS/CSS
- ✅ Tree shaking (code mort supprimé)

### Développement
- ✅ Hot Module Replacement (HMR)
- ✅ Tests automatisés
- ✅ Linting et formatting

### Production
- ✅ Dépendances hébergées localement
- ✅ Pas de dépendance aux CDN
- ✅ Bundle optimisé (~200KB gzipped)

## Migration depuis CDN

### Avant (CDN)
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

### Après (Local)
```javascript
import Chart from 'chart.js/auto';
```

Les imports sont gérés automatiquement par Vite.

## Tests

### Couverture actuelle
- CreditCalculator: 100%
- ProfitabilityCalculator: 100%
- TaxCalculator: 100%
- CapacityCalculator: 100%

### Ajouter des tests
Créer un fichier `*.test.js` :
```javascript
describe('MonModule', () => {
  test('fait quelque chose', () => {
    expect(MonModule.maFonction()).toBe(resultatAttendu);
  });
});
```

## Déploiement

### Option 1: Hébergement statique
Déployer le contenu de `/dist` sur :
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### Option 2: Serveur traditionnel
Copier `/dist` dans le dossier public du serveur web.

## Troubleshooting

### Les dépendances ne s'installent pas
```bash
rm -rf node_modules package-lock.json
npm install
```

### Les tests échouent
Vérifier que les modules sont bien importés dans les tests.

### Le build est trop gros
Vérifier avec :
```bash
npm run build -- --report
```

## Prochaines Étapes

1. ✅ Setup complet
2. [ ] Lancer `npm install`
3. [ ] Tester avec `npm run dev`
4. [ ] Lancer les tests `npm test`
5. [ ] Build production `npm run build`
6. [ ] Déployer `/dist`
