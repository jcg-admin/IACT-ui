# IACT Frontend Documentation

Documentación técnica completa para el proyecto IACT Frontend.

## Tabla de Contenidos

### Components
- [Table](components/Table.md) - Tabla reutilizable con ordenamiento y selección
- [Modal](components/Modal.md) - Modal responsive con tamaños personalizables

### Guides
- [Theme System](guides/THEME.md) - Sistema de tema oscuro/claro
- [Testing](guides/TESTING.md) - Guía de testing con Jest y RTL

### API Reference
- [Custom Hooks](api/HOOKS.md) - useTheme, useToast, useForm

## Quick Links

### For Developers
- [Component Props Reference](components/)
- [Writing Tests](guides/TESTING.md)
- [Using Hooks](api/HOOKS.md)

### For Designers
- [Theme System](guides/THEME.md)
- [Responsive Breakpoints](components/Table.md#responsive-behavior)
- [Color Variables](guides/THEME.md#css-variables)

### For DevOps
- [Deployment Guide](deployment.md) (Coming soon)
- [Performance Optimization](performance.md) (Coming soon)

## Project Structure

```
docs/
├─ components/      # Component documentation
├─ guides/         # Implementation guides
├─ api/            # API references
└─ README.md       # This file
```

## Contributing

When adding new components:

1. Create component documentation in `docs/components/ComponentName.md`
2. Include Props table
3. Add usage example
4. Document styling classes
5. Link from this README

Example structure:
```markdown
# ComponentName

## Overview
Brief description

## Props
| Prop | Type | Default | Description |

## Usage
```jsx
<Component prop="value" />
```

## Features
- ✓ Feature 1
- ✓ Feature 2
```

## Version

**Current Version**: 1.0.0  
**Last Updated**: 2026-04-27  
**Status**: Production Ready

## Support

For questions or issues, refer to:
- Component props in `docs/components/`
- Implementation guides in `docs/guides/`
- API reference in `docs/api/`
