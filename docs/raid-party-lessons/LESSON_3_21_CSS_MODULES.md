# Lesson 3.21: CSS Modules (Raid Party) — SUPERSEDED

> **Estado:** Esta lección documenta un patrón que fue evaluado y descartado.
> El proyecto usa SCSS global puro (ver sección "Decisión" abajo).

## What Are CSS Modules?

CSS Modules provide scoped styling by transforming class names to unique
hashes at compile time (`styles.container` → `Component_container__a3Bx2`).

## Por qué no se usa en este proyecto

El proyecto sigue el patrón estándar de Sass en React:

```javascript
// ✅ Patrón del proyecto
import './Component.scss'

export default function Component() {
  return <div className="container">Content</div>
}
```

CSS Modules requiere un objeto intermediario (`import styles from ...`) y
`className={styles.xxx}`, lo cual es inconsistente con el resto del codebase
donde las páginas y componentes usan strings de clase directos.

## Decisión

Los 11 archivos `.module.scss` fueron convertidos a `.scss` planos en la
auditoría de variables SCSS. El patrón unificado del proyecto es:

```
Component/
├── Component.jsx       ← import './Component.scss'  +  className="name"
├── Component.scss      ← clases SCSS globales, variables disponibles sin @import
├── Component.test.js
└── index.jsx
```

Las variables SCSS (`$primary-color`, `$gray-200`, `$spacing-md`, etc.) están
disponibles en todos los archivos SCSS vía `sass-loader.additionalData` —
no se necesita `@import` ni `@use` manual.

---

Ver [Architecture](../ARCHITECTURE.md) y [scss-page-patterns](../guides/scss-page-patterns.md).
