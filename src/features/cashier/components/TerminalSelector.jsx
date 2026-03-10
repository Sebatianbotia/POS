import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { terminalesService } from '../../../services/api/index.js';
import '../styles/TerminalSelector.css';


export default function TerminalSelector({ onTerminalSelected }) {
  const { changeTerminal, currentTerminal, user } = useAuth();
  const [terminals, setTerminals] = useState([]);
  const [selectedTerminalId, setSelectedTerminalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTerminals();
  }, []);

  const loadTerminals = async () => {
    try {
      setLoading(true);
      const data = await terminalesService.getAllTerminals();
      const activeTerminals = (data || []).filter(t => t.activo !== false);
      setTerminals(activeTerminals);

      
      if (activeTerminals.length > 0) {
        setSelectedTerminalId(activeTerminals[0].id);
      }
    } catch (err) {
      console.error('Error loading terminals:', err);
      setError(`Error al cargar terminales: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedTerminalId) {
      setError('Por favor selecciona una terminal');
      return;
    }

    setSubmitting(true);
    try {
      const selected = terminals.find(t => t.id === selectedTerminalId);
      if (!selected) throw new Error('Terminal no válida');

      changeTerminal(selected);

      if (onTerminalSelected) {
        onTerminalSelected(selected);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="terminal-selector-overlay">
        <div className="terminal-selector-modal">
          <p className="loading-text">Cargando terminales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-selector-overlay">
      <div className="terminal-selector-modal">
        <h2 className="terminal-selector-title">Selecciona tu Terminal</h2>
        <p className="terminal-selector-subtitle">
          Asigna este dispositivo a una Terminal POS para continuar
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="terminals-list">
          {terminals.length === 0 ? (
            <p className="no-terminals">No hay terminales disponibles. Contacta al propietario.</p>
          ) : (
            terminals.map(terminal => (
              <div
                key={terminal.id}
                className={`terminal-option ${selectedTerminalId === terminal.id ? 'selected' : ''}`}
                onClick={() => setSelectedTerminalId(terminal.id)}
              >
                <input
                  type="radio"
                  name="terminal"
                  value={terminal.id}
                  checked={selectedTerminalId === terminal.id}
                  onChange={() => setSelectedTerminalId(terminal.id)}
                  className="terminal-radio"
                />
                <div className="terminal-info">
                  <strong className="terminal-name">{terminal.nombre}</strong>
                  <p className="terminal-id">ID: {terminal.id}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="btn-confirm-terminal"
          onClick={handleConfirm}
          disabled={submitting || terminals.length === 0}
        >
          {submitting ? 'Asignando...' : '✓ Confirmar Terminal'}
        </button>

        <p className="help-text">
          Tu empresa ha configurado {terminals.length} terminal{terminals.length !== 1 ? 'es' : ''}
        </p>
      </div>
    </div>
  );
}
