import React, { useState } from 'react';
import '../../styles/pages/ClientAuth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


export default function ClientAuth() {
  const navigate = useNavigate();
  const { login, personal } = useAuth();
  
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const USUARIOS_DB = [
    { id: 'admin', pk: '1234', name: 'Admin', role: 'admin', restaurante: 'Mi Restaurante'},
    { id: 'mesero1', pk: '1234', name: 'daniel bonnet', role: 'mesero', restaurante: 'Mi Restaurante'},
    { id: 'cajero1', pk: '1234', name: 'Adrian botia', role: 'cajero', restaurante: 'Mi Restaurante'},
  ];

  const manejarIngreso = (e) => {
    e.preventDefault();
    setError('');

    let clienteEncontrado = USUARIOS_DB.find(
      c => c.id === usuario.toLowerCase().trim()
    );

    let isValid = clienteEncontrado && clienteEncontrado.pk === password.trim();

    if (!isValid && personal?.length > 0) {
      clienteEncontrado = personal.find(
        emp => emp.credentials?.usuario === usuario.toLowerCase().trim()
      );
      
      if (clienteEncontrado && clienteEncontrado.credentials?.password === password.trim()) {
        isValid = true;
      }
    }

    if (isValid && clienteEncontrado) {
      login({
        id: clienteEncontrado.id || clienteEncontrado.credentials?.usuario,
        name: clienteEncontrado.name,
        role: clienteEncontrado.role
      });
      
      localStorage.setItem('axon_client_token', 'AUTHORIZED');
      localStorage.setItem('axon_restaurant_pk', clienteEncontrado.pk || '1234');
      localStorage.setItem('restaurante', clienteEncontrado.restaurante || 'Mi Restaurante');
      localStorage.setItem('userId', clienteEncontrado.id || clienteEncontrado.credentials?.usuario);

      navigate('/admin');
      
    } else {
      setError('Credenciales inválidas.');
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-header fade-in-up">
        <h1 className="auth-title">AXON POS</h1>
        <h2 className="auth-subtitle">TECHNOLOGY</h2>
      </div>

      <div className="auth-card">
        <h3 className="auth-card-title">Inicio de sesion</h3>

        <form onSubmit={manejarIngreso} className="auth-form">
          
          <div className="auth-field">
            <label className="auth-label">Usuario</label>
            <input 
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="auth-input"
              placeholder="Ej. Axon Food"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="•••••••••"
            />
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button className="auth-button" type="submit" onClick={manejarIngreso}>
            INGRESAR AL SISTEMA
          </button>

        </form>
      </div>

      <p className="auth-footer">Protected by Axon Security © 2025</p>
    </div>
  );
}
