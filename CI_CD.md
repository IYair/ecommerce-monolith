# CI/CD Pipeline Documentation

This document describes the CI/CD pipeline configuration for the ecommerce monolith application.

## Overview

The project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline** (`.github/workflows/ci.yml`): Validates code quality, runs tests, and builds the application
- **CD Pipeline** (`.github/workflows/deploy.yml`): Builds Docker image and deploys to Dokploy

## CI Pipeline

### Triggers

The CI pipeline runs on:

- Pull requests to `main` or `master` branches
- Pushes to `main` or `master` branches

### Jobs

#### 1. Code Quality & Build

Runs on Node.js 18.x and 20.x in parallel to ensure compatibility.

**Steps:**

1. Checkout code
2. Install dependencies (root, frontend, backend)
3. Check code formatting with Prettier
4. Lint frontend and backend with ESLint
5. Type check TypeScript in both frontend and backend
6. Build Next.js frontend
7. Build Strapi backend

**Environment Variables Required:**

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_SITE_URL`

#### 2. Tests (Placeholder)

Currently commented out. To enable:

1. Install testing dependencies (see [TESTING.md](./TESTING.md))
2. Uncomment the `tests` job in `.github/workflows/ci.yml`

**Will run:**

- Frontend unit tests (Jest)
- Backend unit tests (Jest)
- E2E tests (Playwright)

## CD Pipeline

### Triggers

The CD pipeline runs on:

- Pushes to `main` or `master` branches
- Manual workflow dispatch

### Jobs

#### 1. Build and Push Docker Image

**Steps:**

1. Checkout code
2. Set up Docker Buildx (multi-platform builds)
3. Log in to GitHub Container Registry (GHCR)
4. Extract Docker metadata (tags, labels)
5. Build and push multi-stage Docker image
6. Cache layers for faster builds

**Docker Image Tags:**

- `latest` (for main/master branch)
- `main-<sha>` (commit-specific)
- `main` (branch name)

**Build Arguments:**

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### 2. Deploy to Dokploy Server

**Steps:**

1. SSH into Dokploy server
2. Pull latest Docker image from GHCR
3. Stop old containers with `docker-compose down`
4. Start new containers with `docker-compose up -d`
5. Clean up old images

**Alternative:** Webhook trigger (commented out in workflow)

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Build Secrets

| Secret                               | Description            | Example                      |
| ------------------------------------ | ---------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL`                | Public API URL         | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_STRAPI_URL`             | Public Strapi URL      | `https://yourdomain.com`     |
| `NEXT_PUBLIC_SITE_URL`               | Public site URL        | `https://yourdomain.com`     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...`                |

### Deployment Secrets (Dokploy)

| Secret                 | Description               | Example                                  |
| ---------------------- | ------------------------- | ---------------------------------------- |
| `DOKPLOY_HOST`         | Dokploy server IP/domain  | `192.168.1.100` or `server.example.com`  |
| `DOKPLOY_USERNAME`     | SSH username              | `root` or `deploy`                       |
| `DOKPLOY_SSH_KEY`      | SSH private key           | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOKPLOY_PORT`         | SSH port (optional)       | `22` (default)                           |
| `DOKPLOY_PROJECT_PATH` | Path to project on server | `/home/deploy/ecommerce-monolith`        |

### Alternative: Webhook Deployment

If using Dokploy webhook instead of SSH:

| Secret                | Description         |
| --------------------- | ------------------- |
| `DOKPLOY_WEBHOOK_URL` | Dokploy webhook URL |

To enable webhook deployment:

1. Comment out the "Deploy via SSH" step
2. Uncomment the "Trigger Dokploy Webhook" step
3. Configure `DOKPLOY_WEBHOOK_URL` secret

## Dokploy Setup

### Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04+ or Debian 11+
   - Docker and Docker Compose installed
   - Dokploy installed and running

2. **SSH Access:**
   - SSH key authentication configured
   - User has Docker permissions (`usermod -aG docker $USER`)

### Installation

1. **Install Dokploy** (on your server):

   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```

2. **Access Dokploy Dashboard:**

   ```
   http://your-server-ip:3000
   ```

3. **Create New Project:**
   - Click "New Project"
   - Choose "Docker Compose"
   - Upload your `docker-compose.yml`

### Server Setup

1. **Clone repository on server:**

   ```bash
   cd /home/deploy
   git clone https://github.com/yourusername/ecommerce-monolith.git
   cd ecommerce-monolith
   ```

2. **Create `.env` file:**

   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Configure environment variables:**

   ```env
   # Database
   DATABASE_USERNAME=strapi
   DATABASE_PASSWORD=your_secure_password
   DATABASE_NAME=ecommerce_db

   # Strapi Secrets
   STRAPI_ADMIN_JWT_SECRET=your_secret_here
   STRAPI_API_TOKEN_SALT=your_salt_here
   STRAPI_APP_KEYS=key1,key2,key3,key4
   STRAPI_JWT_SECRET=your_jwt_secret_here
   STRAPI_TRANSFER_TOKEN_SALT=your_transfer_salt_here

   # Stripe
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # URLs
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   NEXT_PUBLIC_STRAPI_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com
   ```

4. **Generate Strapi secrets:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

5. **Set proper permissions:**
   ```bash
   chmod 600 .env
   ```

### SSH Key Setup

1. **Generate SSH key pair** (on your local machine):

   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/dokploy_deploy
   ```

2. **Copy public key to server:**

   ```bash
   ssh-copy-id -i ~/.ssh/dokploy_deploy.pub user@your-server
   ```

3. **Add private key to GitHub Secrets:**
   ```bash
   cat ~/.ssh/dokploy_deploy
   # Copy the entire output and paste into DOKPLOY_SSH_KEY secret
   ```

### Testing Deployment

1. **Manual deployment test:**

   ```bash
   # On server
   cd /home/deploy/ecommerce-monolith
   docker-compose pull
   docker-compose up -d
   ```

2. **Check logs:**

   ```bash
   docker-compose logs -f app
   ```

3. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```

## Nginx Reverse Proxy (Optional)

For production, use Nginx as reverse proxy with SSL:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Logs

### View Application Logs

```bash
docker-compose logs -f app
```

### View Database Logs

```bash
docker-compose logs -f postgres
```

### Monitor Container Health

```bash
docker-compose ps
```

### Disk Usage

```bash
docker system df
```

### Clean Up

```bash
# Remove unused images
docker image prune -f

# Remove unused volumes (careful!)
docker volume prune -f

# Full cleanup
docker system prune -a --volumes -f
```

## Rollback

If deployment fails:

1. **Identify previous working image:**

   ```bash
   docker images | grep ecommerce
   ```

2. **Update docker-compose.yml with specific tag:**

   ```yaml
   services:
     app:
       image: ghcr.io/yourusername/ecommerce-monolith:main-abc123
   ```

3. **Restart containers:**
   ```bash
   docker-compose up -d
   ```

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Test Docker build locally:
   ```bash
   docker build -t test-build .
   ```

### Deployment Fails

1. **Check SSH connection:**

   ```bash
   ssh -i ~/.ssh/dokploy_deploy user@server
   ```

2. **Check Docker registry access:**

   ```bash
   docker login ghcr.io
   docker pull ghcr.io/yourusername/ecommerce-monolith:latest
   ```

3. **Check server disk space:**
   ```bash
   df -h
   ```

### Container Won't Start

1. **Check logs:**

   ```bash
   docker-compose logs app
   ```

2. **Check environment variables:**

   ```bash
   docker-compose config
   ```

3. **Verify database connection:**
   ```bash
   docker-compose exec postgres psql -U strapi -d ecommerce_db
   ```

## Performance Optimization

### Docker Image Optimization

- Multi-stage builds reduce image size
- Layer caching speeds up builds
- `.dockerignore` excludes unnecessary files

### GitHub Actions Optimization

- Matrix builds test multiple Node.js versions
- Cache node_modules between runs
- Docker layer caching with BuildKit

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Rotate secrets regularly** - Update in both GitHub and server
3. **Use SSH keys** - Disable password authentication
4. **Keep Docker updated** - `apt update && apt upgrade docker-ce`
5. **Scan images** - Use `docker scan` or Trivy
6. **Limit SSH access** - Use firewall rules
7. **Enable fail2ban** - Protect against brute force

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Dokploy Documentation](https://dokploy.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
