# 💰 Finanzas Suite

> Tu asistente financiero personal para alcanzar la libertad financiera

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Descripción

**Finanzas Suite** es una aplicación web moderna de gestión financiera personal que te permite:
- 📊 Visualizar tu salud financiera en tiempo real
- 💸 Registrar y categorizar ingresos y gastos
- 🎯 Establecer y seguir metas de ahorro
- 📈 Analizar tus hábitos de consumo
- 🌙 Interfaz elegante con modo oscuro/claro

## ✨ Características

### 🏠 Dashboard Interactivo
- **Métricas clave**: Saldo total, ingresos, gastos
- **Gráficos dinámicos**: Tendencias semanales y distribución por categorías
- **Presupuesto de ocio**: Control de gastos de entretenimiento
- **Progreso de metas**: Seguimiento visual de objetivos financieros

### 📝 Gestión de Registros
- ✅ Agregar/eliminar transacciones
- 🔍 Filtros avanzados (categoría, persona, fecha, necesidad)
- 👥 Multi-usuario: registra gastos por persona
- 🏷️ Categorías personalizables (Transporte, Salud, Alimentación, etc.)
- 📌 Niveles de necesidad (Indispensable, Necesario, Capricho, etc.)

### 💰 Presupuestos y Metas
- 🎯 Crear metas de ahorro con seguimiento de progreso
- 📊 Definir presupuestos por categoría
- 🔔 Visualización de cumplimiento de objetivos

### 🎨 Diseño y UX
- 🌓 Modo oscuro/claro
- 📱 Diseño responsive (mobile-first)
- ⚡ Animaciones fluidas con Framer Motion
- 🎨 Gradientes modernos (púrpura/rosa)
- ♿ Accesible (componentes Radix UI)

## 🚀 Tecnologías

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos interactivos
- **Radix UI** - Componentes accesibles
- **React Router** - Navegación (SPA)

### Gestión de Estado
- **Context API** - Estado global (finanzas y tema)
- **localStorage** - Persistencia de datos

## 📦 Instalación

### Requisitos previos
- Node.js 16+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/daniel1743/finanza-suite.git
cd finanza-suite
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Compilar para producción**
```bash
npm run build
```

5. **Vista previa de producción**
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
finanza-suite/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Dashboard.jsx  # Página principal
│   │   ├── Records.jsx    # Gestión de transacciones
│   │   ├── Budgets.jsx    # Presupuestos y metas
│   │   ├── Settings.jsx   # Configuración
│   │   └── ui/            # Componentes reutilizables
│   ├── contexts/          # Context API
│   │   ├── FinanceContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades
│   └── index.css          # Estilos globales
├── public/                # Archivos estáticos
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎯 Uso

### 1️⃣ Agregar una transacción
1. Ve a **Registros**
2. Haz clic en **"Agregar"**
3. Completa el formulario:
   - Tipo (Ingreso/Gasto)
   - Monto
   - Descripción
   - Categoría (puedes crear nuevas con el botón **+**)
   - Persona
   - Nivel de necesidad (opcional)
   - Fecha

### 2️⃣ Crear un presupuesto
1. Ve a **Presupuestos y Metas** → **Presupuestos**
2. Haz clic en **"Nuevo Presupuesto"**
3. Asigna una categoría y monto

### 3️⃣ Definir una meta de ahorro
1. Ve a **Presupuestos y Metas** → **Metas de Ahorro**
2. Haz clic en **"Nueva Meta"**
3. Define nombre, objetivo y fecha límite

### 4️⃣ Filtrar transacciones
En **Registros**, usa:
- 🔍 Búsqueda por descripción
- 🎛️ Filtros avanzados (categoría, persona, necesidad, rango de fechas)

## 🔮 Próximas Funcionalidades

- [ ] Editar transacciones existentes
- [ ] Gestión completa de deudas
- [ ] Exportar datos (CSV, JSON)
- [ ] Gráficos comparativos mes a mes
- [ ] Recordatorios de pagos recurrentes
- [ ] Modo offline (PWA)
- [ ] Backend con autenticación
- [ ] Sincronización en la nube

## 🐛 Problemas Conocidos

- No se pueden editar transacciones (solo agregar/eliminar)
- localStorage tiene límite de ~5-10MB
- Sin validación exhaustiva de inputs

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 👤 Autor

**Daniel**
- GitHub: [@daniel1743](https://github.com/daniel1743)

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) - Sistema de componentes
- [Lucide Icons](https://lucide.dev/) - Iconos
- [Recharts](https://recharts.org/) - Librería de gráficos
- [Framer Motion](https://www.framer.com/motion/) - Animaciones

---

<p align="center">
  Hecho con ❤️ para tu libertad financiera
</p>

<p align="center">
  🤖 Generated with <a href="https://claude.com/claude-code">Claude Code</a>
</p>
