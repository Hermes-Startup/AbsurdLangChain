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

## How It Works

All testing and scoring is automated through GitHub Actions. When a candidate pushes their code, the `score_assessment.yaml` workflow automatically:
- Builds the project and checks TypeScript
- Analyzes code for completion criteria
- Evaluates git history for velocity metrics
- Calculates the total score
- Submits results to Supabase

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

## GitHub Actions Workflow

The assessment scoring is fully automated through the `.github/workflows/score_assessment.yaml` workflow.

### Automatic Execution

The workflow runs automatically on:
- Every push to the repository
- Pull request events

### What It Does

1. Checks out the candidate's code
2. Runs `npm run build` to verify the project compiles
3. Runs `tsc --noEmit` to check for TypeScript errors
4. Analyzes the code for completion criteria:
   - Locked state removed
   - Data fetching implemented
   - Metrics displayed correctly
   - High performers highlighted
   - Sorting, loading, and error handling
5. Analyzes git history for velocity metrics
6. Calculates the total score across all categories
7. Submits results to Supabase (if configured)
8. Creates a score artifact for review

### Required Secrets

The workflow requires these repository secrets to be configured:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key for admin access

These are automatically injected when the assessment repository is created.

## Interpreting Scores

| Score | Interpretation |
|-------|----------------|
| 90-115 | Exceptional - Ready for founding engineer role |
| 70-89 | Strong - Worth intro to YC startups |
| 50-69 | Promising - Might need guidance |
| 30-49 | Developing - Not ready for 0→1 startup |
| < 30 | Not a fit - Needs more experience |

## Modifying the Workflow

To customize the scoring criteria or add new checks:

1. Edit `.github/workflows/score_assessment.yaml`
2. Update the scoring logic in the workflow steps
3. Adjust point allocations as needed
4. Update this documentation to reflect changes

## Viewing Results

After the workflow completes:
1. Go to the **Actions** tab in the GitHub repository
2. Click on the latest workflow run
3. View the score summary in the workflow logs
4. Download the score artifact for detailed results
5. Check Supabase for the submitted score data