import React, { useState, useEffect } from 'react';
import '../styles/SplashScreen.css';

export default function SplashScreen({ onFinish }) {
  const [fraseActual, setFraseActual] = useState(0);

  const frases = [
    "Sincronizando ingredientes...",
    "Preparando mesas digitales...",
    "Optimizando tu servicio..."
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFraseActual((prev) => (prev + 1) % frases.length);
    }, 1200);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="splash-container">
      
      <div className="splash-content fade-in-up">
        
        <div className="logo-section">
          <div className="logo-box">
            <span className="logo-letter">A</span>
          </div>

          <h1 className="splash-title">AXON POS</h1>
          <h2 className="splash-subtitle">TECHNOLOGY</h2>
        </div>

        <h3 className="splash-slogan">"Innovación que sirve a tu mesa"</h3>

        <div className="loading-section">
          <div className="spinner"></div>
          <p className="loading-text">{frases[fraseActual]}</p>
        </div>
      </div>

      <div className="splash-footer">v1.0.0</div>
    </div>
  );
}
