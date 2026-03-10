import React, { useState } from 'react';
import '../../styles/pages/ClientAuth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/api/authService';


export default function ClientAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const manejarIngreso = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const userData = await login(usuario, password);
      
      
      localStorage.setItem('axon_client_token', 'AUTHORIZED');
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('axon_client_name', userData.nombre);

      navigate('/admin');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
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
            <label className="auth-label">Email o Usuario</label>
            <input 
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="auth-input"
              placeholder="Ej. admin@restaurant.com"
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

          <button 
            className="auth-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'AUTENTICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>

        </form>
      </div>

      <p className="auth-footer">Protected by Axon Security  2025</p>
    </div>
  );
}
