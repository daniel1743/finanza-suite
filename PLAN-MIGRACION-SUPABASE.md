# Plan de Migracion: React + Supabase

> **Documento de referencia para Claude Code**
> Si pierdes contexto, lee este archivo para continuar el trabajo.

---

## Resumen Ejecutivo

**Proyecto**: Migrar app React de finanzas a produccion con Supabase
**Ubicacion**: `C:\Users\Lenovo\Desktop\proyecto finanzas`
**Destino**: Reemplazar `https://financiasuite.com` (actualmente en Vercel)
**Enfoque**: Migracion gradual, trabajo en paralelo

---

## Estado Actual del Proyecto React

### Tecnologias
- React 18 + Vite
- Tailwind CSS
- Radix UI (shadcn/ui)
- Recharts (graficos)
- Framer Motion (animaciones)
- Context API + localStorage

### Funcionalidades Existentes
- [x] Dashboard con metricas
- [x] Registro de gastos/ingresos
- [x] Categorias personalizables
- [x] Multi-usuario (por persona)
- [x] Niveles de necesidad
- [x] Presupuestos por categoria
- [x] Metas de ahorro
- [x] Graficos interactivos
- [x] Modo oscuro/claro
- [x] Responsive (mobile-first)

### Funcionalidades Faltantes (A IMPLEMENTAR)
- [ ] **Landing Page** (SEO, hero, features, pricing)
- [ ] **Autenticacion** (Supabase Auth)
- [ ] **Base de datos** (Supabase PostgreSQL)
- [ ] **Chat IA** (Gemini API)
- [ ] **Sync en tiempo real** (Supabase Realtime)
- [ ] **Edge Functions** (para API segura)

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                   React + Vite + Tailwind                   │
├─────────────────────────────────────────────────────────────┤
│  /                    → Landing Page (SEO)                  │
│  /app                 → Dashboard (auth required)           │
│  /app/records         → Registros de gastos                 │
│  /app/budgets         → Presupuestos y metas                │
│  /app/chat            → Chat con IA (Fin)                   │
│  /login               → Login/Register                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                             │
├─────────────────────────────────────────────────────────────┤
│  Auth        → Email/Password, Google, GitHub               │
│  Database    → PostgreSQL (transactions, users, goals...)   │
│  Realtime    → Sync entre dispositivos                      │
│  Edge Funcs  → API para Gemini (ocultar API key)            │
│  Storage     → Avatares, receipts (futuro)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      GEMINI API                             │
│            (llamado desde Edge Function)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Esquema de Base de Datos (Supabase)

### Tabla: `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `transactions`
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  person TEXT,
  necessity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `budgets`
```sql
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `goals`
```sql
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target DECIMAL(12,2) NOT NULL,
  current DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla: `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Tareas en Paralelo

### TRACK 1: Landing Page
**Archivo principal**: `src/components/LandingPage.jsx`
**Prioridad**: Alta (SEO)

- [ ] Hero section con CTA
- [ ] Features section (iconos + descripcion)
- [ ] Pricing plans (Free, Pro)
- [ ] Testimonials
- [ ] FAQ
- [ ] Footer con links
- [ ] Meta tags SEO (react-helmet)
- [ ] Open Graph images

### TRACK 2: Supabase Setup
**Prioridad**: Alta (infraestructura)

- [ ] Crear proyecto en Supabase
- [ ] Configurar tablas (SQL arriba)
- [ ] Configurar Auth providers
- [ ] Row Level Security (RLS)
- [ ] Crear Edge Function para Gemini

### TRACK 3: Autenticacion
**Archivos**: `src/contexts/AuthContext.jsx`, `src/components/Login.jsx`
**Prioridad**: Alta

- [ ] Instalar @supabase/supabase-js
- [ ] Crear AuthContext
- [ ] Login/Register forms
- [ ] Protected routes
- [ ] Logout functionality
- [ ] Password recovery

### TRACK 4: Chat IA (Gemini)
**Archivos**: `src/components/ChatAI.jsx`, `supabase/functions/gemini/`
**Prioridad**: Media

- [ ] UI del chat (ya existe parcialmente)
- [ ] Edge Function para Gemini API
- [ ] Contexto financiero en prompts
- [ ] Historial de conversaciones
- [ ] Sugerencias personalizadas

### TRACK 5: Migracion de Datos
**Prioridad**: Media

- [ ] Hook para sync localStorage -> Supabase
- [ ] Migracion inicial de datos
- [ ] Realtime subscriptions
- [ ] Offline support (opcional)

---

## Configuracion Requerida

### Variables de Entorno (.env)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GEMINI_API_KEY=AIza... (solo para desarrollo, en prod usar Edge Function)
```

### Dependencias a Instalar
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react  # opcional
```

---

## Credenciales Gemini API

**API Key del usuario** (de la app actual):
- Ubicacion: `firebase-config.js` en app actual
- Variable: `geminiApiKey`

**Uso en Edge Function**:
```typescript
// supabase/functions/gemini/index.ts
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
```

---

## Orden de Implementacion Sugerido

```
Semana 1:
├── Dia 1-2: Setup Supabase + Tablas + Auth basico
├── Dia 3-4: Landing Page completa
└── Dia 5: Integrar Auth en React

Semana 2:
├── Dia 1-2: Migrar FinanceContext a Supabase
├── Dia 3: Chat IA con Edge Function
├── Dia 4: Testing completo
└── Dia 5: Deploy a Vercel + DNS
```

---

## Comandos Utiles

```bash
# Desarrollo
cd "C:\Users\Lenovo\Desktop\proyecto finanzas"
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Supabase CLI (si se instala)
npx supabase init
npx supabase functions serve
npx supabase db push
```

---

## Notas Importantes

1. **SEO**: La app actual tiene URLs indexadas. Mantener `/` para landing, `/app` para dashboard.

2. **Dominio**: `financiasuite.com` - Configurar en Vercel despues del deploy.

3. **Datos existentes**: Los usuarios de la app actual tienen datos en Firebase. Ofrecer opcion de migrar o empezar de cero.

4. **API Key Gemini**: NUNCA exponer en frontend. Siempre usar Edge Function.

5. **RLS Supabase**: Configurar Row Level Security para que usuarios solo vean sus datos.

---

## Archivos Clave a Crear/Modificar

```
src/
├── lib/
│   └── supabase.js          # Cliente Supabase
├── contexts/
│   ├── AuthContext.jsx      # NUEVO - Autenticacion
│   └── FinanceContext.jsx   # MODIFICAR - Usar Supabase
├── components/
│   ├── LandingPage.jsx      # NUEVO - Landing
│   ├── Login.jsx            # NUEVO - Auth UI
│   ├── ChatAI.jsx           # MODIFICAR - Conectar Gemini
│   └── ProtectedRoute.jsx   # NUEVO - Rutas protegidas
└── App.jsx                  # MODIFICAR - Routing

supabase/
└── functions/
    └── gemini/
        └── index.ts         # Edge Function para IA
```

---

## Contacto / Referencias

- **App actual**: `C:\Users\Lenovo\Desktop\proyectos desplegados importante\aplica`
- **Vercel Project**: financiasuite.com
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/

---

**Ultima actualizacion**: 2026-01-21
**Estado**: IMPLEMENTADO

---

## Resumen de Implementacion Completada

### Archivos Creados/Modificados

#### Nuevos Archivos:
1. `src/components/LandingPage.jsx` - Landing page completa con Hero, Features, Pricing, FAQ
2. `src/components/Login.jsx` - Formulario de login/registro/reset con Google OAuth
3. `src/components/ProtectedRoute.jsx` - HOC para rutas protegidas
4. `src/contexts/AuthContext.jsx` - Contexto de autenticacion con Supabase
5. `src/lib/supabase.js` - Cliente Supabase + helpers para DB y Auth
6. `src/lib/gemini.js` - Servicio para Gemini API con contexto financiero
7. `supabase-schema.sql` - Schema completo de base de datos con RLS
8. `public/site.webmanifest` - Manifest PWA
9. `public/robots.txt` - Configuracion SEO
10. `.env` - Variables de entorno (Supabase + Gemini)

#### Archivos Modificados:
1. `src/App.jsx` - Routing con auth, landing, protected routes
2. `src/contexts/FinanceContext.jsx` - Integrado con Supabase + localStorage fallback
3. `src/components/AIChatButton.jsx` - Chat IA con Gemini real
4. `index.html` - SEO completo (meta tags, favicons, JSON-LD)
5. `package.json` - Agregado @supabase/supabase-js

#### Assets Copiados:
- favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png
- apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
- img/ folder con logos

### Proximos Pasos para Deploy:

1. **Ejecutar SQL en Supabase**:
   - Ir a: https://supabase.com/dashboard/project/yrjsgirfugblxzkocsqx/sql
   - Copiar y ejecutar contenido de `supabase-schema.sql`

2. **Configurar Auth en Supabase**:
   - Habilitar Email/Password en Authentication > Providers
   - Configurar Google OAuth si se desea

3. **Build y Deploy**:
   ```bash
   npm run build
   # Subir dist/ a Vercel
   ```

4. **Configurar DNS en Vercel**:
   - Apuntar financiasuite.com al nuevo proyecto

### Credenciales Configuradas:
- Supabase URL: https://yrjsgirfugblxzkocsqx.supabase.co
- Supabase Anon Key: Configurado en .env
- Gemini API Key: Configurado en .env
