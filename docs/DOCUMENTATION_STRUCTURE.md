# Documentation Structure

Complete overview of all documentation files and organization.

## Folder Structure

```
docs/
├── README.md                          ← START HERE (main index)
├── QUICK_START.md                     ← 5-minute setup (general)
├── SETUP.md                           ← Detailed setup guide
├── ARCHITECTURE.md                    ← System architecture
├── CONTRIBUTING.md                    ← How to contribute
├── DEPLOYMENT.md                      ← Production deployment
├── TROUBLESHOOTING.md                 ← Common issues
├── STATE_DESIGN.md                    ← Redux state design
├── DOCUMENTATION_STRUCTURE.md         ← This file
│
├── api/                               ← API reference
│   └── HOOKS.md                       ← Custom hooks API
│
├── components/                        ← Component docs
│   ├── Modal.md
│   └── Table.md
│
├── examples/                          ← Working code examples
│   ├── ejemplo-auditpage.jsx          ← AuditPage with DateTimeInputs + formSlice
│   └── ejemplo-breakpoints-responsivo.jsx ← Responsive breakpoints example
│
├── guides/                            ← Development guides
│   ├── COMPONENT_GUIDE.md             ← How to build components
│   ├── TESTING.md                     ← Testing patterns
│   ├── THEME.md                       ← Theming system
│   ├── breakpoints-implementation.md  ← Breakpoints responsive implementation
│   ├── clean-code-refactoring.md      ← Clean code refactoring plan
│   ├── comment-cleanup.md             ← Comment cleanup guide
│   ├── decorator-examples.md          ← Decorator pattern examples
│   ├── ejecucion.md                   ← Execution / run guide
│   ├── export-service.md              ← Export service guide
│   ├── facade-pattern.md              ← Facade pattern guide
│   ├── import-organization.md         ← Import organization guide
│   ├── instalacion-componentes.md     ← Component installation guide
│   ├── mock-interceptor-pattern.md    ← MockInterceptor: mocks en capa de red (no en componentes)
│   ├── permisos.md                    ← RBAC permissions guide
│   ├── quickstart-scss.md             ← Quick start post-Tailwind removal (SCSS utilities)
│   ├── rbac-naming-standard.md        ← RBAC v5.2.1 naming standard (inglés, sin acrónimos)
│   ├── responsive-bootstrap.md        ← Bootstrap responsive utilities
│   ├── responsive-guide.md            ← Responsive utilities guide
│   ├── responsive-usage.md            ← Responsive utilities usage
│   ├── resumen-react-redux.md         ← DateTimeInputs + formSlice implementation
│   ├── scss-utilities.md              ← SCSS utilities reference
│   ├── services-setup.md              ← Services setup guide
│   └── variable-naming.md             ← Variable naming conventions
│
├── analysis/                          ← Technical analysis documents
│   ├── breakpoints.md                 ← Breakpoints analysis
│   ├── changelog-tailwind-removal.md  ← Tailwind CSS removal changelog
│   ├── comparative-mx-template.md     ← MX-template comparative analysis
│   ├── header-requirements.md         ← Header component requirements
│   ├── implementacion-actual.md       ← Current implementation analysis
│   ├── mx-template-pickers.md         ← MX-template to IACT pickers migration
│   ├── patterns-implementation.md     ← Patterns implementation analysis
│   ├── phase-0-current-state.md       ← Phase 0 current state analysis
│   ├── test-fixes-priority.md         ← Test fixes priority plan
│   ├── testing-sessions.md            ← Testing sessions patterns and results
│   ├── utilities-nomenclature.md      ← Utilities nomenclature analysis
│   ├── webpack-config-advanced.md     ← Advanced webpack config patterns (from develop branch)
│   ├── webpack-optimization.md        ← Webpack optimization plan
│   ├── webpack5-exhaustivo.md         ← Exhaustive Webpack 5 analysis
│   ├── webpack5-iact-implementacion.md ← Webpack 5 IACT implementation analysis
│   ├── webpack5-parte1.md             ← Webpack 5 analysis part 1
│   └── webpack5-parte2.md             ← Webpack 5 analysis part 2
│
├── project-scope/                     ← Project planning and history
│   ├── PHASES_COMPLETED.md            ← Phase-by-phase progress tracker
│   ├── feature-implementation-plan.md ← Feature implementation plan
│   ├── implementation-history.md      ← Consolidated iteration history (ITER 1–6, Phases 1–5)
│   ├── implementation-plan.md         ← Implementation plan
│   ├── plan-implementacion.md         ← Plan de implementación (español)
│   ├── project-structure-legacy.md    ← Legacy project structure reference
│   ├── roadmap-final.md               ← Final optimized roadmap
│   └── webpack-improvements-roadmap.md ← Webpack improvements roadmap
│
├── raid-party-lessons/                ← Patterns from Raid Party app
│   ├── LESSON_3_21_CSS_MODULES.md     ← CSS Modules lesson
│   ├── LESSON_3_22_EVENT_CLEANUP.md   ← Event cleanup lesson
│   ├── LESSON_3_23_FEATURE_FOLDERS.md ← Feature folders lesson
│   ├── DETAILED_LESSON_3_21.md        ← Detailed CSS Modules
│   ├── DETAILED_LESSON_3_22.md        ← Detailed Event Cleanup
│   ├── DETAILED_LESSON_3_23.md        ← Detailed Feature Folders
│   ├── adaptation-analysis.md         ← Raid Party → IACT adaptation analysis
│   ├── deep-analysis.md               ← Deep Raid Party analysis
│   ├── functionality-analysis.md      ← Raid Party useful functionality
│   └── summary.md                     ← Consolidated summary + pickers analysis
│
└── reference/                         ← Reference materials
    ├── DEPENDENCIES.md                ← npm dependencies reference
    ├── RAID_PARTY_STRUCTURE.md        ← Raid Party app structure reference
    ├── design-patterns.md             ← Design patterns reference
    ├── patterns-implementables.md     ← Implementable patterns
    └── webpack-summary.md             ← Webpack complete summary
```

## File Purposes by Category

### Root-level docs (general audience)

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Main entry point | Everyone |
| QUICK_START.md | 5-minute setup | New developers |
| SETUP.md | Detailed installation | Setup phase |
| ARCHITECTURE.md | System design | Developers |
| CONTRIBUTING.md | Contribution guidelines | Contributors |
| DEPLOYMENT.md | Production deployment | DevOps |
| TROUBLESHOOTING.md | Problem solving | Everyone |
| STATE_DESIGN.md | Redux state design | Developers |

### guides/ (how to do things)

Active guides for ongoing development. Each guide covers a specific technical topic
relevant to contributing to IACT-UI.

### analysis/ (what we found / what needs doing)

Technical analysis documents from architectural investigations. These represent
point-in-time analysis — check dates and compare to current state before acting.

### project-scope/ (what we planned and built)

Planning documents and implementation history. `implementation-history.md` consolidates
all iteration logs (ITER 1–6) and the 5-phase feature implementation.

### raid-party-lessons/ (patterns from external reference)

Lessons learned from analyzing the Raid Party metaverse app. These patterns are
prioritized based on effort/impact for IACT-UI adoption.

### reference/ (look-it-up docs)

Static reference material that doesn't change often. Design patterns, dependencies,
webpack configuration summaries.

### examples/ (working code)

Runnable JSX examples demonstrating specific features or components.
