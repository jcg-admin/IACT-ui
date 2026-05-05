# Theme System

## Overview
Sistema global de tema oscuro/claro con persistencia en localStorage.

## ThemeContext

Ubicación: `src/context/ThemeContext.jsx`

### API

```typescript
interface ThemeContextValue {
  theme: 'dark' | 'light' | 'auto'
  toggleTheme: () => void
  setThemeMode: (mode: 'dark' | 'light' | 'auto') => void
}

function useTheme(): ThemeContextValue
```

## Usage

```jsx
import { useTheme } from '@/context/ThemeContext'

function SettingsPage() {
  const { theme, toggleTheme, setThemeMode } = useTheme()

  return (
    <button onClick={() => setThemeMode('light')}>
      Light Mode
    </button>
  )
}
```

## Implementation Details

### Storage
- Tema se guarda en `localStorage['theme']`
- Se recupera automáticamente en siguiente sesión

### System Preference Detection
- Si no hay tema guardado, detecta preferencia del sistema
- Usa `window.matchMedia('(prefers-color-scheme: dark)')`

### CSS Application
- Aplica atributo `data-theme` al elemento raíz
- CSS selectors: `[data-theme="dark"]` y `[data-theme="light"]`

### Meta Theme Color
- Cambia `<meta name="theme-color">` para navegador

## CSS Variables

Cada tema define variables de color:

```css
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #1f2937;
  --color-border: #d1d5db;
}

[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f3f4f6;
  --color-border: #1f2937;
}
```

## Adding Styles for New Theme

1. Crear archivo `_<theme>-theme.scss` en `src/styles/themes/`
2. Usar selector `[data-theme="<theme>"]`
3. Importar en `src/styles/main.scss`

```scss
@import './themes/light-theme';
@import './themes/dark-theme';
```

## Testing

```jsx
test('theme toggle works', () => {
  const { useTheme } = require('@/context/ThemeContext')
  const { theme, setThemeMode } = useTheme()
  
  setThemeMode('light')
  expect(document.documentElement.getAttribute('data-theme')).toBe('light')
})
```
