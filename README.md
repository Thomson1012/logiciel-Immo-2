# 🏠 Calculateur Immobilier Premium

Application web complète pour simuler et gérer vos projets immobiliers. Calculez vos crédits, rentabilité locative, capacité d'emprunt, impôts et estimez vos travaux en quelques clics.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fonctionnalités Principales

### 📊 Calculateurs Financiers
- **Simulateur de Crédit** : Calculez vos mensualités, coût total et intérêts
- **Rentabilité Locative** : Rentabilité brute, nette et TRI (Taux de Rentabilité Interne)
- **Prix Cible** : Calculateur inversé pour déterminer le prix d'achat maximum
- **Capacité d'Emprunt** : Estimez votre capacité d'emprunt selon vos revenus

### 💰 Outils Fiscaux et Aides
- **Estimateur d'Impôts** : LMNP, SCI (IR/IS), régimes fiscaux comparés
- **Aides de l'État** : Recherche des aides disponibles pour votre projet
- **Estimateur de Travaux** : Estimation détaillée des coûts de rénovation

### 📁 Gestion de Projets
- Sauvegarde illimitée de simulations
- Organisation par dossiers
- Comparateur de projets
- Export PDF des simulations
- Export des graphiques

### 📚 Ressources
- **Guide Débutant** : Comprendre l'investissement immobilier
- **Glossaire** : Tous les termes financiers expliqués

## 🚀 Installation

### Prérequis
- [Node.js](https://nodejs.org/) version 16 ou supérieure
- npm (inclus avec Node.js)

### Installation des dépendances

```bash
# Cloner ou télécharger le projet
cd "Logiciel Immo  en ligne copie"

# Installer les dépendances
npm install
```

## 💻 Utilisation

### Mode Développement

Lancez le serveur de développement avec hot-reload :

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

Le serveur se rechargera automatiquement à chaque modification du code.

### Build Production

Créez une version optimisée pour la production :

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `/dist`.

### Prévisualiser le Build

Testez la version de production localement :

```bash
npm run preview
```

## 📂 Structure du Projet

```
Logiciel Immo/
├── src/
│   ├── css/
│   │   └── style.css           # Styles principaux
│   └── js/
│       ├── core/               # Logique métier
│       │   ├── calculator.js   # Calculateurs financiers
│       │   └── constants.js    # Constantes de l'application
│       ├── managers/           # Gestionnaires
│       │   ├── chartManager.js # Gestion des graphiques
│       │   ├── projectManager.js # Gestion des projets
│       │   └── uiManager.js    # Gestion de l'interface
│       ├── pages/              # Scripts par page
│       │   ├── main.js         # Page principale
│       │   ├── impots.js       # Page impôts
│       │   ├── aides.js        # Page aides
│       │   ├── travaux.js      # Page travaux
│       │   ├── comparateur.js  # Comparateur
│       │   └── glossaire.js    # Glossaire
│       └── utils/              # Utilitaires
│           ├── errorHandler.js # Gestion des erreurs
│           ├── inputValidator.js # Validation des entrées
│           ├── pdfExport.js    # Export PDF
│           ├── projectComparator.js # Comparaison de projets
│           ├── security.js     # Sécurité
│           ├── templates.js    # Templates HTML
│           └── ui.js           # Notifications UI
├── index.html                  # Page principale
├── impots.html                 # Estimateur d'impôts
├── aides.html                  # Aides de l'État
├── travaux.html                # Estimateur de travaux
├── comparateur.html            # Comparateur de projets
├── glossaire.html              # Glossaire
├── guide.html                  # Guide débutant
├── package.json                # Dépendances npm
├── vite.config.js              # Configuration Vite
└── README.md                   # Ce fichier
```

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Build Tool** : [Vite](https://vitejs.dev/) - Bundler ultra-rapide
- **Graphiques** : [Chart.js](https://www.chartjs.org/) - Visualisations interactives
- **Export PDF** : [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/)
- **Tests** : [Jest](https://jestjs.io/)
- **CSS** : Variables CSS, Flexbox, Grid, Animations

## 🎨 Fonctionnalités Techniques

### Performance
- ✅ Code splitting automatique
- ✅ Lazy loading des modules
- ✅ Minification JS/CSS
- ✅ Tree shaking (suppression du code mort)
- ✅ Bundle optimisé (~200KB gzipped)

### Développement
- ✅ Hot Module Replacement (HMR)
- ✅ Architecture modulaire ES6
- ✅ Gestion d'erreurs centralisée
- ✅ Validation des entrées utilisateur

### Stockage
- ✅ LocalStorage pour la persistance des données
- ✅ Export/Import de projets
- ✅ Sauvegarde automatique

## 📖 Guide d'Utilisation

### Créer une Simulation de Crédit

1. Ouvrez l'application (http://localhost:3000)
2. Restez sur l'onglet "Simulateur Crédit"
3. Remplissez les champs :
   - Montant du prêt (ex: 200000)
   - Taux d'intérêt annuel (ex: 3.5)
   - Durée en années (ex: 20)
4. Cliquez sur "Calculer mes mensualités"
5. Consultez les résultats et le graphique d'amortissement
6. Sauvegardez votre simulation dans un dossier

### Calculer la Rentabilité

1. Cliquez sur l'onglet "Rentabilité"
2. Remplissez les informations :
   - Prix d'achat
   - Type de bien (ancien/neuf)
   - Classe DPE
   - Loyer mensuel
   - Frais (notaire, travaux, charges, taxe foncière)
3. Cliquez sur "Calculer la rentabilité"
4. Analysez la rentabilité brute, nette et le TRI
5. Sauvegardez dans votre dossier

### Gérer vos Projets

1. Cliquez sur "+ Nouveau Dossier" dans la barre latérale
2. Donnez un nom à votre projet (ex: "Appartement Lyon")
3. Effectuez vos simulations (crédit, rentabilité, capacité)
4. Chaque simulation sera automatiquement sauvegardée dans le dossier actif
5. Cliquez sur un dossier pour voir toutes les simulations associées
6. Utilisez le comparateur pour comparer plusieurs projets

## 🔧 Scripts Disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Créer le build de production
npm run build

# Prévisualiser le build de production
npm run preview

# Lancer les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Linter le code
npm run lint

# Formater le code
npm run format
```

## 🌐 Déploiement

### Hébergement Statique

Le projet peut être déployé sur n'importe quelle plateforme d'hébergement statique :

- **Netlify** : Glissez-déposez le dossier `/dist`
- **Vercel** : Connectez votre repository Git
- **GitHub Pages** : Déployez le contenu de `/dist`
- **Firebase Hosting** : `firebase deploy`

### Serveur Traditionnel

1. Exécutez `npm run build`
2. Copiez le contenu du dossier `/dist` sur votre serveur web
3. Configurez votre serveur pour servir `index.html` comme page par défaut

## 🐛 Dépannage

### Les dépendances ne s'installent pas

```bash
rm -rf node_modules package-lock.json
npm install
```

### Le serveur ne démarre pas

Vérifiez que le port 3000 n'est pas déjà utilisé :
```bash
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

### Erreurs dans la console du navigateur

1. Ouvrez les DevTools (F12)
2. Vérifiez l'onglet Console pour les erreurs
3. Vérifiez l'onglet Network pour les ressources manquantes

## 📝 Licence

MIT License - Vous êtes libre d'utiliser, modifier et distribuer ce projet.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Soumettre des pull requests

## 📧 Support

Pour toute question ou problème, consultez :
- La documentation dans `/SETUP.md`
- Le guide débutant dans l'application
- Le glossaire pour les termes techniques

## 🎯 Roadmap

- [ ] Mode sombre/clair
- [ ] Export Excel des simulations
- [ ] Comparaison multi-critères avancée
- [ ] Intégration API taux bancaires en temps réel
- [ ] Application mobile (PWA)
- [ ] Partage de projets par lien

---

**Développé avec ❤️ pour simplifier vos investissements immobiliers**
