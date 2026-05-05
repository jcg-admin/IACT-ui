# Documentation Structure

Complete overview of all documentation files and organization.

## Folder Structure

```
docs/
├── README.md                          ← START HERE (main index)
├── QUICK_START.md                     ← 5-minute setup
├── SETUP.md                           ← Detailed setup guide
├── ARCHITECTURE.md                    ← System architecture
├── API.md                             ← Component/module APIs
├── TROUBLESHOOTING.md                 ← Common issues
├── CONTRIBUTING.md                    ← How to contribute
├── DEPLOYMENT.md                      ← Production deployment
├── DOCUMENTATION_STRUCTURE.md         ← This file
│
├── guides/                            ← Development guides
│   ├── COMPONENT_GUIDE.md             ← How to build components
│   ├── REDUX_GUIDE.md                 ← State management
│   ├── ROUTING_GUIDE.md               ← Navigation & routing
│   ├── CSS_MODULES_GUIDE.md           ← Styling system
│   ├── TESTING_GUIDE.md               ← Testing patterns
│   └── EVENT_CLEANUP_GUIDE.md         ← Memory leak prevention
│
├── raid-party-lessons/                ← Professional patterns
│   ├── LESSON_3_21_CSS_MODULES.md     ← Scoped styling (Raid Party)
│   ├── LESSON_3_22_EVENT_CLEANUP.md   ← Event cleanup (Raid Party)
│   ├── LESSON_3_23_FEATURE_FOLDERS.md ← Code organization (Raid Party)
│   ├── DETAILED_LESSON_3_21.md        ← Detailed CSS Modules
│   ├── DETAILED_LESSON_3_22.md        ← Detailed Event Cleanup
│   └── DETAILED_LESSON_3_23.md        ← Detailed Feature Folders
│
├── project-scope/                     ← Project planning
│   ├── SCOPE.md                       ← Full project scope
│   ├── ATOMIC_TASKS.md                ← Task breakdown
│   └── PHASES_COMPLETED.md            ← Phase-by-phase progress
│
└── reference/                         ← Reference materials
    ├── DEPENDENCIES.md                ← npm dependencies
    ├── RAID_PARTY_STRUCTURE.md        ← Raid Party app reference
    └── API_REFERENCE.md               ← Complete API reference
```

## File Purposes

### Root Level Documentation

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Main entry point | Everyone |
| QUICK_START.md | 5-minute setup | New developers |
| SETUP.md | Detailed installation | Setup phase |
| ARCHITECTURE.md | System design | Developers |
| API.md | Component/module APIs | Developers |
| TROUBLESHOOTING.md | Problem solving | Everyone |
| CONTRIBUTING.md | Contribution guidelines | Contributors |
| DEPLOYMENT.md | Production deployment | DevOps/Deployment |

### Guides (guides/)

Deep dives into specific topics:
- **COMPONENT_GUIDE.md** - Build new components
- **REDUX_GUIDE.md** - Manage state
- **ROUTING_GUIDE.md** - Set up routes
- **CSS_MODULES_GUIDE.md** - Write styles
- **TESTING_GUIDE.md** - Write tests
- **EVENT_CLEANUP_GUIDE.md** - Prevent memory leaks

### Raid Party Lessons (raid-party-lessons/)

Professional patterns from production app:
- **Lesson 3.21** - CSS Modules implementation
- **Lesson 3.22** - Event cleanup and memory safety
- **Lesson 3.23** - Feature folders and barrel exports

Each lesson has:
- Quick summary version
- Detailed implementation version

### Project Scope (project-scope/)

Planning and progress documentation:
- **SCOPE.md** - What's included/excluded
- **ATOMIC_TASKS.md** - Individual task details
- **PHASES_COMPLETED.md** - Phase progress

### Reference (reference/)

Reference materials:
- **DEPENDENCIES.md** - All npm packages
- **RAID_PARTY_STRUCTURE.md** - Raid Party architecture reference
- **API_REFERENCE.md** - Full API docs

## How to Use This Documentation

### I want to...
- **Set up the project** → [QUICK_START.md](./QUICK_START.md)
- **Understand the system** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Build a component** → [guides/COMPONENT_GUIDE.md](./guides/COMPONENT_GUIDE.md)
- **Manage state** → [guides/REDUX_GUIDE.md](./guides/REDUX_GUIDE.md)
- **Set up routing** → [guides/ROUTING_GUIDE.md](./guides/ROUTING_GUIDE.md)
- **Write tests** → [guides/TESTING_GUIDE.md](./guides/TESTING_GUIDE.md)
- **Deploy to production** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshoot issues** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Learn professional patterns** → [raid-party-lessons/](./raid-party-lessons/)

## Documentation Standards

All documentation follows:
- Clear hierarchy (H1, H2, H3)
- Code examples
- Clear language
- Cross-references
- Updated regularly

## Updating Documentation

When you:
1. Add a feature → update relevant guides
2. Change architecture → update ARCHITECTURE.md
3. Fix a bug → add to TROUBLESHOOTING.md
4. Learn something → add to relevant guide
5. Complete a task → update PHASES_COMPLETED.md

## Documentation Quality Checklist

- [ ] Clear title and purpose
- [ ] Code examples (where applicable)
- [ ] Step-by-step instructions
- [ ] Links to related docs
- [ ] Updated timestamp
- [ ] Spell checked
- [ ] No broken links

---

**Last Updated:** April 25, 2026  
**Status:** Complete ✅

See [README.md](./README.md) to get started.
