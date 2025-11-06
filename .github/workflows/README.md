# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the ecommerce monolith project.

## Workflows

### ci.yml - Continuous Integration

**Purpose**: Validate code quality and ensure builds succeed.

**Triggers:**

- Pull requests to `main` or `master`
- Pushes to `main` or `master`

**Jobs:**

1. **quality-checks**: Runs on Node.js 18.x and 20.x
   - Install dependencies
   - Check code formatting (Prettier)
   - Lint frontend and backend (ESLint)
   - Type check TypeScript
   - Build Next.js frontend
   - Build Strapi backend

2. **tests** (commented out): Will run when tests are configured
   - Unit tests (Jest)
   - E2E tests (Playwright)

**Matrix Strategy:**

- Tests on Node.js 18.x and 20.x in parallel

### deploy.yml - Continuous Deployment

**Purpose**: Build Docker image and deploy to production server.

**Triggers:**

- Pushes to `main` or `master`
- Manual workflow dispatch

**Jobs:**

1. **build-and-push**:
   - Build multi-stage Docker image
   - Push to GitHub Container Registry (GHCR)
   - Tag with `latest`, branch name, and commit SHA

2. **deploy-to-dokploy**:
   - SSH into Dokploy server
   - Pull latest Docker image
   - Restart containers with docker-compose
   - Clean up old images

**Required Secrets:**

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `DOKPLOY_HOST`
- `DOKPLOY_USERNAME`
- `DOKPLOY_SSH_KEY`
- `DOKPLOY_PROJECT_PATH`

## Setup

See [CI_CD.md](../../CI_CD.md) for detailed setup instructions.

## Monitoring

View workflow runs at: `https://github.com/{owner}/{repo}/actions`

## Debugging

1. Check workflow logs in GitHub Actions tab
2. Re-run failed jobs
3. Enable debug logging by setting `ACTIONS_STEP_DEBUG=true` secret
