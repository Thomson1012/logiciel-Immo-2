# Contributing to Logiciel Immo

Merci de votre intérêt pour contribuer au projet **Logiciel Immo** ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Setup Environnement de Développement](#setup-environnement-de-développement)
- [Standards de Code](#standards-de-code)
- [Process de Contribution](#process-de-contribution)
- [Tests](#tests)
- [Documentation](#documentation)

## Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :
- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté

## Comment Contribuer

Il existe plusieurs façons de contribuer :

### 🐛 Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs. actuel
   - Screenshots si applicable
   - Environnement (navigateur, OS)

### ✨ Proposer une Fonctionnalité

1. Créez une issue avec le template "Feature Request"
2. Décrivez la fonctionnalité et son utilité
3. Proposez une implémentation si possible
4. Attendez les retours avant de commencer le développement

### 🔧 Soumettre un Pull Request

1. Fork le repository
2. Créez une branche depuis `develop` : `git checkout -b feature/ma-fonctionnalite`
3. Faites vos modifications
4. Committez avec des messages clairs
5. Poussez vers votre fork
6. Ouvrez un Pull Request vers `develop`

## Setup Environnement de Développement

### Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** 9+ (inclus avec Node.js)
- **Git** ([télécharger](https://git-scm.com/))

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/logiciel-immo.git
cd logiciel-immo

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev        # Serveur de développement (port 3000)
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm test           # Lancer les tests
npm run test:watch # Tests en mode watch
npm run lint       # Linter le code
npm run format     # Formater le code
```

## Standards de Code

### Style JavaScript

Nous utilisons **ES6+ moderne** avec les conventions suivantes :

#### Modules

```javascript
// ✅ Bon - Export nommé
export const MyModule = {
    method() { ... }
};

// ❌ Mauvais - Export default
export default MyModule;
```

#### Naming Conventions

```javascript
// Variables et fonctions : camelCase
const myVariable = 42;
function calculateTotal() { ... }

// Constantes : UPPER_SNAKE_CASE
const MAX_AMOUNT = 1000000;

// Classes et objets modules : PascalCase
const ProjectManager = { ... };
```

#### Fonctions Pures

Privilégiez les fonctions pures dans `core/` :

```javascript
// ✅ Bon - Fonction pure
export function calculateMonthly(amount, rate, years) {
    return (amount * rate) / years;
}

// ❌ Mauvais - Effets de bord
let total = 0;
export function addToTotal(value) {
    total += value; // Modifie l'état global
}
```

#### Validation

Toujours valider les entrées utilisateur :

```javascript
const validation = Security.validateNumber(value, {
    required: true,
    min: 0,
    max: 1000000
});

if (!validation.valid) {
    UI.showToast(validation.error, "error");
    return;
}
```

### Style CSS

- Utilisez les **variables CSS** définies dans `:root`
- Préfixez les classes personnalisées
- Mobile-first (media queries min-width)

```css
/* ✅ Bon - Utilise les variables */
.my-component {
    color: var(--text-main);
    padding: var(--space-4);
}

/* ❌ Mauvais - Valeurs en dur */
.my-component {
    color: #1e293b;
    padding: 16px;
}
```

### Documentation

#### JSDoc

Documentez toutes les fonctions publiques :

```javascript
/**
 * Calculate monthly payment for a loan
 * @param {number} amount - Loan amount in euros
 * @param {number} rate - Annual interest rate (percentage)
 * @param {number} years - Loan duration in years
 * @returns {number} Monthly payment amount
 * @throws {Error} If parameters are out of valid range
 * @example
 * calculateMonthlyPayment(200000, 3.5, 20)
 * // Returns: 1160.41
 */
export function calculateMonthlyPayment(amount, rate, years) {
    // ...
}
```

## Process de Contribution

### 1. Choisir une Issue

- Consultez les [Issues ouvertes](../../issues)
- Cherchez le label `good first issue` pour débuter
- Commentez l'issue pour indiquer que vous travaillez dessus

### 2. Créer une Branche

```bash
# Feature
git checkout -b feature/nom-fonctionnalite

# Bug fix
git checkout -b fix/nom-bug

# Documentation
git checkout -b docs/nom-doc
```

### 3. Développer

- Suivez les [standards de code](#standards-de-code)
- Écrivez des tests pour votre code
- Mettez à jour la documentation si nécessaire

### 4. Tester

```bash
# Lancer tous les tests
npm test

# Vérifier le build
npm run build

# Tester manuellement
npm run dev
```

### 5. Committer

Utilisez des messages de commit clairs et descriptifs :

```bash
# Format : type(scope): description

# Exemples
git commit -m "feat(calculator): add TRI calculation"
git commit -m "fix(projectManager): resolve duplicate save bug"
git commit -m "docs(readme): update installation steps"
git commit -m "test(calculator): add edge case tests"
```

**Types de commit** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance

### 6. Pull Request

1. Poussez votre branche : `git push origin feature/ma-fonctionnalite`
2. Ouvrez une PR sur GitHub vers `develop`
3. Remplissez le template de PR :
   - Description des changements
   - Issue(s) liée(s)
   - Screenshots si UI
   - Checklist complétée

#### Checklist PR

- [ ] Le code suit les standards du projet
- [ ] Les tests passent (`npm test`)
- [ ] Le build fonctionne (`npm run build`)
- [ ] La documentation est à jour
- [ ] Les commits sont clairs et atomiques
- [ ] Pas de conflits avec `develop`

## Tests

### Écrire des Tests

Créez des tests dans `__tests__/` à côté du fichier source :

```
src/js/
├── core/
│   ├── calculator.js
│   └── __tests__/
│       └── calculator.test.js
```

### Structure d'un Test

```javascript
import { MyModule } from '../myModule.js';

describe('MyModule', () => {
    describe('myFunction', () => {
        test('should return correct value for valid input', () => {
            const result = MyModule.myFunction(10);
            expect(result).toBe(20);
        });

        test('should throw error for invalid input', () => {
            expect(() => {
                MyModule.myFunction(-1);
            }).toThrow('Invalid input');
        });
    });
});
```

### Coverage

Visez au minimum **50% de coverage** :

```bash
npm test -- --coverage
```

## Documentation

### README.md

Mettez à jour si vous ajoutez :
- Une nouvelle fonctionnalité majeure
- Une nouvelle dépendance
- Un nouveau script npm

### ARCHITECTURE.md

Documentez les changements architecturaux :
- Nouveaux modules
- Nouveaux patterns
- Décisions techniques importantes

### Code Comments

```javascript
// ✅ Bon - Explique le "pourquoi"
// Use binary search for better performance on large datasets
const index = binarySearch(array, target);

// ❌ Mauvais - Répète le "quoi"
// Loop through array
for (let i = 0; i < array.length; i++) { ... }
```

## Questions ?

- 📧 Email : [votre-email]
- 💬 Discussions : [GitHub Discussions](../../discussions)
- 🐛 Issues : [GitHub Issues](../../issues)

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

**Merci de contribuer à Logiciel Immo ! 🏠**
