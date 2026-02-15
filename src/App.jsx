import { useEffect, useState } from 'react'
import './App.css'
import SplashScreen from './pages/SplashScreen'
import ClientAuth from './pages/ClientAuth'
import AdminLayout from './pages/AdminLayout'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Inicializar solo una vez
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
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<ClientAuth />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
