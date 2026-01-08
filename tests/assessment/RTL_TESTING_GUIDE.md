# RTL Integration Testing Guide

## Overview

This guide explains how to test the RTL (React Testing Library) integration tests to ensure they work correctly for candidate assessment scoring.

---

## Test Scenarios

### Scenario 1: Blank Slate (Seed Repo)
**Expected Score: 10/30 points (3/9 tests pass)**

### Scenario 2: Minimal Implementation
**Expected Score: 20-25/30 points (7-8/9 tests pass)**

### Scenario 3: Full Implementation
**Expected Score: 30/30 points (9/9 tests pass)**

### Scenario 4: Broken Implementation
**Expected Score: 10-15/30 points (3-5/9 tests pass)**

---

## Scenario 1: Blank Slate (Current State)

### Current Code
```typescript
// app/insights/page.tsx
export default function InsightsPage() {
  const data: any = {};
  const items: any[] = [];
  const result: any = null;
  const config: any = {};
  return <div>Test</div>;
}
```

### Run Test
```bash
yarn test tests/assessment/completion.test.tsx
```

### Expected Results
```
✅ Locked State Removed (3/3)
  ✅ should not contain lock emoji
  ✅ should not have "Locked" in title
  ✅ should not display placeholder

❌ Data Fetching (0/5)
  ❌ should fetch and render data
  ❌ should display viral_score values
  ❌ should display views values
  ❌ should map multiple items
  ❌ should have data fetching code

❌ High Performers (0/1)
  ❌ should apply different styling

Score: 3/9 tests = ~10/30 points
```

### Verification Checklist
- [ ] Exactly 3 tests pass
- [ ] All 3 passing tests are from "Locked State Removed"
- [ ] All integration tests fail (can't find elements in DOM)
- [ ] AST analysis tests fail (no code patterns found)

### Notes
- **Regex tests removed**: No longer checking for field names via regex (prevented false positives)
- **Integration-first**: All functional tests now verify actual DOM rendering
- **Total reduced**: From 35 points to 30 points after removing regex-based tests

---

## Scenario 2: Minimal Implementation

### Test Code
Create this implementation to test partial scoring:

```typescript
// app/insights/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function InsightsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/insights/performance')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      {data.map((item: any) => (
        <div key={item.id}>
          {item.title} - Score: {item.viral_score} - Views: {item.views}
        </div>
      ))}
    </div>
  );
}
```

### Run Test
```bash
yarn test tests/assessment/completion.test.tsx
```

### Expected Results
```
✅ Locked State Removed (3/3)
✅ Metrics Display (2/2)
  ✅ should reference viral_score
  ✅ should reference views

✅ Data Fetching (4/5)
  ✅ should fetch and render data
  ✅ should display viral_score values
  ✅ should display views values
  ✅ should map multiple items
  ✅ should have data fetching code

❌ High Performers (0/3)
  ❌ should apply different styling (no conditional)
  ❌ should have conditional logic
  ❌ should have conditional code

Score: 9/13 tests = ~24/35 points
```

### Verification Checklist
- [ ] 9-10 tests pass
- [ ] Integration tests pass (data renders)
- [ ] Static tests pass (field names found)
- [ ] High performer tests fail (no conditional styling)

---

## Scenario 3: Full Implementation

### Test Code
Create this implementation to test perfect score:

```typescript
// app/insights/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function InsightsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/insights/performance')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Performance Insights</h1>
      {data.map((item: any) => (
        <div
          key={item.id}
          className={item.viral_score > 80 ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}
        >
          <h3>{item.title}</h3>
          <p>Viral Score: {item.viral_score}</p>
          <p>Views: {item.views}</p>
        </div>
      ))}
    </div>
  );
}
```

### Run Test
```bash
yarn test tests/assessment/completion.test.tsx
```

### Expected Results
```
✅ Locked State Removed (3/3)
✅ Metrics Display (2/2)
✅ Data Fetching (5/5)
✅ High Performers (3/3)
  ✅ should apply different styling
  ✅ should have conditional logic
  ✅ should have conditional code

Score: 13/13 tests = 35/35 points
```

### Verification Checklist
- [ ] All 13 tests pass
- [ ] Integration tests verify DOM rendering
- [ ] Integration tests verify different classes
- [ ] Static tests find all patterns

---

## Scenario 4: Broken Implementation (False Positives)

### Test Code A: Fetch Without setState
```typescript
// app/insights/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function InsightsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // BUG: Fetches but never calls setData
    fetch('/api/insights/performance')
      .then(res => res.json());
    // Missing: .then(setData)
  }, []);

  return (
    <div>
      {data.map((item: any) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Expected Results
```
✅ Locked State Removed (3/3)
❌ Metrics Display (0/2) - fields not in code
✅ Data Fetching (1/5)
  ❌ should fetch and render data (DOM empty)
  ❌ should display viral_score (DOM empty)
  ❌ should display views (DOM empty)
  ❌ should map multiple items (DOM empty)
  ✅ should have data fetching code (AST detects fetch)

❌ High Performers (0/3)

Score: 4/13 tests = ~11/35 points
```

### Verification
- [ ] Integration tests catch the bug (DOM is empty)
- [ ] Static analysis passes (code structure exists)
- [ ] Score is low despite having fetch code

---

### Test Code B: Identical Styling
```typescript
// app/insights/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function InsightsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/insights/performance')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      {data.map((item: any) => (
        <div
          key={item.id}
          // BUG: Both branches have same class
          className={item.viral_score > 80 ? 'bg-gray-100' : 'bg-gray-100'}
        >
          <p>Score: {item.viral_score}</p>
          <p>Views: {item.views}</p>
        </div>
      ))}
    </div>
  );
}
```

### Expected Results
```
✅ Locked State Removed (3/3)
✅ Metrics Display (2/2)
✅ Data Fetching (5/5)
❌ High Performers (2/3)
  ❌ should apply different styling (classes are same)
  ✅ should have conditional logic (comparison exists)
  ✅ should have conditional code (ternary exists)

Score: 12/13 tests = ~33/35 points
```

### Verification
- [ ] Integration test catches identical classes
- [ ] Static tests pass (ternary exists)
- [ ] Loses 2 points for non-functional styling

---

## Testing Workflow

### Step 1: Test Blank Slate
```bash
# Should be on rtyl branch
git status

# Run tests
yarn test tests/assessment/completion.test.tsx

# Verify: 3/13 pass
```

### Step 2: Create Test Branch
```bash
git checkout -b test-rtl-minimal
```

### Step 3: Test Minimal Implementation
```bash
# Copy Scenario 2 code to app/insights/page.tsx
# Run tests
yarn test tests/assessment/completion.test.tsx

# Verify: 9-10/13 pass
```

### Step 4: Test Full Implementation
```bash
# Copy Scenario 3 code to app/insights/page.tsx
# Run tests
yarn test tests/assessment/completion.test.tsx

# Verify: 13/13 pass
```

### Step 5: Test Broken Implementations
```bash
# Test each broken scenario
# Verify integration tests catch bugs
```

### Step 6: Cleanup
```bash
git checkout rtyl
git branch -D test-rtl-minimal
```

---

## Debugging Failed Tests

### Issue: "Unable to find element"
**Cause:** Component not rendering data

**Debug:**
```typescript
// Add console.log in test
const { container } = render(<InsightsPage />);
console.log(container.innerHTML);
```

**Fix:** Ensure component actually fetches and renders data

---

### Issue: "Expected fetch to be called"
**Cause:** Component not calling API

**Debug:**
```typescript
// Check if useEffect runs
console.log('Fetch mock calls:', global.fetch.mock.calls);
```

**Fix:** Ensure useEffect has correct dependencies

---

### Issue: "Expected different classNames"
**Cause:** Conditional styling not working

**Debug:**
```typescript
// Check actual classes
const high = screen.getByText(/High/).closest('[class]');
console.log('High class:', high?.className);
```

**Fix:** Ensure ternary has different values

---

## Success Criteria

### ✅ Tests Pass Correctly
- [ ] Blank slate: 3/13 pass
- [ ] Minimal: 9-10/13 pass
- [ ] Full: 13/13 pass
- [ ] Broken: 4-12/13 pass (catches bugs)

### ✅ Integration Tests Work
- [ ] Render components
- [ ] Mock API responses
- [ ] Query DOM elements
- [ ] Verify styling differences

### ✅ Static Tests Work
- [ ] AST parsing
- [ ] Regex matching
- [ ] File reading

### ✅ Scoring Accurate
- [ ] Points match test results
- [ ] No false positives
- [ ] Catches functional bugs

---

## Next Steps

1. **Test all scenarios** in this guide
2. **Document any issues** found
3. **Update tests** if needed
4. **Verify workflow integration** (GitHub Actions)
5. **Create candidate-facing docs**
