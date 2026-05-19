# Header Component - Requirements & Design Document

**Project:** IACT Dashboard  
**Component:** Header  
**Version:** 1.0  
**Date:** 2024-04-24  
**Author:** Development Team  
**Status:** In Planning

---

## 1. EXECUTIVE SUMMARY

The Header component is a critical part of the IACT Dashboard's user interface. It provides navigation, user identification, notifications, and global actions. This document outlines the complete scope, requirements, use cases, and design specifications for the Header component implementation using Test-Driven Development (TDD).

**Scope Boundary:** Global Header for authenticated Dashboard pages only  
**Not in Scope:** Login page header, mobile-specific hamburger logic (separate component)  
**Estimated Effort:** 6-8 hours (including tests)

---

## 2. SCOPE DEFINITION

### 2.1 In Scope

- **Global Header Component** for all authenticated pages
- **Responsive Design** (desktop, tablet, mobile)
- **User Identification** (avatar, name, email)
- **User Menu Dropdown** (Profile, Settings, Logout)
- **Notifications Badge** (unread count)
- **Breadcrumb/Current Page** indicator
- **Search Bar** (global search)
- **Logo/Branding** area
- **WCAG AAA Accessibility** compliance
- **Unit & Component Tests** (full coverage)

### 2.2 Out of Scope

- Sidebar navigation (separate component)
- Hamburger menu (mobile nav - separate component)
- Search functionality implementation (just UI)
- Notification data fetching (just display)
- Settings page implementation
- Profile page implementation

### 2.3 Future Scope (Phase 2)

- Themes switcher (light/dark mode)
- Language selector
- Help/Documentation popover
- Advanced notifications with actions
- Command palette

---

## 3. BUSINESS REQUIREMENTS

### 3.1 Functional Requirements

| ID | Requirement | Priority | Description |
|---|---|---|---|
| FR-001 | Display Brand Logo | HIGH | Show IACT logo and app name in header |
| FR-002 | Show Current User | HIGH | Display logged-in user info (avatar, name) |
| FR-003 | User Menu Dropdown | HIGH | Dropdown with Profile, Settings, Logout options |
| FR-004 | Show Breadcrumbs | MEDIUM | Display current page breadcrumb navigation |
| FR-005 | Search Bar | MEDIUM | Global search bar with icon |
| FR-006 | Notification Badge | MEDIUM | Show unread notification count |
| FR-007 | Logout Action | HIGH | Ability to logout from header |
| FR-008 | Navigate to Profile | MEDIUM | Link to user profile page |
| FR-009 | Navigate to Settings | MEDIUM | Link to settings page |
| FR-010 | Responsive Layout | HIGH | Adapt layout for different screen sizes |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority | Description |
|---|---|---|---|
| NFR-001 | Performance | HIGH | Render in <100ms, size <50KB (uncompressed) |
| NFR-002 | Accessibility | HIGH | WCAG AAA compliance (Level AAA) |
| NFR-003 | Browser Support | MEDIUM | Chrome, Firefox, Safari, Edge (last 2 versions) |
| NFR-004 | Mobile Support | HIGH | Full functionality on mobile (320px+) |
| NFR-005 | Code Coverage | HIGH | 90%+ test coverage |
| NFR-006 | Type Safety | MEDIUM | PropTypes or TypeScript for type checking |
| NFR-007 | Documentation | MEDIUM | Clear JSDoc comments and Storybook stories |
| NFR-008 | Maintainability | MEDIUM | Modular, DRY, SOLID principles |

---

## 4. USE CASES

### UC-001: User Opens Dashboard

**Actor:** Authenticated User  
**Precondition:** User is logged in and authenticated  
**Main Flow:**
1. User navigates to dashboard
2. Header component renders
3. Header displays user's name and avatar
4. Header shows current page breadcrumb
5. Notification count displays

**Alternative:** User is on different dashboard page
- Same header displays, breadcrumb updates to current page

**Postcondition:** Header is fully visible and functional

---

### UC-002: User Views Notifications

**Actor:** Authenticated User  
**Precondition:** User is on dashboard with unread notifications  
**Main Flow:**
1. User sees notification badge with count
2. Badge is red/highlighted if count > 0
3. User hovers over badge (optional)
4. Notification indicator is visible

**Postcondition:** Notification count is displayed

---

### UC-003: User Opens Profile Menu

**Actor:** Authenticated User  
**Precondition:** Header is rendered, user clicks user avatar/menu  
**Main Flow:**
1. User clicks avatar or user menu button
2. Dropdown menu appears below user menu
3. Menu shows three options: Profile, Settings, Logout
4. Options are clickable

**Alternative Flows:**
- User clicks elsewhere, dropdown closes
- User clicks menu again, dropdown toggles

**Postcondition:** Dropdown menu is visible with correct options

---

### UC-004: User Navigates to Profile

**Actor:** Authenticated User  
**Precondition:** User menu dropdown is open  
**Main Flow:**
1. User clicks "Profile" option
2. Navigation to /profile page triggered
3. Header remains visible

**Postcondition:** User navigated to profile page

---

### UC-005: User Navigates to Settings

**Actor:** Authenticated User  
**Precondition:** User menu dropdown is open  
**Main Flow:**
1. User clicks "Settings" option
2. Navigation to /settings page triggered
3. Header remains visible

**Postcondition:** User navigated to settings page

---

### UC-006: User Logs Out

**Actor:** Authenticated User  
**Precondition:** User menu dropdown is open, user is logged in  
**Main Flow:**
1. User clicks "Logout" option
2. Logout action is triggered
3. Session is cleared
4. User redirected to login page

**Alternative:** Browser back button after logout
- Redirects to login, prevents back access

**Postcondition:** User is logged out, session cleared

---

### UC-007: User Searches Globally

**Actor:** Authenticated User  
**Precondition:** User is on any dashboard page  
**Main Flow:**
1. User clicks search bar
2. Search input focuses
3. User types search query
4. Search is triggered on Enter key

**Alternative:** User clicks magnifying glass icon
- Same as above

**Postcondition:** Search action triggered (handler called)

---

### UC-008: Header Responsive on Mobile

**Actor:** Mobile User  
**Precondition:** User accesses dashboard on mobile device (< 768px)  
**Main Flow:**
1. Header layout adjusts for small screen
2. Logo size reduces
3. Search bar may hide or compress
4. User menu remains accessible
5. Touch targets are 48px minimum

**Postcondition:** Header is fully functional on mobile

---

## 5. ACCEPTANCE CRITERIA (Definition of Done)

### 5.1 Component Criteria

- [ ] Header component created and exported
- [ ] All 7 subcomponents created and working
- [ ] Props are properly typed (PropTypes)
- [ ] Default props provided for optional props
- [ ] Component renders without errors

### 5.2 Functionality Criteria

- [ ] User avatar displays correctly
- [ ] User name displays correctly
- [ ] User email displays in dropdown
- [ ] Logo area renders with branding
- [ ] Breadcrumb shows current page
- [ ] Search bar is functional and focused
- [ ] Notification count displays (0-999+)
- [ ] User menu dropdown opens/closes
- [ ] All menu options are clickable
- [ ] Logout clears session
- [ ] Navigation links work correctly

### 5.3 UI/UX Criteria

- [ ] Design matches IACT design system
- [ ] Colors are consistent with brand
- [ ] Typography is correct (font, size, weight)
- [ ] Spacing and padding are consistent
- [ ] Hover states visible on interactive elements
- [ ] Active state shows on current page
- [ ] Dropdown arrow indicator present
- [ ] User avatar has fallback (initials)

### 5.4 Responsive Criteria

- [ ] Works on desktop (1200px+)
- [ ] Works on tablet (768px - 1199px)
- [ ] Works on mobile (320px - 767px)
- [ ] All elements visible and accessible
- [ ] Touch targets 48px minimum on mobile
- [ ] No horizontal scroll on mobile
- [ ] Text readable at 200% zoom

### 5.5 Accessibility Criteria

- [ ] WCAG AAA Level AA compliance minimum
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation working (Tab, Enter, Escape)
- [ ] Focus indicators visible (2px minimum)
- [ ] Color contrast 7:1 for text
- [ ] Links underlined or have aria-label
- [ ] Screen reader compatible
- [ ] No automatic redirects without warning
- [ ] Form elements properly labeled

### 5.6 Code Quality Criteria

- [ ] No console errors or warnings
- [ ] ESLint passes without issues
- [ ] Code follows project style guide
- [ ] Comments on complex logic
- [ ] JSDoc comments on all functions
- [ ] DRY principle followed
- [ ] No hardcoded values (use constants)
- [ ] Proper error handling

### 5.7 Testing Criteria

- [ ] 90%+ code coverage
- [ ] Unit tests for all components
- [ ] Integration test for Header container
- [ ] Snapshot tests updated
- [ ] All tests passing
- [ ] Accessibility tests (axe, jest-axe)
- [ ] Mobile/responsive tests

### 5.8 Documentation Criteria

- [ ] README.md created for Header module
- [ ] Component props documented
- [ ] Usage examples provided
- [ ] JSDoc comments on all exports
- [ ] Architecture diagram included
- [ ] Design decisions documented

### 5.9 Performance Criteria

- [ ] Component renders in < 100ms
- [ ] No unnecessary re-renders
- [ ] Bundle size < 50KB (uncompressed)
- [ ] Optimized images (logo, avatar)
- [ ] CSS-in-JS or imported CSS (no inline)

---

## 6. COMPONENT DESIGN

### 6.1 Architecture Overview

```
Header (Container)
├── LogoBrand (Presentational)
├── BreadcrumbNav (Presentational)
├── SearchBar (Presentational)
├── NotificationBell (Presentational)
└── UserMenu (Container)
    ├── Avatar (Presentational)
    └── UserMenuDropdown (Presentational)
```

### 6.2 Component Specifications

#### Header.jsx (Container)
**Purpose:** Main header container that orchestrates all subcomponents  
**Props:**
```javascript
{
  currentPage: string,              // e.g., "User Management"
  unreadCount: number,              // 0-999+ notifications
  userInfo: {
    id: number,
    name: string,
    email: string,
    avatar_url: string,
  },
  onSearch: (query: string) => void,
  onNavigate: (path: string) => void,
  onLogout: () => void,
}
```

**Responsibilities:**
- Manage dropdown state
- Handle keyboard interactions
- Pass props to subcomponents
- Manage responsive behavior

---

#### LogoBrand.jsx (Presentational)
**Purpose:** Display logo and app branding  
**Props:**
```javascript
{
  logoUrl: string,
  appName: string,
  onLogoClick: () => void,
}
```

**Display:**
- Logo image (80px max)
- App name text
- Clickable to home

---

#### BreadcrumbNav.jsx (Presentational)
**Purpose:** Show current page breadcrumb navigation  
**Props:**
```javascript
{
  breadcrumbs: [
    { label: string, path: string, current: boolean }
  ],
  onNavigate: (path: string) => void,
}
```

**Display:**
- Breadcrumb trail
- Current page highlighted
- Separator between items (>)

---

#### SearchBar.jsx (Presentational)
**Purpose:** Global search input  
**Props:**
```javascript
{
  placeholder: string,
  onSearch: (query: string) => void,
  value: string,
}
```

**Features:**
- Search icon
- Placeholder text
- Submit on Enter
- Clear on Escape

---

#### NotificationBell.jsx (Presentational)
**Purpose:** Show unread notification count  
**Props:**
```javascript
{
  unreadCount: number,
  onClick: () => void,
}
```

**Display:**
- Bell icon
- Badge with count
- Red if count > 0
- "99+" if count > 99

---

#### UserMenu.jsx (Container)
**Purpose:** User identification and menu management  
**Props:**
```javascript
{
  userInfo: {
    name: string,
    email: string,
    avatar_url: string,
  },
  isOpen: boolean,
  onToggle: () => void,
  onNavigate: (path: string) => void,
  onLogout: () => void,
}
```

**Responsibilities:**
- Display user avatar
- Manage dropdown state
- Handle navigation

---

#### UserMenuDropdown.jsx (Presentational)
**Purpose:** Dropdown menu with user actions  
**Props:**
```javascript
{
  userInfo: { name: string, email: string },
  isOpen: boolean,
  onNavigate: (path: string) => void,
  onLogout: () => void,
}
```

**Options:**
1. Profile → /profile
2. Settings → /settings
3. Logout → logout()

---

### 6.3 State Management

```javascript
// Header local state
const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')

// Close menu on Escape
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') setIsUserMenuOpen(false)
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [])

// Close menu on outside click
useClickAway(userMenuRef, () => setIsUserMenuOpen(false))
```

---

### 6.4 Styling Approach

**CSS Structure:**
```
src/styles/components/_header.scss
├── .header (main container)
├── .header__logo (logo area)
├── .header__nav (breadcrumb)
├── .header__search (search area)
├── .header__actions (notifications + user menu)
├── .header__notification (bell icon)
├── .header__user-menu (dropdown)
└── Responsive modifiers (@media)
```

**Design Tokens:**
```scss
// Colors
$header-bg: #ffffff;
$header-border: #e2e8f0;
$text-primary: #1e293b;

// Spacing
$header-height: 64px;
$header-padding: 16px;

// Breakpoints
$mobile: 320px;
$tablet: 768px;
$desktop: 1200px;
```

---

### 6.5 Layout (Desktop)

```
┌────────────────────────────────────────────────────────┐
│ LOGO  │  BREADCRUMB  │ SEARCH BAR  │ NOTIF  │  USER    │
│       │              │            │   (3)  │  John ▼  │
└────────────────────────────────────────────────────────┘
```

**Layout Widths:**
- Logo: 200px
- Breadcrumb: flex-grow
- Search: 250px
- Notifications: 44px
- User Menu: 200px

---

### 6.6 Layout (Mobile - 480px)

```
┌──────────────────────────────────────┐
│ LOGO  SEARCH  NOTIF  USER          │
│       (⌕)      (3)    John ▼       │
└──────────────────────────────────────┘
```

**Changes:**
- Logo smaller
- Search compressed
- Breadcrumb hidden
- User menu same

---

## 7. DESIGN SPECIFICATIONS

### 7.1 Colors

| Element | Color | Contrast | Use |
|---------|-------|----------|-----|
| Background | #FFFFFF | N/A | Header bg |
| Border | #E2E8F0 | 2:1 | Bottom border |
| Text | #1E293B | 14.5:1 | Primary text |
| Text Secondary | #64748B | 9:1 | Secondary text |
| Link | #1D4ED8 | 7.2:1 | Links (AAA) |
| Hover | #F1F5F9 | N/A | Hover background |
| Notification | #EF4444 | 8:1 | Badge background |
| Focus | #3B82F6 | 6.5:1 | Focus ring |

---

### 7.2 Typography

| Element | Font | Size | Weight | Line-Height |
|---------|------|------|--------|-------------|
| App Name | Inter | 18px | 700 | 1.4 |
| Breadcrumb | Inter | 14px | 400 | 1.5 |
| User Name | Inter | 14px | 600 | 1.5 |
| User Email | Inter | 12px | 400 | 1.5 |
| Button Text | Inter | 14px | 500 | 1.5 |

---

### 7.3 Spacing

| Element | Size |
|---------|------|
| Header Height | 64px |
| Padding (H) | 16px |
| Padding (V) | 12px |
| Gap (items) | 16px |
| Avatar Size | 40px |
| Border Radius | 8px |

---

### 7.4 Interactive States

**Button/Link States:**
- **Default:** No special styling
- **Hover:** Background #F1F5F9
- **Focus:** Outline 2px #3B82F6, offset 2px
- **Active:** Text #1D4ED8, bold

**Dropdown States:**
- **Closed:** Display none
- **Opening:** Animation slideDown 0.3s
- **Open:** Visible below user menu
- **Closing:** Animation slideUp 0.3s

---

### 7.5 Animations

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| Dropdown Slide | 0.3s | ease-out | Menu open/close |
| Badge Pulse | 2s | ease-in-out | Notification indicator |
| Focus Ring | 0.2s | ease-out | Focus state |

---

## 8. BEST PRACTICES APPLIED

### 8.1 React Best Practices
- ✓ Functional components with Hooks
- ✓ Proper prop drilling (max 2 levels)
- ✓ Memoization for expensive computations
- ✓ useCallback for event handlers
- ✓ useRef for DOM manipulation
- ✓ Proper cleanup in useEffect

### 8.2 Component Design
- ✓ Single Responsibility Principle
- ✓ Separation of Container/Presentational
- ✓ Proper component composition
- ✓ Reusable components
- ✓ Props validation
- ✓ Default props

### 8.3 Accessibility (WCAG AAA)
- ✓ Semantic HTML
- ✓ ARIA labels on interactive elements
- ✓ Keyboard navigation (Tab, Escape)
- ✓ Focus indicators (2px minimum)
- ✓ Color contrast (7:1)
- ✓ Screen reader compatible

### 8.4 Performance
- ✓ Code splitting (lazy load if needed)
- ✓ Memoization (React.memo)
- ✓ Avoiding unnecessary renders
- ✓ Optimized images
- ✓ CSS optimization

### 8.5 Testing (TDD)
- ✓ Tests first (Red-Green-Refactor)
- ✓ Unit tests for each component
- ✓ Integration tests
- ✓ Accessibility tests (axe)
- ✓ Snapshot tests
- ✓ 90%+ coverage

### 8.6 Code Quality
- ✓ Clean, readable code
- ✓ Proper naming conventions
- ✓ Comments on complex logic
- ✓ JSDoc for all functions
- ✓ ESLint compliant
- ✓ Consistent formatting

### 8.7 Documentation
- ✓ README.md
- ✓ Component stories (Storybook)
- ✓ Inline comments
- ✓ Architecture diagrams
- ✓ Design decisions documented

---

## 9. TECHNICAL SPECIFICATIONS

### 9.1 Technologies

```javascript
// Core
- React 19+
- React Router v6+

// Testing
- Jest
- React Testing Library
- @testing-library/user-event
- @testing-library/jest-dom

// Styling
- SCSS (7-1 pattern)
- CSS variables

// State Management
- React Hooks (useState, useEffect, useRef, useCallback)
- Custom hooks (useClickAway)

// Utilities
- clsx (for className management)
- PropTypes (for type checking)
```

### 9.2 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### 9.3 Accessibility Standards

- WCAG 2.1 Level AA (minimum)
- WCAG 2.1 Level AAA (target)
- Section 508 compliance
- ARIA practices guide

---

## 10. FILE STRUCTURE

```
src/components/common/Header/
├── Header.jsx                 # Main container (150 líneas)
├── LogoBrand.jsx             # Logo component (50 líneas)
├── BreadcrumbNav.jsx         # Breadcrumb (60 líneas)
├── SearchBar.jsx             # Search input (50 líneas)
├── NotificationBell.jsx      # Notification badge (40 líneas)
├── UserMenu.jsx              # User menu container (80 líneas)
├── UserMenuDropdown.jsx      # Dropdown menu (60 líneas)
├── _header.scss              # Styles (300 líneas)
└── README.md                 # Component documentation

__tests__/components/common/Header/
├── Header.test.js            # Container tests (80 líneas)
├── LogoBrand.test.js         # Logo tests (40 líneas)
├── BreadcrumbNav.test.js     # Breadcrumb tests (50 líneas)
├── SearchBar.test.js         # Search tests (50 líneas)
├── NotificationBell.test.js  # Notification tests (40 líneas)
├── UserMenu.test.js          # Menu tests (60 líneas)
└── UserMenuDropdown.test.js  # Dropdown tests (50 líneas)

TOTAL: 7 components + 7 test files (~1,500 líneas)
```

---

## 11. DEVELOPMENT APPROACH

### 11.1 TDD Workflow

**Phase 1: Test Setup (1 hour)**
```
1. Create test files with specs
2. Write failing tests (Red phase)
3. Outline component structure
```

**Phase 2: Component Development (3-4 hours)**
```
1. Implement each component
2. Make tests pass (Green phase)
3. Refactor code (Refactor phase)
4. Run all tests
```

**Phase 3: Integration (1 hour)**
```
1. Integrate Header into DashboardLayout
2. Test full component tree
3. Fix integration issues
```

**Phase 4: Polish (1-2 hours)**
```
1. Add accessibility enhancements
2. Optimize performance
3. Add documentation
4. Final testing
```

### 11.2 Commit Strategy

```bash
# Commit 1: Test setup + LogoBrand tests
git commit -m "test: add Header component specs"

# Commit 2: LogoBrand implementation
git commit -m "feat: implement LogoBrand component"

# Commit 3: Other components
git commit -m "feat: implement BreadcrumbNav, SearchBar, etc"

# Commit 4: Header container
git commit -m "feat: implement Header container"

# Commit 5: Styles + integration
git commit -m "feat: add Header styles and integration"

# Commit 6: Documentation
git commit -m "docs: add Header component documentation"
```

---

## 12. SUCCESS METRICS

### 12.1 Quality Metrics
- ✓ 90%+ code coverage
- ✓ All tests passing
- ✓ 0 ESLint errors
- ✓ 0 accessibility violations (axe)
- ✓ WCAG AAA compliance

### 12.2 Performance Metrics
- ✓ Render time < 100ms
- ✓ Bundle size < 50KB
- ✓ No console errors
- ✓ Lighthouse score 95+

### 12.3 Functionality Metrics
- ✓ All use cases implemented
- ✓ All acceptance criteria met
- ✓ Responsive on all devices
- ✓ All interactive elements working

### 12.4 Documentation Metrics
- ✓ README.md complete
- ✓ Storybook stories created
- ✓ JSDoc comments 100%
- ✓ Design decisions documented

---

## 13. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Responsive design issues | HIGH | MEDIUM | Test early on mobile, use design system |
| Accessibility compliance | HIGH | LOW | Use ARIA spec, test with axe |
| Performance degradation | MEDIUM | LOW | Profile with DevTools, optimize images |
| Testing coverage gaps | MEDIUM | LOW | TDD approach ensures coverage |
| Integration complexity | MEDIUM | MEDIUM | Create integration tests, document API |

---

## 14. TIMELINE ESTIMATE

| Phase | Task | Duration | Total |
|-------|------|----------|-------|
| 1 | Test setup + specs | 1 hour | 1h |
| 2 | Component development | 3-4 hours | 4-5h |
| 3 | Integration + testing | 1 hour | 5-6h |
| 4 | Polish + docs | 1-2 hours | 6-8h |
| **TOTAL** | | | **6-8 hours** |

---

## 15. APPROVAL & SIGN-OFF

- [ ] Requirements approved
- [ ] Design approved
- [ ] Scope locked
- [ ] Ready to implement

**Status:** Ready for Development  
**Next Step:** Create test files and begin TDD cycle

---

## Appendix A: Component API Reference

### Header Props

```javascript
Header.propTypes = {
  currentPage: PropTypes.string.isRequired,
  unreadCount: PropTypes.number,
  userInfo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar_url: PropTypes.string,
  }).isRequired,
  onSearch: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  unreadCount: 0,
  onSearch: () => {},
};
```

---

**Document Version:** 1.0  
**Last Updated:** 2024-04-24  
**Next Review:** After Phase 1 completion  

