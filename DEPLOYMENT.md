# 🚀 Guía de Deployment - AXON POS

## Problema: Funciona en local pero falla en producción

Si la aplicación funciona perfectamente en local sin conexión (con `npm run dev`) pero falla cuando se conecta a internet o en un servidor de producción, sigue estas instrucciones:

---

## ✅ Compilar para Producción

```bash
npm run build
```

Esto genera el directorio `dist/` lispe para servir en producción.

---

## 🔧 Configurar el Servidor Web

### **Para Apache (.htaccess)**

Si tu hosting usa Apache, el archivo `.htaccess` ya está en `public/` (se copia al dist/ durante el build).

Asegurate de que:
1. ✅ `mod_rewrite` esté habilitado en Apache
2. ✅ El `.htaccess` esté en la raíz del `dist/` después del build
3. ✅ Los permisos sean correctos (644 para archivos, 755 para directorios)

### **Para Nginx**

Si usas Nginx, configura el virtual host como se muestra en `nginx.conf.example`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Esto es crítico para que React Router funcione.

### **Para Node.js (Express, etc.)**

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing - redirige todas las rutas a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000);
```

---

## 🔍 Problemas Comunes y Soluciones

### **1. Página en blanco o "Cannot GET /admin"**

**Causa:** El servidor no está sirviendo `index.html` para todas las rutas.

**Solución:** Configura correctamente el rewrite de rutas (ver arriba según tu servidor).

### **2. Los archivos CSS/JS no cargan o tienen rutas incorrectas**

**Causa:** El `base` en `vite.config.js` está mal configurado.

**Solución:**
```javascript
// Si está desplegado en una subruta como /pos/:
base: '/pos/',

// Si está en la raíz:
base: '/',
```

### **3. "Carga raro" - Interfaz parcialmente funcional**

**Causa:** React.StrictMode causa doble renderizado, hay race conditions con estado.

**Solución:** Esto ya está corregido en `main.jsx` - StrictMode solo se usa en desarrollo.

### **4. localStorage no funciona correctamente**

**Causa:** Problemas de sincronización entre componentes.

**Solución:** Ya corregido - todos los accesos a localStorage tienen valores por defecto.

---

## 📋 Checklist antes de publishar

- [x] `npm run build` sin errores
- [x] Archivo `dist/index.html` existe
- [x] El servidor web está configurado para SPA routing
- [x] `.htaccess` está en el `public/` para Apache
- [x] Los assets en `dist/assets/` tienen hashes en los nombres
- [x] CORS está configurado correctamente si hay APIs externas
- [x] Los headers de seguridad están establecidos
- [x] Gzip compression está habilitado

---

## 🆘 Si sigue sin funcionar

1. **Verifica la consola del navegador** (F12 > Console) para ver errores
2. **Verifica los logs del servidor** para ver si hay errores 404
3. **Comprueba que index.html se sirve para todas las rutas** (no solo para quel archivo existe)
4. **Revisa la ruta base** - a veces está desplegado en una subruta

---

## 📚 Referencias

- [Vite - Deployment](https://vitejs.dev/guide/static-deploy.html)
- [React Router - Browser Router location](https://reactrouter.com/docs/guides/start-here)
- [Apache - mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
