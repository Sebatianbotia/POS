import { useEffect, useState } from 'react'
import './App.css'
import SplashScreen from './pages/SplashScreen'
import ClientAuth from './pages/ClientAuth'
import AdminLayout from './pages/AdminLayout'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
  const estaAutorizado = localStorage.getItem('axon_client_token');
  
  if (!estaAutorizado) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
     <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<ClientAuth />} />
        <Route path="/admin" element={<AdminLayout/>}/>
        <Route path="*" element={<Navigate to="/auth" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
