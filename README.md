# 🧠 CRANIUM VR — Expedición Anatómica del Cráneo

Juego de realidad virtual (WebXR) para aprender las partes del cráneo humano: 5 checkpoints, quizzes interactivos y certificado final para estudiantes de colegio.

**▶️ Demo en vivo:** [https://ojperdomoc.github.io/VR-Skull_Edu/](https://ojperdomoc.github.io/VR-Skull_Edu/)

## 🚀 Tecnologías

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (build de un solo archivo con `vite-plugin-singlefile`)
- [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/) + [@react-three/drei](https://drei.docs.pmnd.rs/)
- [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://motion.dev/) + [Lucide Icons](https://lucide.dev/)

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm ci

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Typecheck
npx tsc --noEmit

# Build de producción (salida en dist/)
npm run build

# Previsualizar el build
npm run preview
```

## 📦 Despliegue a GitHub Pages

El despliegue es automático: cada push a `main` ejecuta el workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que compila la
app con Vite y publica `dist/` en GitHub Pages.

> **Configuración requerida (una sola vez):** en *Settings → Pages*, la fuente
> debe ser **GitHub Actions** (no "Deploy from a branch").

## 🎮 Uso

- Abre la demo en un navegador compatible con WebXR (o cualquier navegador móvil de moderno).
- En móvil, el botón de **modo VR** pide permisos de movimiento y pantalla completa para estereoscopía con visor tipo Cardboard.
- En escritorio, explora el atlas 3D del cráneo con el ratón y responde los quizzes.
