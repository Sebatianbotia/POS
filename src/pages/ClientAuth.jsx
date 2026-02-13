import React, { useState } from 'react';
import '../styles/ClientAuth.css';
import { useNavigate } from 'react-router-dom';


export default function ClientAuth() {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const USUARIOS_DB = [
    { id: 'admin1', pk: '1234', name: 'Maicol Ortega', rol: 'ADMIN', restaurante: 'la villa'},
    { id: 'admin2', pk: '1234', name: 'Michael Jordan', rol: 'ADMIN', restaurante: 'Agua Clara'},
    { id: 'mesero1', pk: '1234', name: 'daniel bonnet', rol: 'MESERO', restaurante: 'la villa'},
    { id: 'cajero1', pk: '1234', name: 'Adrian botia', rol: 'CAJERO', restaurante: 'la villa'},
    { id: 'gerente1', pk: '1234', name: 'Jesus Vargas', rol: 'GERENTE', restaurante: 'la villa'}
  ];

  const manejarIngreso = (e) => {
    e.preventDefault();
    setError('');

    const clienteEncontrado = USUARIOS_DB.find(
      c => c.id === usuario.toLowerCase().trim()
    );

    if (clienteEncontrado && clienteEncontrado.pk === password.trim()) {
      localStorage.setItem('axon_client_token', 'AUTHORIZED');
      localStorage.setItem('axon_client_name', clienteEncontrado.name);
      localStorage.setItem('axon_restaurant_pk', clienteEncontrado.pk);
      localStorage.setItem('rol', clienteEncontrado.rol);
      localStorage.setItem('restaurante', clienteEncontrado.restaurante);
      localStorage.setItem('userId', clienteEncontrado.id);

      if(clienteEncontrado.rol==="ADMIN"){
        navigate('/admin');
      }
      
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
