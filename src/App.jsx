import { useEffect, useState } from 'react'
import './App.css'
import SplashScreen from './pages/splash/SplashScreen'
import ClientAuth from './pages/auth/ClientAuth'
import AdminLayout from './layouts/AdminLayout'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './contexts/ProductContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        setLoading(false);
        setInitialized(true);
      }, 2000); // Reducir a 2 segundos para respuesta más rápida
      
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <ProductProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<ClientAuth />} />
            <Route path="/admin" element={<AdminLayout />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ProductProvider>
  )
}

export default App
