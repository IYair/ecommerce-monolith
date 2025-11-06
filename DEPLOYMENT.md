# Guía de Deployment con Dokploy

Esta guía te ayudará a configurar el deployment automático usando GitHub Actions, Branch Protection, y Dokploy.

## 🏗️ Arquitectura del CI/CD

```
Developer → Feature Branch → Pull Request
                                  ↓
                          GitHub Actions CI
                          - Lint ✓
                          - Typecheck ✓
                          - Build ✓
                                  ↓
                          Code Review ✓
                                  ↓
                          Merge to main
                                  ↓
                          GitHub Actions
                          - Build Docker Image
                          - Push to GHCR
                                  ↓
                          Dokploy (Auto-detect)
                          - Pull from GHCR
                          - Deploy
```

## ✨ Características

✅ **Branch Protection** - No se puede hacer merge con CI fallando  
✅ **Code Quality** - Lint y typecheck obligatorios  
✅ **Automated Build** - Docker image se construye automáticamente  
✅ **Auto Deploy** - Dokploy despliega al detectar nueva imagen  
✅ **Rollback Fácil** - Desde el dashboard de Dokploy  
✅ **Sin SSH** - Todo automático, sin configuración manual

---

## 📋 Requisitos Previos

1. **Servidor con Dokploy instalado** (VPS, DigitalOcean, AWS, etc.)
2. **Acceso al dashboard de Dokploy**
3. **Cuenta de GitHub con permisos de admin en el repo**

---

## 🚀 Configuración Paso a Paso

### Paso 1: Configurar Branch Protection en GitHub

Ver guía completa en: `.github/BRANCH_PROTECTION.md`

**Resumen rápido:**

1. GitHub Repo → Settings → Branches → Add rule
2. Branch name: `main`
3. Activar:
   - ✅ Require pull request before merging (1 approval)
   - ✅ Require status checks: `quality-checks`
   - ✅ Require branches to be up to date

### Paso 2: Configurar Secretos en GitHub

Ve a: **Repository → Settings → Secrets and variables → Actions**

#### Secretos para Build (REQUERIDOS para build de imagen):

| Secret                               | Descripción       | Ejemplo                     |
| ------------------------------------ | ----------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`                | URL de tu API     | `https://tudominio.com/api` |
| `NEXT_PUBLIC_STRAPI_URL`             | URL de Strapi     | `https://tudominio.com`     |
| `NEXT_PUBLIC_SITE_URL`               | URL del sitio     | `https://tudominio.com`     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...`               |

> **Nota:** Estos secrets se usan durante el build de la imagen Docker para Next.js

### Paso 3: Configurar Dokploy

#### 3.1 Crear Aplicación en Dokploy

1. **Login en Dokploy Dashboard**
2. **Create New Application**
3. **Configuración:**

```yaml
Application Type: Docker
Name: ecommerce-monolith
```

#### 3.2 Configurar Source

**Opción A: Desde GitHub Container Registry (RECOMENDADO)**

```yaml
Source Type: Docker Registry
Registry: ghcr.io
Image: ghcr.io/iyair/ecommerce-monolith
Tag: latest
Auto Deploy: ✅ Enabled
```

**Dokploy hará:**

- Check periódico de GHCR para nueva imagen
- Pull automático cuando detecte cambios
- Deploy automático

**Opción B: Desde GitHub Repository**

```yaml
Source Type: GitHub
Repository: IYair/ecommerce-monolith
Branch: main
Auto Deploy: ✅ Enabled
Build: Dockerfile
```

> **Recomendamos Opción A** porque GitHub Actions ya construye la imagen, evitando duplicar el build.

#### 3.3 Configurar Variables de Entorno en Dokploy

En Dokploy Dashboard → Tu App → Environment Variables:

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=ecommerce_db
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=tu_password_seguro
DATABASE_SSL=false

# Strapi Secrets (genera valores únicos)
STRAPI_ADMIN_JWT_SECRET=tu_admin_jwt_secret
STRAPI_API_TOKEN_SALT=tu_api_token_salt
STRAPI_APP_KEYS=key1,key2,key3,key4
STRAPI_JWT_SECRET=tu_jwt_secret
STRAPI_TRANSFER_TOKEN_SALT=tu_transfer_token_salt

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_API_URL=https://tudominio.com/api
NEXT_PUBLIC_STRAPI_URL=https://tudominio.com
NEXT_PUBLIC_SITE_URL=https://tudominio.com
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

#### 3.4 Configurar Base de Datos

**Opción 1: PostgreSQL en Dokploy**

- Crear PostgreSQL service en Dokploy
- Usar las credenciales generadas

**Opción 2: PostgreSQL Externa**

- Supabase, Railway, Neon, etc.
- Configurar DATABASE\_\* variables

#### 3.5 Configurar Networking

```yaml
Port: 3000
Domain: tudominio.com (opcional)
SSL: ✅ Let's Encrypt (si usas dominio)
```

---

## 🔄 Flujo de Trabajo Diario

### 1. Desarrollo Local

```bash
# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push a GitHub
git push origin feature/nueva-funcionalidad
```

### 2. Pull Request

1. Ve a GitHub → Pull Requests → New Pull Request
2. Base: `main` ← Compare: `feature/nueva-funcionalidad`
3. GitHub Actions ejecuta automáticamente:
   - ✅ Lint
   - ✅ Typecheck
   - ✅ Build

4. Revisa los checks:
   - Si todo pasa ✅ → Listo para merge
   - Si algo falla ❌ → Corrige y push de nuevo

5. Aprueba el PR (como trabajas solo, te auto-apruebas)
6. Merge a `main`

### 3. Deployment Automático

Una vez haces merge:

1. **GitHub Actions automáticamente:**

   ```
   ✓ Build Docker image
   ✓ Push to ghcr.io/iyair/ecommerce-monolith:latest
   ```

2. **Dokploy automáticamente:**

   ```
   ✓ Detecta nueva imagen en GHCR
   ✓ Pull image
   ✓ Deploy
   ```

3. **Monitorea en Dokploy Dashboard:**
   - Logs en tiempo real
   - Métricas de CPU/RAM
   - Estado del deployment

---

## 📊 Monitoring y Logs

### En Dokploy Dashboard

- **Logs**: Ver stdout/stderr de la aplicación
- **Metrics**: CPU, RAM, Network, Disk usage
- **History**: Historial de deployments
- **Rollback**: Volver a versión anterior (un click)

### Comandos útiles desde Dashboard Terminal

```bash
# Ver logs
docker logs -f <container_id>

# Ver procesos
docker ps

# Entrar al contenedor
docker exec -it <container_id> sh

# Ver variables de entorno
docker exec <container_id> env
```

---

## 🔙 Rollback

Si algo sale mal en un deployment:

### Opción 1: Desde Dokploy Dashboard (Recomendado)

1. Ve a tu aplicación en Dokploy
2. Pestaña "Deployments" o "History"
3. Selecciona la versión anterior
4. Click "Rollback" o "Redeploy"

### Opción 2: Revertir commit en Git

```bash
# Ver historial
git log --oneline

# Revertir el último commit
git revert HEAD

# O revertir a commit específico
git revert <commit-hash>

# Push
git push origin main
```

Esto creará un nuevo PR que deshace los cambios, pasando por CI de nuevo.

---

## 🔐 Generar Secrets de Strapi

Si necesitas generar los secrets de Strapi:

```bash
# En tu máquina local
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

O usa este script:

```bash
# Genera todos los secrets necesarios
echo "STRAPI_ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
echo "STRAPI_API_TOKEN_SALT=$(openssl rand -base64 32)"
echo "STRAPI_JWT_SECRET=$(openssl rand -base64 32)"
echo "STRAPI_TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)"
echo "STRAPI_APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

---

## 🌐 Configurar Dominio y SSL

Dokploy puede manejar dominios y SSL automáticamente.

### En Dokploy Dashboard:

1. **Ve a tu aplicación → Settings → Domain**
2. **Agrega tu dominio:**
   ```
   Domain: tudominio.com
   SSL: ✅ Let's Encrypt
   ```
3. **Dokploy automáticamente:**
   - Configura el reverse proxy
   - Obtiene certificado SSL
   - Redirige HTTP → HTTPS

### En tu DNS:

Apunta tu dominio al servidor de Dokploy:

```
Type: A
Name: @
Value: <IP_DE_TU_SERVIDOR>
TTL: 3600
```

Para subdominios:

```
Type: A
Name: app
Value: <IP_DE_TU_SERVIDOR>
TTL: 3600
```

---

## 🐛 Troubleshooting

### CI falla en lint/typecheck

**Solución:**

```bash
# Local, corre los mismos comandos que CI
npm run format:check
cd frontend && npm run lint && npm run typecheck
cd backend && npm run lint && npm run typecheck
```

### Docker build falla

**Causa común:** Secrets no configurados

**Solución:**

1. Ve a GitHub → Settings → Secrets
2. Verifica que existan:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_STRAPI_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Dokploy no detecta nueva imagen

**Soluciones:**

1. **Verifica que la imagen existe:**

   ```bash
   # Ve a GitHub Packages
   https://github.com/IYair/ecommerce-monolith/pkgs/container/ecommerce-monolith
   ```

2. **Trigger manual en Dokploy:**
   - Dashboard → Tu app → Deploy button

3. **Check Dokploy logs:**
   - Ver si hay errores de autenticación con GHCR

### App no inicia en Dokploy

**Checklist:**

1. ✓ Variables de entorno configuradas correctamente
2. ✓ Base de datos accesible
3. ✓ Puerto 3000 expuesto
4. ✓ Health check configurado (opcional)

**Debug:**

```bash
# En Dokploy terminal
docker logs <container_id>

# Ver si el proceso está corriendo
docker exec <container_id> ps aux

# Test de conexión a DB
docker exec <container_id> nc -zv postgres 5432
```

---

## 📚 Referencias

- [Dokploy Documentation](https://docs.dokploy.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Branch Protection](./.github/BRANCH_PROTECTION.md)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## ✅ Checklist de Configuración Completa

### GitHub:

- [ ] Branch Protection configurado en `main`
- [ ] Secrets de build configurados
- [ ] Workflow ejecutándose sin errores
- [ ] GHCR packages siendo publicados

### Dokploy:

- [ ] Aplicación creada
- [ ] Source configurado (GHCR o GitHub)
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL configurada
- [ ] Dominio configurado (opcional)
- [ ] SSL habilitado (opcional)
- [ ] Primera deployment exitoso

### Testing:

- [ ] PR de prueba pasó CI
- [ ] Merge a main triggeró deployment
- [ ] App accesible en URL/dominio
- [ ] Strapi admin accesible en `/admin`
- [ ] Frontend funciona correctamente

---

## 🎉 ¡Listo!

Tu CI/CD está completamente configurado. Ahora:

1. **Desarrolla** en feature branches
2. **Crea PR** cuando esté listo
3. **CI valida** automáticamente
4. **Merge** cuando pase
5. **Dokploy despliega** automáticamente

**No más deployments manuales, no más código roto en producción.** 🚀
