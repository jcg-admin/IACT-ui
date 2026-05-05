# RBAC Naming Standard — v5.2.1

Guía de nomenclatura para código relacionado con el sistema de control de acceso RBAC.

## Regla principal

```
Código:      inglés, descriptivo, sin acrónimos de dominio
Comentarios: español (JSDoc, help_text, labels de UI)
```

Esta regla proviene de `MODELO_RBAC_IACT_v5_2_1.md` (enero 2026) y aplica a
identificadores de código: nombres de funciones, variables, clases, constantes,
parámetros, keys de estado Redux, y nombres de componentes React.

**No aplica a:**
- Strings de dominio del backend (ej: `'sistema.administracion.acceso.sod'` — el backend define esos valores)
- Comentarios y JSDoc
- Texto visible en la UI (labels, headings, mensajes)

---

## Tabla de renombres v5.2.0 → v5.2.1

| Identificador antiguo | Identificador correcto | Dónde |
|-----------------------|------------------------|-------|
| `validateSoD` | `validateSeparationRules` | `accessSlice.js`, `accessService.js` |
| `sodConflicts` | `separationConflicts` | estado Redux en `accessSlice.js` |
| `selectSoDConflicts` | `selectSeparationConflicts` | selector exportado |
| `MANAGE_SOD` | `MANAGE_SEPARATION_RULES` | `src/permissions/catalog.js` |
| `SoDValidator` | `SeparationRulesValidator` | `src/components/access/` |
| `SoDValidation` | `SeparationRulesValidation` | `src/components/transaction/content/` |
| `SoDManagementPage` | `SeparationRulesPage` | `src/pages/access/` |

---

## FunctionCatalog — constantes de permisos

Las constantes en `src/permissions/catalog.js` siguen el patrón:

```js
VERBO_RECURSO: 'sistema.{dominio}.{recurso}.{accion}'
```

Ejemplos correctos:
```js
MANAGE_SEPARATION_RULES: 'sistema.administracion.acceso.sod'
ASSIGN_FUNCTIONS:        'sistema.administracion.acceso.asignar'
VIEW_USERS:              'sistema.administracion.usuarios.ver'
SUPER_ADMIN:             'sistema.administracion.sistema.superadmin'
```

La parte de la derecha (string de dominio) la define el backend — puede contener
abreviaciones del dominio (`sod`, `etl`, `ivr`) porque son valores de datos, no
identificadores de código.

---

## Patrón de servicio de acceso

```js
// src/services/accessService.js

/**
 * Valida reglas de separación de funciones antes de asignar (UC-043).
 * @param {number} userId - ID del usuario
 * @param {number} functionId - PK de la función en el catálogo RBAC
 */
async validateSeparationRules(userId, functionId) {
    const response = await fetch(`${API_BASE_URL}/access/validate-sod`, {
        method: 'POST',
        body: JSON.stringify({ userId, functionId }),
    });
    return response.json();
}
```

Nota: la URL del endpoint (`validate-sod`) puede usar la abreviación del dominio
porque es una URL de API externa, no un identificador de código JavaScript.

---

## Patrón del slice Redux

```js
// src/redux/slices/accessSlice.js

export const validateSeparationRules = createAsyncThunk(
    'access/validateSeparationRules',
    // functionPk: PK numérico de la función en el catálogo RBAC.
    // No es el codename string usado en runtime RBAC checks.
    async ({ userId, functionPk }, { rejectWithValue }) => {
        try {
            return await accessService.validateSeparationRules(userId, functionPk);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Estado
const initialState = {
    separationConflicts: [],   // ✅ correcto
 // sodConflicts: [],          // ❌ prohibido
};

// Selector
export const selectSeparationConflicts = (state) => state.access.separationConflicts;
```

---

## Checklist para nuevos identificadores RBAC

Antes de nombrar una función, variable o componente relacionado con RBAC:

- [ ] ¿El nombre está en inglés? (`validateSeparationRules` no `validarSeparacion`)
- [ ] ¿Evita acrónimos de dominio como prefijo/sufijo? (no `SoD`, no `AGR`, no `ETL` en el nombre)
- [ ] Si el nombre describe "separación de deberes", usa `separationRules` o `separationConflicts`
- [ ] Si el nombre describe "grupos de acceso", usa `functionGroups` o `accessGroups`
- [ ] Si el nombre describe "permisos temporales", usa `temporaryPermissions`
- [ ] ¿El JSDoc está en español?

---

## Strings de UI

Los textos visibles al usuario también deben evitar acrónimos si hay una versión descriptiva:

| ❌ Evitar | ✅ Preferir |
|-----------|------------|
| "Conflictos SoD Detectados" | "Conflictos de Separación Detectados" |
| "Gestión de Reglas SoD" | "Gestión de Reglas de Separación" |
| "Violaciones de SoD" | "Violaciones de Separación de Funciones" |
| "Validate SoD" (step title) | "Validate Separation Rules" |

---

## Referencias

- `src/permissions/catalog.js` — catálogo de constantes de permisos
- `src/redux/slices/accessSlice.js` — thunks y selectores de acceso
- `src/services/accessService.js` — cliente HTTP para endpoints de acceso
- `src/components/access/SeparationRulesValidator.jsx` — visualizador de conflictos
- `src/pages/access/SeparationRulesPage.jsx` — gestión de reglas UC-ACC-05
