import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    strictPort: false,
    // No remapear requisitos para evitar conflictos
    fs: {
      strict: true,
    },
  },
  
  // Configuración de compilación para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Configuración de rollup para mejor optimización
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // No generar sourcemaps en producción por seguridad
    sourcemap: false,
  },

  // Base URL para cuando está desplegado en diferentes rutas
  // Cambiar según donde se despliegue (ejs: "/pos/" para subdominio)
  base: '/',
})
