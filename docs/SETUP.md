# Setup Guide

Complete guide to set up IACT locally for development.

## Prerequisites

- Node.js 16+ (recommend 18 LTS)
- npm 8+ or yarn 3+
- Git
- A code editor (VS Code recommended)

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-org/iact.git
cd iact
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

## Available Scripts

### Development
```bash
npm start           # Start development server
npm test            # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage
```

### Build
```bash
npm run build       # Build for production
npm run build:analyze  # Analyze bundle size
```

### Code Quality
```bash
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## Project Structure

```
iact/
├── docs/                    # Documentation
├── src/
│   ├── components/          # Reusable components
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   ├── redux/               # Redux store and slices
│   ├── router/              # Route configuration
│   ├── hooks/               # Custom hooks
│   ├── styles/              # Global styles
│   ├── App.jsx              # Root component
│   └── index.js             # Entry point
├── __tests__/               # Test files
├── package.json
├── webpack.config.js
└── jest.config.js
```

## Configuration Files

### webpack.config.js
Webpack bundler configuration with:
- CSS Modules support
- Babel transpilation
- Development/production modes

### jest.config.js
Jest testing configuration with:
- jsdom test environment
- CSS module mocking

### jsconfig.json
Path aliases for clean imports:
```javascript
@components  → src/components
@layouts     → src/layouts
@pages       → src/pages
@hooks       → src/hooks
@redux       → src/redux
@router      → src/router
@styles      → src/styles
@utils       → src/utils
```

## Environment Setup

Create `.env` file in project root:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_USE_MOCKS=true
```

## Troubleshooting

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start
```

### Node modules issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
# Clear Jest cache
npm test -- --clearCache
```

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for more issues.

---

Next: [Architecture Overview](./ARCHITECTURE.md)
