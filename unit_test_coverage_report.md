# BioBeats Unit Test Coverage Report

Generated on: 2026-04-30

Command used:

```bash
npx vitest run --coverage --coverage.reportOnFailure=true --coverage.reporter=text --coverage.reporter=html --coverage.reporter=json-summary
```

## Summary

The Vitest unit coverage report was generated successfully, but the test command exited with failures.

| Metric | Value |
| :--- | :--- |
| Test files | 71 |
| Passed test files | 68 |
| Failed test files | 3 |
| Total tests | 401 |
| Passed tests | 397 |
| Failed tests | 4 |
| Pass rate | 99.00% |

## Coverage Totals

| Coverage type | Covered | Total | Percent |
| :--- | ---: | ---: | ---: |
| Statements | 2,685 | 8,390 | 32.00% |
| Branches | 1,952 | 7,836 | 24.91% |
| Functions | 627 | 2,633 | 23.81% |
| Lines | 2,509 | 7,384 | 33.97% |

## Report Artifacts

| Artifact | Location |
| :--- | :--- |
| HTML coverage report | `coverage/index.html` |
| JSON coverage summary | `coverage/coverage-summary.json` |
| Full console output | `coverage-report.txt` |

## Current Failing Tests

| Test file | Failing test | Failure summary |
| :--- | :--- | :--- |
| `src/features/social-graph/tests/BlockedUsersList.test.tsx` | `BlockedUsersList > 1. renders blocked users list` | `getByText("User One")` matches both the avatar and username text. |
| `src/widgets/user-profile/__tests__/ShareModal.test.tsx` | `Share Modal > copies to clipboard on copy click` | Expected clipboard `writeText` mock was not called. |
| `src/app/(main)/feed/__tests__/FeedPage.test.tsx` | `Feed Page > loads and displays suggested artists` | Could not find `data-testid="feed-artist-suggestions"`. |
| `src/app/(main)/feed/__tests__/FeedPage.test.tsx` | `Feed Page > artist follow button toggles state on click` | Could not find `data-testid="feed-artist-follow-button"`. |

## Notes

- The report uses the existing `vitest.config.ts` coverage settings.
- `src/features/player/tests/**` is excluded by the Vitest config, so those tests are not part of this coverage run.
- The HTML report is available even though the test process returned exit code `1`, because `coverage.reportOnFailure=true` was used.
