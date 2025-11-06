# Testing Setup Guide

This project is configured for both unit testing (Jest) and end-to-end testing (Playwright), but the testing dependencies are not yet installed. Follow the steps below to set up testing.

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm run setup`)

## Installing Testing Dependencies

### Frontend Unit Tests (Jest + React Testing Library)

```bash
cd frontend
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

### Frontend E2E Tests (Playwright)

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install --with-deps
```

### Backend Unit Tests (Jest)

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest
```

## Running Tests

### Frontend Unit Tests

```bash
cd frontend

# Watch mode (development)
npm test

# CI mode with coverage
npm run test:ci
```

### Frontend E2E Tests

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Backend Unit Tests

```bash
cd backend
npm test
```

## Test Structure

### Frontend

- **Unit tests**: `frontend/src/components/__tests__/*.test.tsx`
- **E2E tests**: `frontend/e2e/*.spec.ts`
- **Test utilities**: `frontend/jest.setup.js`

### Backend

- **Unit tests**: `backend/src/**/__tests__/*.test.ts`
- **Integration tests**: `backend/tests/**/*.test.ts`

## Writing Tests

### Unit Test Example

```typescript
// frontend/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
// frontend/e2e/my-feature.spec.ts
import { expect, test } from '@playwright/test';

test('should work correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Configuration Files

- `frontend/jest.config.js` - Jest configuration
- `frontend/jest.setup.js` - Jest setup and mocks
- `frontend/playwright.config.ts` - Playwright configuration

## CI/CD Integration

Tests are automatically run in GitHub Actions CI pipeline when:

- Creating a pull request
- Pushing to main/master branch

To enable tests in CI, uncomment the `tests` job in `.github/workflows/ci.yml` after installing dependencies.

## Coverage Reports

Jest generates coverage reports in `frontend/coverage/` after running `npm run test:ci`.

Playwright generates reports in `frontend/playwright-report/` and `frontend/test-results/`.

## Tips

1. **Mock API calls**: Use `jest.mock()` to mock API responses in unit tests
2. **Test data attributes**: Add `data-testid` attributes to components for easier E2E testing
3. **Isolate tests**: Each test should be independent and not rely on other tests
4. **Use beforeEach/afterEach**: Clean up state between tests
5. **Snapshot tests**: Use sparingly and update when intentional changes occur

## Troubleshooting

### Jest Issues

- Clear cache: `npx jest --clearCache`
- Check setup file: `frontend/jest.setup.js`
- Verify mocks are properly configured

### Playwright Issues

- Update browsers: `npx playwright install`
- Check if dev server is running: `http://localhost:3000`
- View trace: `npx playwright show-trace trace.zip`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
