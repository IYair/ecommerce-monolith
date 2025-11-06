# Dokploy Deployment Guide

## Problema Resuelto

El problema anterior era que `server.js` solo hacía proxy a servicios que debían estar corriendo, pero en producción dentro del contenedor Docker, esos servicios no se iniciaban automáticamente.

**Solución:** Creamos `start-production.js` que inicia los 3 servicios en orden:

1. Strapi Backend (puerto 1337)
2. Next.js Frontend (puerto 3001)
3. Proxy Server (puerto 3000)

## Opciones de Despliegue en Dokploy

### Opción 1: Build Local en Dokploy (Recomendado para empezar)

Usa el `docker-compose.yml` existente que construye la imagen localmente.

1. **En Dokploy:**
   - Tipo: Docker Compose
   - Archivo: `docker-compose.yml`
   - Build Method: Dockerfile

2. **Variables de Entorno Requeridas:**

```env
# Database
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=tu_password_seguro_aqui
DATABASE_NAME=ecommerce_db

# Strapi Secrets (genera con: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
STRAPI_ADMIN_JWT_SECRET=tu_secret_aqui
STRAPI_API_TOKEN_SALT=tu_salt_aqui
STRAPI_APP_KEYS=key1,key2,key3,key4
STRAPI_JWT_SECRET=tu_jwt_secret_aqui
STRAPI_TRANSFER_TOKEN_SALT=tu_transfer_salt_aqui

# URLs (importante: reemplaza <your-dokploy-domain> con tu dominio real de Dokploy)
NEXT_PUBLIC_API_URL=http://<your-dokploy-domain>.traefik.me/api
NEXT_PUBLIC_STRAPI_URL=http://<your-dokploy-domain>.traefik.me
NEXT_PUBLIC_SITE_URL=http://<your-dokploy-domain>.traefik.me
FRONTEND_URL=http://<your-dokploy-domain>.traefik.me
BACKEND_URL=http://<your-dokploy-domain>.traefik.me

# Stripe
STRIPE_SECRET_KEY=sk_test_... o sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... o pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Deploy:**
   - Dokploy construirá la imagen usando el Dockerfile
   - Iniciará los servicios con `start-production.js`
   - La aplicación estará disponible en tu dominio

### Opción 2: Usar Imagen Preconstruida de GitHub (CI/CD Completo)

Usa `docker-compose.production.yml` que descarga la imagen de GitHub Container Registry.

1. **Configurar GitHub Secrets primero:**

   Ve a tu repositorio → Settings → Secrets and variables → Actions:

```
NEXT_PUBLIC_API_URL=http://<your-dokploy-domain>.traefik.me/api
NEXT_PUBLIC_STRAPI_URL=http://<your-dokploy-domain>.traefik.me
NEXT_PUBLIC_SITE_URL=http://<your-dokploy-domain>.traefik.me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

2. **Push a main para construir la imagen:**

```bash
git add .
git commit -m "chore: update production deployment"
git push origin main
```

Esto activará el CI/CD que:

- Ejecutará tests de calidad
- Construirá la imagen Docker
- La publicará en GitHub Container Registry (ghcr.io)

3. **En Dokploy:**
   - Tipo: Docker Compose
   - Archivo: `docker-compose.production.yml`
   - Agregar variable extra:
     ```
     DOCKER_IMAGE=ghcr.io/tu-usuario/ecommerce-monolith:latest
     ```
   - Agregar las mismas variables de entorno del paso 1

4. **Hacer la imagen pública (una sola vez):**
   - Ve a https://github.com/tu-usuario?tab=packages
   - Selecciona `ecommerce-monolith`
   - Package settings → Change visibility → Public

## Verificación del Despliegue

### 1. Check de Salud

```bash
curl http://<your-dokploy-domain>.traefik.me/health
```

Debe responder:

```json
{
  "status": "healthy",
  "timestamp": "2024-11-06T...",
  "uptime": 123.45
}
```

### 2. Ver Logs en Dokploy

En la interfaz de Dokploy:

- Ve a tu aplicación
- Click en "Logs"
- Deberías ver:

```
🔄 Starting Strapi Backend...
⏳ Waiting for Strapi to be ready (10 seconds)...
🔄 Starting Next.js Frontend...
⏳ Waiting for Next.js to be ready (5 seconds)...
🔄 Starting Proxy Server...

╔═══════════════════════════════════════════════════════════╗
║  ✅ All services started successfully!                    ║
╚═══════════════════════════════════════════════════════════╝
```

### 3. Acceder a la Aplicación

- **Store (Frontend):** http://<your-dokploy-domain>.traefik.me/
- **Admin Panel:** http://<your-dokploy-domain>.traefik.me/admin
- **API:** http://<your-dokploy-domain>.traefik.me/api
- **Health Check:** http://<your-dokploy-domain>.traefik.me/health

## Troubleshooting

### Error: "Strapi backend is not running"

**Causa:** Strapi no se inició correctamente.

**Solución:**

1. Revisa logs en Dokploy
2. Verifica que todas las variables de entorno de Strapi estén configuradas
3. Verifica que la base de datos PostgreSQL esté corriendo y accesible

### Error: "Next.js frontend is not running"

**Causa:** Next.js no se inició correctamente.

**Solución:**

1. Verifica que las variables `NEXT_PUBLIC_*` estén configuradas
2. Revisa logs para errores de build
3. Asegúrate de que las URLs apunten al dominio correcto

### Error 502 Bad Gateway

**Causa:** El health check está fallando o los servicios tardan en iniciar.

**Solución:**

1. El health check espera 60 segundos antes de marcar como unhealthy
2. Espera 1-2 minutos después del deploy
3. Si persiste, revisa logs de los 3 servicios

### Base de Datos No Conecta

**Causa:** Credenciales incorrectas o PostgreSQL no corriendo.

**Solución:**

1. Verifica `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
2. En Dokploy, asegúrate que el servicio `postgres` esté en estado `running`
3. Verifica que el health check de postgres pase

### Builds Muy Lentos

**Causa:** Docker está reconstruyendo todo desde cero.

**Solución:**

1. Usa la Opción 2 (imagen pre-construida)
2. La CI/CD construye la imagen una vez
3. Dokploy solo descarga la imagen lista

## Generar Secretos de Strapi

Ejecuta este comando para generar secretos seguros:

```bash
# Genera un secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Genera 4 app keys
node -e "console.log([1,2,3,4].map(() => require('crypto').randomBytes(16).toString('base64')).join(','))"
```

## Configuración de Dominio Personalizado

Si quieres usar tu propio dominio (ej: `shop.tuempresa.com`):

1. **En Dokploy:**
   - Ve a tu aplicación
   - Configuración → Domains
   - Agrega tu dominio: `shop.tuempresa.com`

2. **En tu proveedor de DNS:**
   - Crea un registro A apuntando a la IP de tu servidor Dokploy
   - O un registro CNAME apuntando a tu dominio Traefik

3. **Actualiza las variables de entorno:**

```env
NEXT_PUBLIC_API_URL=https://shop.tuempresa.com/api
NEXT_PUBLIC_STRAPI_URL=https://shop.tuempresa.com
NEXT_PUBLIC_SITE_URL=https://shop.tuempresa.com
FRONTEND_URL=https://shop.tuempresa.com
BACKEND_URL=https://shop.tuempresa.com
```

4. **Redeploy la aplicación**

## Configuración de SSL/HTTPS

Dokploy con Traefik maneja SSL automáticamente:

1. En Dokploy, habilita "SSL/TLS" en la configuración de tu dominio
2. Traefik solicitará automáticamente certificados Let's Encrypt
3. Espera 1-2 minutos para que se emita el certificado
4. Tu sitio estará disponible en HTTPS

## Monitoreo

### Ver Uso de Recursos

En Dokploy:

- Dashboard → tu aplicación
- Verás CPU, Memoria, y uso de red en tiempo real

### Logs en Tiempo Real

```bash
# Si tienes acceso SSH al servidor
docker logs -f ecommerce-app
```

### Restart Manual

Si necesitas reiniciar:

1. En Dokploy: tu aplicación → Actions → Restart
2. O vía SSH:

```bash
docker-compose restart app
```

## Backup de Base de Datos

### Crear Backup

```bash
docker exec ecommerce-postgres pg_dump -U strapi ecommerce_db > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
docker exec -i ecommerce-postgres psql -U strapi ecommerce_db < backup_20241106.sql
```

## Actualizar la Aplicación

### Con Opción 1 (Build Local):

```bash
git pull origin main
```

Luego en Dokploy: Redeploy

### Con Opción 2 (CI/CD):

```bash
git push origin main
```

El CI/CD construirá la imagen automáticamente.
En Dokploy: Redeploy para descargar la nueva imagen.

## Rollback

Si algo sale mal:

1. **En GitHub:** Ve al historial de releases
2. **Identifica la imagen anterior:**
   - `ghcr.io/tu-usuario/ecommerce-monolith:main-abc123`
3. **Actualiza `DOCKER_IMAGE` en Dokploy** con el tag anterior
4. **Redeploy**

## Recursos

- [Dokploy Docs](https://dokploy.com/docs)
- [Traefik Docs](https://doc.traefik.io/traefik/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
