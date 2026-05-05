# Troubleshooting Guide

Common issues and solutions.

## Port 3000 Already in Use

```bash
PORT=3001 npm start
```

## Dependencies Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Tests Failing

```bash
npm test -- --clearCache
npm test
```

## Styles Not Loading

- Check CSS Modules import syntax
- Verify `.module.scss` extension
- Check webpack config

## Components Not Rendering

- Check barrel export (index.jsx)
- Verify import paths
- Check console for errors

## Redux State Not Updating

- Check action dispatch
- Verify reducer implementation
- Check middleware config

## Build Errors

```bash
npm run build
# Check error messages
# Usually: missing dependencies or syntax errors
```

## Performance Issues

- Check Network tab in DevTools
- Look for large assets
- Enable code splitting
- Check for console warnings

---

See [Setup Guide](./SETUP.md) for more help.
