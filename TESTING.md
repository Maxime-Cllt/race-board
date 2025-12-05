# Guide de Tests - Race Board

Ce document explique comment exécuter et comprendre les tests du projet Race Board.

## Technologies Utilisées

- **Vitest** : Framework de test moderne et rapide pour JavaScript/TypeScript
- **React Testing Library** : Pour tester les composants React
- **happy-dom** : Environnement DOM léger pour les tests
- **@testing-library/user-event** : Pour simuler les interactions utilisateur

## Installation des Dépendances

Les dépendances de test sont déjà configurées dans `package.json`. Pour les installer :

```bash
pnpm install
```

## Scripts de Test Disponibles

### Exécuter tous les tests (une fois)

```bash
pnpm test
```

Cette commande exécute tous les tests une seule fois et affiche les résultats.

### Mode Watch (développement)

```bash
pnpm run test:watch
```

Exécute les tests en mode watch. Les tests se relancent automatiquement quand vous modifiez un fichier.

### Générer un rapport de couverture

```bash
pnpm run test:coverage
```

Génère un rapport de couverture de code et l'affiche dans le terminal. Un rapport HTML détaillé est également généré dans `coverage/`.

## Structure des Tests

```
src/
├── components/
│   └── dashboard/
│       ├── __tests__/
│       │   └── speed-records.test.tsx
│       └── speed-records.tsx
├── hooks/
│   └── __tests__/
│       └── use-realtime-speed-data.test.ts
└── contexts/
    └── __tests__/
        └── settings-context.test.tsx
```

## Tests Disponibles

### 1. `speed-records.test.tsx`

Tests complets du composant SpeedRecords :

- **Rendering** : Vérification de l'affichage du composant
- **Sorting** : Tests de tri par colonne (ASC/DESC)
- **Filtering** : Tests de filtrage par ID, capteur, vitesse, voie, date
- **Pagination** : Tests de navigation entre pages
- **Column Resizing** : Vérification des poignées de redimensionnement
- **Combined Operations** : Tests combinant filtres et tri
- **Data Display** : Vérification du formatage des données

**Commandes :**
```bash
# Exécuter uniquement ces tests
pnpm test -- speed-records

# En mode watch
pnpm run test:watch -- speed-records
```

### 2. `use-realtime-speed-data.test.ts`

Tests du hook personnalisé `useRealtimeSpeedData` :

- **Simulation Mode** : Tests en mode simulation
- **API Mode** : Tests en mode DEV/PROD avec SSE
- **Hook Parameters** : Tests des paramètres personnalisés
- **Data Updates** : Tests des mises à jour de données
- **Cleanup** : Tests du nettoyage des ressources

**Commandes :**
```bash
# Exécuter uniquement ces tests
pnpm test -- use-realtime-speed-data

# En mode watch
pnpm run test:watch -- use-realtime-speed-data
```

### 3. `settings-context.test.tsx`

Tests du contexte de paramètres :

- **Provider** : Tests du fournisseur de contexte
- **useSettings Hook** : Tests du hook
- **updateSettings** : Tests de mise à jour des paramètres
- **resetSettings** : Tests de réinitialisation
- **LocalStorage** : Tests de persistance
- **Default Settings** : Vérification des valeurs par défaut

**Commandes :**
```bash
# Exécuter uniquement ces tests
pnpm test -- settings-context

# En mode watch
pnpm run test:watch -- settings-context
```

## Écrire de Nouveaux Tests

### Exemple de Test de Composant

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonComposant } from '../mon-composant';

describe('MonComposant', () => {
  it('affiche le titre correctement', () => {
    render(<MonComposant titre="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Exemple de Test de Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMonHook } from '../use-mon-hook';

describe('useMonHook', () => {
  it('retourne la valeur initiale', () => {
    const { result } = renderHook(() => useMonHook());
    expect(result.current.value).toBe(0);
  });
});
```

## Configuration

### `vitest.config.ts`

Configuration principale de Vitest :
- Environnement : `happy-dom`
- Globals : activés pour utiliser `describe`, `it`, `expect` sans imports
- Coverage : configuré avec v8
- Alias : `@/` pointe vers `./src`

### `vitest.setup.ts`

Fichier de configuration exécuté avant chaque test :
- Import de `@testing-library/jest-dom` pour les matchers personnalisés
- Nettoyage automatique après chaque test

## Intégration Continue (CI)

Les tests s'exécutent automatiquement via GitHub Actions :

### Déclencheurs

- **Push** sur les branches `main` et `develop`
- **Pull Request** vers `main` et `develop`

### Jobs

1. **test** : Exécute les tests et génère un rapport de couverture
2. **lint** : Vérifie le code avec ESLint
3. **build** : Compile l'application

### Workflow

Le fichier de configuration se trouve dans `.github/workflows/ci.yml`.

## Bonnes Pratiques

### 1. Nommage des Tests

- Utilisez des descriptions claires et en français
- Format : `it('fait quelque chose', () => { ... })`

### 2. Organisation

- Un fichier de test par composant/hook/fonction
- Groupez les tests par fonctionnalité avec `describe()`

### 3. Assertions

- Une assertion principale par test
- Utilisez des matchers expressifs de `@testing-library/jest-dom`

### 4. Mocking

- Mockez les dépendances externes (API, localStorage, etc.)
- Utilisez `vi.mock()` pour les modules
- Nettoyez les mocks avec `vi.clearAllMocks()` dans `beforeEach()`

### 5. Tests d'Interaction

- Utilisez `userEvent` pour simuler les interactions réelles
- Préférez `screen.getByRole()` pour sélectionner les éléments

## Dépannage

### Les tests ne se lancent pas

```bash
# Nettoyer le cache
rm -rf node_modules
pnpm install
```

### Erreur de timeout

Augmentez le timeout dans le test :
```typescript
it('test long', async () => {
  // ...
}, 10000); // 10 secondes
```

### Problèmes de modules

Vérifiez que tous les alias sont correctement configurés dans `vitest.config.ts`.

## Ressources

- [Documentation Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [User Event](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
