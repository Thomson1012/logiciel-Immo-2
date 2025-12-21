# Guide d'Installation - chartjs-plugin-zoom

## Installation

Pour activer le zoom et le pan sur les graphiques, suivez ces étapes :

### 1. Installer le plugin

```bash
cd "/Users/macbookairdetom/Desktop/IA/Logiciel Immo  copie"
npm install chartjs-plugin-zoom
```

### 2. Importer et enregistrer le plugin

Dans `chartManager.js`, ajouter en haut du fichier :

```javascript
// Si utilisation avec bundler (Vite)
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);
```

OU via CDN dans `index.html` :

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js"></script>
```

### 3. Configurer le zoom

Dans les options des graphiques, ajouter :

```javascript
plugins: {
    zoom: {
        zoom: {
            wheel: {
                enabled: true,
                speed: 0.1
            },
            pinch: {
                enabled: true
            },
            mode: 'x'
        },
        pan: {
            enabled: true,
            mode: 'x'
        },
        limits: {
            x: { min: 'original', max: 'original' }
        }
    }
}
```

### 4. Ajouter boutons de contrôle

```html
<div class="chart-controls">
    <button onclick="ChartManager.resetZoom('credit-chart')">
        🔄 Réinitialiser zoom
    </button>
</div>
```

```javascript
// Dans ChartManager
resetZoom(chartId) {
    if (this.charts[chartId]) {
        this.charts[chartId].resetZoom();
    }
}
```

## Utilisation

- **Zoom** : Molette de souris ou pinch sur mobile
- **Pan** : Cliquer-glisser
- **Reset** : Bouton ou double-clic

## Documentation

https://www.chartjs.org/chartjs-plugin-zoom/latest/
