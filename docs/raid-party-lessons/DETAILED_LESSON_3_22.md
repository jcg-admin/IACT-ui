# TASK 3.22: Event Cleanup & Memory Leak Prevention (RAID PARTY LESSON)

**Status:** ✅ COMPLETE  
**Implementation:** useMenuToggle hook  
**Raid Party Pattern:** Yes ⭐⭐⭐

---

## The Problem: Memory Leaks

### What Happens Without Cleanup?

```javascript
// ❌ BAD: Memory leak!
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.altKey && event.key === 'n') {
      toggleSidebar()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  // ❌ MISSING: No cleanup! Event listener stays in memory
}, [toggleSidebar])
```

**Problem:**
- Component mounts → adds event listener
- Component unmounts → listener still there
- User navigates to another component
- Multiple components add multiple listeners
- Memory fills up with dead event listeners
- App slows down, eventually crashes

---

## The Solution: Cleanup Function

```javascript
// ✅ GOOD: Proper cleanup
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.altKey && event.key === 'n') {
      toggleSidebar()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  // ✅ RETURN CLEANUP FUNCTION
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}, [toggleSidebar])
```

**How it works:**
1. Component mounts → adds event listener
2. Component unmounts → cleanup runs → removes event listener
3. No memory leak!
4. Next component can add its own listener cleanly

---

## Implementation in useMenuToggle

**File:** `src/hooks/useMenuToggle.js`

```javascript
export function useMenuToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // ✅ EFFECT 1: Mobile detection with cleanup
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // ✅ CLEANUP: Remove resize listener
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // ✅ EFFECT 2: Keyboard shortcuts with cleanup
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt+N: Toggle sidebar
      if (event.altKey && event.key === 'n') {
        event.preventDefault()
        toggleSidebar()
      }

      // Escape: Close sidebar (mobile only)
      if (event.key === 'Escape' && isSidebarOpen && isMobile) {
        event.preventDefault()
        closeSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // ✅ CLEANUP: Remove keyboard listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSidebarOpen, isMobile, toggleSidebar, closeSidebar])

  return {
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    isMobile,
  }
}
```

---

## Pattern Breakdown

### Basic Pattern

```javascript
useEffect(() => {
  // ① Set up event listener or subscription
  const handler = () => { /* ... */ }
  window.addEventListener('event', handler)

  // ② Return cleanup function
  return () => {
    window.removeEventListener('event', handler)
  }
  
  // ③ Dependencies
}, [dependency1, dependency2])
```

### What Gets Cleaned Up?

✅ Event listeners (`addEventListener`)  
✅ Timers (`setInterval`, `setTimeout`)  
✅ Subscriptions (Observables, Redux, GraphQL)  
✅ API calls (abort fetch)  
✅ DOM mutations  
✅ Refs  

---

## Common Mistakes

### ❌ Mistake 1: Forgetting cleanup

```javascript
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // ❌ No return statement = memory leak
}, [])
```

**Fix:**
```javascript
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

### ❌ Mistake 2: Wrong dependencies

```javascript
useEffect(() => {
  const handler = () => toggleSidebar()
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, []) // ❌ Missing toggleSidebar dependency!
```

**Fix:**
```javascript
useEffect(() => {
  const handler = () => toggleSidebar()
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [toggleSidebar]) // ✅ Include all dependencies
```

### ❌ Mistake 3: Creating multiple listeners

```javascript
// ❌ BAD: Creates new listener every render
const handleClick = () => { }
window.addEventListener('click', handleClick)
```

**Fix:**
```javascript
// ✅ GOOD: Listener added once, cleaned once
useEffect(() => {
  const handleClick = () => { }
  window.addEventListener('click', handleClick)
  return () => window.removeEventListener('click', handleClick)
}, [])
```

---

## Testing Event Cleanup

```javascript
describe('useMenuToggle Hook', () => {
  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useMenuToggle())

    unmount()

    // ✅ Verify cleanup happened
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})
```

---

## Performance Impact

### Before (Memory Leak)
- User opens/closes sidebar 100 times
- 100 event listeners accumulated in memory
- App gets slower with each navigation
- Browser console shows memory growing

### After (With Cleanup)
- User opens/closes sidebar 100 times
- Always exactly 1 event listener in memory
- App stays fast
- Memory stays constant

---

## Keyboard Shortcuts Implemented

| Shortcut | Action | Context |
|----------|--------|---------|
| Alt+N | Toggle sidebar | Desktop + Mobile |
| Escape | Close sidebar | Mobile only |

---

## Key Takeaways

1. **Always cleanup after setup** in useEffect
2. **Return a function** from useEffect for cleanup
3. **Dependencies matter** - include all used values
4. **Test cleanup** - verify listeners are removed
5. **Memory leaks are silent** - app just gets slower
6. **Raid Party Pattern** - learned from production app

---

## Next: Task 3.23 (Feature Folders & Barrel Exports)

Event Cleanup ✅ COMPLETE

Next task verifies that feature folder structure is REQUIRED.
