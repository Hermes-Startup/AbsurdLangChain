# Hermes Assessment Test Suite

Automated testing and scoring for the Hermes candidate assessment platform.

## Overview

This test suite evaluates candidate submissions across multiple dimensions:

| Category | Points | What It Tests |
|----------|--------|---------------|
| Build & Types | 15 | Does it compile? TypeScript errors? |
| Core Requirements | 35 | Locked removed, fetching, metrics, highlighting |
| Enhanced Features | 15 | Sorting, loading states, error handling |
| Velocity | 20 | Commit frequency, speed, iteration |
| AI Usage | 20 | From reflection form (manual) |
| **Bonus** | 10 | Gemini integration |

**Total: 115 points** (100 base + 15 bonus)

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:scoring      # Assessment scoring
npm run test:velocity     # Commit analysis
npm run test:api          # API integration
npm run test:components   # Component unit tests
npm run test:reflection   # Reflection scoring

# Run full scoring (scoring + velocity)
npm run score
```

## Test Files

### `tests/assessment-scoring.test.ts`
Main scoring tests that analyze the candidate's `app/insights/page.tsx`:
- Build succeeds
- TypeScript passes
- Locked state removed
- Data fetching implemented
- Metrics displayed
- High performers highlighted
- Sorting implemented
- Loading/error states
- Code quality checks

### `tests/velocity-analysis.test.ts`
Analyzes git commit history:
- First commit timing
- Commit frequency
- Gap analysis
- Iteration evidence

### `tests/api-integration.test.ts`
Tests API endpoints (requires running dev server):
- `/api/insights/performance` returns correct data
- `/api/insights/generate-summary` accepts POST
- `/insights` page renders without locked state

### `tests/components.test.tsx`
Unit tests for UI components:
- Data fetching behavior
- Display logic
- Sorting functionality
- Formatting helpers

### `tests/reflection-scoring.test.ts`
Scores candidate reflection answers for AI usage:
- Used AI appropriately
- Prompts were specific
- Identified AI mistakes
- Could override when needed

## Scoring Rubric

### Build & Types (15 points)
| Criteria | Points |
|----------|--------|
| `npm run build` succeeds | 10 |
| `tsc --noEmit` passes (< 5 errors) | 5 |

### Core Requirements (35 points)
| Criteria | Points |
|----------|--------|
| Locked state (🔒) removed | 5 |
| Data fetching from API | 10 |
| Metrics displayed (title, views, viral_score) | 10 |
| High performers highlighted (score > 80) | 10 |

### Enhanced Features (15 points)
| Criteria | Points |
|----------|--------|
| Sorting by viral_score | 5 |
| Loading state | 5 |
| Error handling | 5 |

### Velocity (20 points)
| Criteria | Points |
|----------|--------|
| First commit < 5 minutes | 5 |
| 3+ commits | 5 |
| No gaps > 10 minutes | 5 |
| Shows iteration (deletions) | 5 |

### AI Usage (20 points) - From Reflection
| Criteria | Points |
|----------|--------|
| Used AI appropriately | 5 |
| Prompts were specific | 5 |
| Identified AI mistakes | 5 |
| Could override when needed | 5 |

### Bonus (10 points)
| Criteria | Points |
|----------|--------|
| Gemini summary integration attempted | 10 |

## GitHub Actions Integration

The `score_assessment.yaml` workflow:
1. Runs on push to main or manual trigger
2. Checks build and TypeScript
3. Analyzes code for completion criteria
4. Analyzes git history for velocity
5. Calculates total score
6. Submits to Supabase (if configured)
7. Creates score artifact

### Manual Trigger

```bash
gh workflow run score_assessment.yaml \
  -f candidate_id=username
```

### Secrets Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key for admin access

## Interpreting Scores

| Score | Interpretation |
|-------|----------------|
| 90-115 | Exceptional - Ready for founding engineer role |
| 70-89 | Strong - Worth intro to YC startups |
| 50-69 | Promising - Might need guidance |
| 30-49 | Developing - Not ready for 0→1 startup |
| < 30 | Not a fit - Needs more experience |

## Adding Custom Tests

To add a new test criteria:

1. Add the test in the appropriate file
2. Update the results collector in `assessment-scoring.test.ts`
3. Update the score calculation
4. Update the GitHub Actions workflow
5. Update this README

## Development

```bash
# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Troubleshooting

### Tests fail to find files
Set `PROJECT_ROOT` environment variable:
```bash
PROJECT_ROOT=/path/to/candidate/repo npm test
```

### API tests skip
Start the dev server first:
```bash
npm run dev
# In another terminal:
npm run test:api
```

### Git history analysis fails
Ensure you have git installed and the repo has commits:
```bash
git log --oneline
```