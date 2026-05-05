# Lesson 3.22: Event Cleanup & Memory Leak Prevention (Raid Party)

Proper event listener cleanup learned from Raid Party.

## The Problem

```javascript
// ❌ BAD: Memory leak
useEffect(() => {
  window.addEventListener('keydown', handler)
  // Missing cleanup = listener stays in memory forever
}, [])
```

## The Solution

```javascript
// ✅ GOOD: Proper cleanup
useEffect(() => {
  window.addEventListener('keydown', handler)
  
  return () => {
    window.removeEventListener('keydown', handler)
  }
}, [])
```

## Pattern

```javascript
useEffect(() => {
  // 1. Setup
  const handler = () => { }
  window.addEventListener('event', handler)
  
  // 2. Return cleanup function
  return () => {
    window.removeEventListener('event', handler)
  }
  
  // 3. Dependencies
}, [dependencies])
```

## Implemented in useMenuToggle

✅ Resize listener with cleanup  
✅ Keyboard listener with cleanup  
✅ Proper dependency arrays  
✅ Tests verify cleanup  

---

See [Event Cleanup Guide](../guides/EVENT_CLEANUP_GUIDE.md) for details.
