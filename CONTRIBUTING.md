# Contributing to Ecommerce Monolith

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or use SQLite for development)
- Git

### Initial Setup

1. **Clone the repository:**

```bash
git clone <your-repo-url>
cd ecommerce-monolith
```

2. **Install dependencies:**

```bash
npm run setup
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers:**

```bash
npm run dev
```

## Code Quality Standards

This project uses several tools to maintain code quality and consistency:

### Automatic Code Formatting (Prettier)

All code is automatically formatted using Prettier with the following configuration:

- **Indentation:** 2 spaces
- **Quotes:** Single quotes
- **Trailing commas:** ES5 style
- **Line width:** 100 characters
- **Import sorting:** Automatic (React → Next.js → Third-party → Internal → Relative)

**Format your code:**

```bash
npm run format                 # Format all files
npm run format:check           # Check formatting without changes
```

### Linting (ESLint)

ESLint is configured for both frontend and backend with the following rules:

- **Import ordering:** Enforced with groups and alphabetization
- **Unused imports:** Automatically removed
- **File size limit:** Warning at 500 lines
- **TypeScript:** Full type safety enabled
- **Best practices:** no-console warnings, prefer-const, no-var

**Run linting:**

```bash
npm run lint                   # Lint all projects
npm run lint:frontend          # Frontend only
npm run lint:backend           # Backend only
```

**Auto-fix issues:**

```bash
cd frontend && npm run lint:fix
cd backend && npm run lint:fix
```

### Type Checking (TypeScript)

All TypeScript code must pass type checking:

```bash
npm run typecheck              # Check all projects
npm run typecheck:frontend     # Frontend only
npm run typecheck:backend      # Backend only
```

### Pre-commit Hooks

**Git hooks are automatically set up** using Husky and lint-staged. Before each commit:

1. ✅ Prettier formats staged files
2. ✅ ESLint checks and auto-fixes staged files
3. ✅ TypeScript type checks frontend files

If any check fails, the commit is blocked.

### Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

**Format:** `type(scope): subject`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)
- `revert`: Revert previous commit

**Examples:**

```bash
feat(cart): add quantity selector
fix(api): handle null product images
docs(readme): update installation steps
refactor(theme): simplify color system
```

**Rules:**

- Type must be lowercase
- Subject must not end with a period
- Max length: 100 characters
- Body and footer are optional

## Development Workflow

### Making Changes

1. **Create a new branch:**

```bash
git checkout -b feat/your-feature-name
```

2. **Make your changes following our patterns:**
   - Use TypeScript strict mode
   - Apply theme colors via CSS variables
   - Add 'use client' directive when needed
   - Follow component patterns (see CLAUDE.md)

3. **Test your changes:**

```bash
npm run dev                    # Start development servers
npm run validate               # Run all quality checks
```

4. **Commit your changes:**

```bash
git add .
git commit -m "feat(scope): your change description"
# Pre-commit hooks run automatically
```

5. **Push and create a pull request:**

```bash
git push origin feat/your-feature-name
```

## Project-Specific Guidelines

### Frontend (Next.js)

#### Component Creation

- Place components in `/frontend/src/components/`
- UI primitives go in `/frontend/src/components/ui/`
- Use 'use client' for hooks, events, and browser APIs
- Apply theme colors with inline styles:
  ```typescript
  style={{ color: 'rgb(var(--color-primary))' }}
  ```

#### Import Order

Imports are automatically sorted by Prettier in this order:

1. React/Next.js
2. Third-party libraries
3. Internal imports (`@/`)
4. Relative imports
5. Styles

#### State Management

- **Server state:** React Query with `useQuery`
- **Client state:** Zustand with localStorage
- **Theme state:** Context API via ThemeProvider

### Backend (Strapi)

#### Content Types

- Create in `/backend/src/api/<name>/content-types/`
- Update `/shared/types/index.ts` with TypeScript interfaces
- Enable public permissions in Strapi admin

#### API Endpoints

- Custom routes go in `/backend/src/api/<content-type>/routes/`
- Controllers in `/backend/src/api/<content-type>/controllers/`
- Services in `/backend/src/api/<content-type>/services/`

### Shared Types

All shared types between frontend and backend go in `/shared/types/index.ts`:

```typescript
export interface Product {
  id: number;
  name: string;
  // ... other fields
}
```

## Bundle Analysis

To analyze the frontend bundle size:

```bash
cd frontend
npm run analyze
```

This generates an HTML report showing bundle composition.

## Testing

Before submitting a pull request:

```bash
npm run validate               # Run all checks
```

This runs:

1. Prettier format check
2. ESLint on frontend and backend
3. TypeScript type checking on both projects

## Pull Request Process

1. **Ensure all checks pass:**
   - Pre-commit hooks passed
   - `npm run validate` passes
   - No console errors in development
   - Changes tested manually

2. **Update documentation:**
   - Update README.md if adding features
   - Update CLAUDE.md for architectural changes
   - Add comments for complex logic

3. **Create descriptive PR:**
   - Title follows commit convention
   - Description explains what and why
   - Screenshots for UI changes
   - Link related issues

4. **Code review:**
   - Address reviewer feedback
   - Keep commits clean and logical
   - Squash if necessary before merge

## Code Style Guidelines

### TypeScript

- ✅ Use strict mode
- ✅ Define explicit return types for functions
- ✅ Use `interface` for object shapes
- ✅ Use `type` for unions and complex types
- ✅ Avoid `any` - use `unknown` if necessary

### React

- ✅ Use functional components
- ✅ Use hooks (useState, useEffect, etc.)
- ✅ Prefer composition over inheritance
- ✅ Keep components small (<500 lines)
- ✅ Extract reusable logic into custom hooks

### Styling

- ✅ Use Tailwind CSS for layout
- ✅ Use CSS variables for theme colors
- ✅ Use inline styles for dynamic values
- ✅ Follow mobile-first approach

### Naming Conventions

- **Components:** PascalCase (`ProductCard.tsx`)
- **Files:** camelCase (`utils.ts`)
- **Functions:** camelCase (`formatPrice()`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`)
- **CSS Variables:** kebab-case (`--color-primary`)

## Getting Help

- 📖 Check [CLAUDE.md](./CLAUDE.md) for architecture details
- 📖 Read [README.md](./README.md) for setup instructions
- 🐛 Open an issue for bugs
- 💡 Start a discussion for feature ideas

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
