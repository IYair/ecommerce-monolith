# Configuración de Branch Protection

Esta guía te ayudará a configurar las reglas de protección de ramas para garantizar que solo código de calidad llegue a producción.

## 🎯 Objetivo

Asegurar que:

- ✅ Todo código pase por Pull Requests
- ✅ CI debe pasar antes de merge (lint, typecheck, build)
- ✅ Code review requerido
- ✅ Solo código validado se despliega a producción

## 📋 Configuración en GitHub

### 1. Ve a la configuración de Branch Protection

```
Tu Repositorio → Settings → Branches → Add branch protection rule
```

### 2. Configura la regla para `main`

**Branch name pattern:**

```
main
```

### 3. Activa estas opciones:

#### ✅ Require a pull request before merging

- [x] **Require a pull request before merging**
  - **Required number of approvals before merging:** `1`
  - [x] **Dismiss stale pull request approvals when new commits are pushed**
  - [ ] Require review from Code Owners (opcional si usas CODEOWNERS)

> **Nota:** Como trabajas solo, puedes aprobar tus propios PRs o poner 0 approvals si prefieres

#### ✅ Require status checks to pass before merging

- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**

**Status checks que deben pasar:**

- `quality-checks` - Lint, typecheck, build de frontend y backend

> **Importante:** Estos checks aparecerán después del primer PR. Si no aparecen, haz un PR de prueba y luego configura la protección.

#### ✅ Otras configuraciones recomendadas

- [x] **Require conversation resolution before merging** (todos los comentarios resueltos)
- [ ] Require signed commits (opcional, más seguridad)
- [x] **Require linear history** (evita merge commits, solo fast-forward)
- [ ] Require deployments to succeed (no necesario con Dokploy)

#### ⚠️ Reglas para administradores

- [ ] **Do not allow bypassing the above settings**

> **Nota:** Si trabajas solo y quieres poder hacer push directo en emergencias, déjalo desmarcado. En equipos, márcalo.

### 4. Guarda la configuración

Click en **Create** o **Save changes**

---

## 🔄 Flujo de Trabajo con Branch Protection

### Crear un nuevo feature/fix:

```bash
# 1. Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push a GitHub
git push origin feature/nueva-funcionalidad
```

### Crear Pull Request:

1. Ve a GitHub → Pull Requests → New Pull Request
2. Base: `main` ← Compare: `feature/nueva-funcionalidad`
3. Completa el título y descripción
4. Click en **Create Pull Request**

### CI Automático:

GitHub Actions automáticamente ejecutará:

```
✓ Instalación de dependencias
✓ Lint de código (frontend y backend)
✓ Type checking (TypeScript)
✓ Build de aplicación
```

### Estados posibles:

#### ✅ Todo pasó - Listo para merge

```
✓ quality-checks — All checks have passed
✓ Branch is up to date with base branch
✓ 1 approval required (tú te apruebas)
```

**Puedes hacer merge:**

- Merge pull request
- Squash and merge (recomendado)
- Rebase and merge

#### ❌ Algo falló - Bloqueado

```
✗ quality-checks — Lint errors found
× Merge blocked - Fix issues and push again
```

**Acciones:**

1. Revisa los logs del CI
2. Corrige los errores localmente
3. Commit y push nuevamente
4. CI se ejecuta automáticamente de nuevo

---

## 🚀 Deployment Automático

Una vez que el PR se hace merge a `main`:

1. **GitHub Actions:**
   - Construye imagen Docker
   - Publica a GitHub Container Registry (GHCR)
2. **Dokploy:**
   - Detecta nueva imagen en GHCR
   - Despliega automáticamente
   - Logs disponibles en dashboard

---

## 📊 Monitoreo

### Ver estado de CI en PR:

- En el PR, sección "Checks"
- Click en "Details" para ver logs completos

### Ver deployment en Dokploy:

- Abre tu Dokploy dashboard
- Ve a tu proyecto/aplicación
- Revisa logs y métricas

---

## 🔧 Troubleshooting

### "Status checks are required but no status checks have been found"

**Causa:** GitHub no ha visto el workflow ejecutarse aún.

**Solución:**

1. Crea un PR de prueba
2. Deja que el CI se ejecute
3. Vuelve a Branch Protection settings
4. Ahora verás `quality-checks` disponible para seleccionar

### "You can't merge yet - 1 approval required"

**Solución (trabajo solo):**

- Ve a "Files changed"
- Click en "Review changes"
- Selecciona "Approve"
- Click "Submit review"

O cambia la configuración a `0` approvals requeridos.

### CI falla pero no sé por qué

**Solución:**

1. En el PR, ve a "Checks"
2. Click en "quality-checks"
3. Expande los pasos para ver el error
4. Común:
   - `npm run lint` → Errores de ESLint
   - `npm run typecheck` → Errores de TypeScript
   - `npm run build` → Errores de compilación

### Quiero hacer push directo en emergencia

**Opción 1:** Deshabilita temporalmente la regla

- Settings → Branches → Edit rule
- Desactiva temporalmente
- Push directo
- Reactiva la regla

**Opción 2:** Marca "Allow force pushes" para admins

- Solo para emergencias
- No recomendado en equipos

---

## 🎓 Mejores Prácticas

### Nombres de ramas:

```bash
feature/descripcion-corta    # Nueva funcionalidad
fix/descripcion-del-bug      # Corrección de bug
hotfix/critico              # Fix urgente en producción
refactor/mejora             # Refactorización
docs/actualizacion          # Documentación
```

### Commits:

```bash
feat: agregar pago con Stripe
fix: resolver error de login
docs: actualizar README
refactor: optimizar queries
style: formatear código
test: agregar tests de checkout
```

### Pull Requests:

- **Título claro:** Describe qué hace el PR
- **Descripción:** Por qué es necesario, qué cambia
- **Screenshots:** Si hay cambios visuales
- **Testing:** Cómo probaste los cambios

### Code Review (auto-revisión):

Antes de aprobar tu propio PR, pregúntate:

- ✓ ¿CI pasó sin errores?
- ✓ ¿El código sigue las convenciones?
- ✓ ¿Probé manualmente los cambios?
- ✓ ¿La documentación está actualizada?
- ✓ ¿Hay código comentado o console.logs?

---

## 📚 Referencias

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Conventional Commits](https://www.conventionalcommits.org/)
