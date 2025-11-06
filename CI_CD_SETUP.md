# CI/CD Pipeline - Ecommerce Monolith

## 📋 Resumen de Cambios

### Problema Identificado

Next.js no podía encontrar TypeScript en runtime para transpilar `next.config.ts` porque estaba en `devDependencies` y se eliminaba en producción con `npm prune --production`.

### Solución Implementada

1. ✅ **Movido TypeScript a `dependencies` en frontend/package.json**
   - Next.js necesita TypeScript en runtime para transpilar `next.config.ts`
   - Esto es la práctica oficial recomendada por Next.js

2. ✅ **Optimizado el Dockerfile**
   - Multi-stage build más eficiente
   - `npm prune --production` ahora mantiene TypeScript
   - Mejor separación de concerns
   - Usa `dumb-init` para proper signal handling
   - Health checks mejorados

3. ✅ **Workflow de CI/CD ya existente y funcional**
   - Valida código antes de merge
   - Build y push automático solo en main
   - Publicación a GitHub Container Registry

---

## 🚀 Flujo de Trabajo

### 1. Desarrollo Local

```bash
# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Desarrollar
# ... hacer cambios ...

# Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. Pull Request

1. **Crear PR en GitHub**
   - Ir a GitHub → Pull Requests → New Pull Request
   - Base: `main` ← Compare: `feature/nueva-funcionalidad`

2. **CI se ejecuta automáticamente:**
   - ✅ Code formatting check
   - ✅ Lint frontend
   - ✅ Lint backend
   - ✅ Type check frontend
   - ✅ Type check backend
   - ✅ Build frontend
   - ✅ Build backend

3. **Si CI pasa ✅:**
   - El PR puede ser mergeado
   - Si CI falla ❌, corregir errores y pushear de nuevo

### 3. Merge a Main

Cuando se mergea el PR a `main`:

1. **CD se ejecuta automáticamente:**
   - ✅ Build de imagen Docker
   - ✅ Push a GitHub Container Registry (ghcr.io)
   - ✅ Tags: `main-{sha}` y `latest`

2. **Dokploy detecta la nueva imagen:**
   - Dokploy auto-detecta la nueva imagen en GHCR
   - Despliega automáticamente la nueva versión

---

## 🔧 Configuración Requerida

### 1. GitHub Repository Settings

#### Branch Protection Rules

`Settings → Branches → Add branch protection rule`

```yaml
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals: 1 (opcional si trabajas solo)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks required:
      - quality-checks

✅ Do not allow bypassing the above settings
❌ Allow force pushes
❌ Allow deletions
```

#### GitHub Actions Variables

`Settings → Secrets and variables → Actions → Variables`

```bash
# Build-time variables (para Next.js build)
NEXT_PUBLIC_API_URL=https://tudominio.com/api
NEXT_PUBLIC_STRAPI_URL=https://tudominio.com
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

#### GitHub Actions Secrets

`Settings → Secrets and variables → Actions → Secrets`

```bash
# Solo secretos sensibles
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. Hacer la imagen de GitHub Container Registry pública

`Packages → ecommerce-monolith → Package settings → Change visibility → Public`

O configurar autenticación en Dokploy con un Personal Access Token.

### 3. Dokploy Configuration

#### Variables de Entorno (Runtime)

Estas NO van en GitHub Actions, van en Dokploy:

```bash
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=ecommerce_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=tu_password_seguro

# Strapi Secrets (genera con: node scripts/generate-secrets.js)
STRAPI_ADMIN_JWT_SECRET=...
STRAPI_API_TOKEN_SALT=...
STRAPI_APP_KEYS=key1,key2,key3,key4
STRAPI_JWT_SECRET=...
STRAPI_TRANSFER_TOKEN_SALT=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Next.js (debe coincidir con build-time)
NEXT_PUBLIC_API_URL=https://tudominio.com/api
NEXT_PUBLIC_STRAPI_URL=https://tudominio.com
NEXT_PUBLIC_SITE_URL=https://tudominio.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### Image Configuration

```yaml
Registry: ghcr.io
Image: ghcr.io/iyair/ecommerce-monolith:latest
Pull Policy: Always
Port: 3000
Health Check: /health
```

---

## 🧪 Testing del Pipeline

### Test Local del Docker Build

```bash
# Build de la imagen
docker build -t ecommerce-test \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api \
  --build-arg NEXT_PUBLIC_STRAPI_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  .

# Ejecutar localmente
docker run -d --name test \
  -p 3000:3000 \
  -e DATABASE_CLIENT=sqlite \
  -e DATABASE_FILENAME=.tmp/test.db \
  -e STRAPI_ADMIN_JWT_SECRET=test-secret-min-16-chars \
  -e STRAPI_API_TOKEN_SALT=test-salt-min-16-chars \
  -e STRAPI_APP_KEYS=key1,key2,key3,key4 \
  -e STRAPI_JWT_SECRET=test-jwt-min-16-chars \
  -e STRAPI_TRANSFER_TOKEN_SALT=test-transfer-min-16-chars \
  ecommerce-test

# Ver logs
docker logs -f test

# Verificar health
curl http://localhost:3000/health

# Cleanup
docker stop test && docker rm test
```

### Test de CI en PR

1. Hacer push a un feature branch
2. Crear PR en GitHub
3. Ver que CI se ejecute en la pestaña "Checks" del PR
4. Verificar que todos los checks pasen ✅

---

## 📊 Monitoreo del Deployment

### Ver el proceso completo:

1. **GitHub Actions:**
   - Repository → Actions → Ver workflows ejecutándose

2. **GitHub Container Registry:**
   - Repository → Packages → Ver imágenes publicadas

3. **Dokploy:**
   - Dashboard → Application → Logs en tiempo real

---

## 🐛 Troubleshooting

### CI falla en el build

```bash
# Verificar localmente
cd frontend
npm ci
npm run build

cd ../backend
npm ci
npm run build
```

### Docker build falla

```bash
# Build con output detallado
docker build --progress=plain --no-cache -t ecommerce-test .
```

### Aplicación no inicia en producción

```bash
# Ver logs de Dokploy
# O en Docker local:
docker logs -f <container-id>

# Verificar que TypeScript esté instalado
docker exec <container-id> ls -la /app/frontend/node_modules/typescript
```

### Health check falla

```bash
# Test manual
curl -v http://localhost:3000/health

# Verificar que todos los servicios estén corriendo
docker exec <container-id> ps aux
```

---

## ✅ Checklist de Implementación

- [x] Mover TypeScript a dependencies en frontend/package.json
- [x] Optimizar Dockerfile con multi-stage build
- [x] Workflow de CI/CD ya existe y funciona
- [ ] Configurar Branch Protection en GitHub
- [ ] Configurar Variables en GitHub Actions
- [ ] Configurar Secrets en GitHub Actions
- [ ] Hacer pública la imagen en GHCR (o configurar auth)
- [ ] Configurar variables de entorno en Dokploy
- [ ] Test local del Docker build
- [ ] Crear un PR de prueba para validar el flujo

---

## 📚 Referencias

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Next.js Config TypeScript](https://nextjs.org/docs/app/api-reference/next-config-js)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
