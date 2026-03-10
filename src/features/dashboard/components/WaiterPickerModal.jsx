import { useEffect, useState } from 'react';
import { usersService } from '../../../services/api/index.js';
import '../styles/WaiterPickerModal.css';


export default function WaiterPickerModal({ onSelect, onCancel }) {
    const [waiters, setWaiters] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [manualMode, setManualMode] = useState(false);
    const [manualId, setManualId] = useState('');
    const [manualName, setManualName] = useState('');

    useEffect(() => {
        usersService.getAllUsers()
            .then(users => {
                const meseros = (users || []).filter(u => u.rol === 'MESERO' && u.activo !== false);
                setWaiters(meseros);
                
                if (meseros.length === 0) setManualMode(false);
            })
            .catch(err => {
                
                if (err.status === 403 || err.message?.includes('403')) {
                    setManualMode(true);
                } else {
                    setError('No se pudo cargar la lista de meseros.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleConfirm = () => {
        if (manualMode) {
            const id = parseInt(manualId, 10);
            if (!id || id <= 0) return;
            onSelect({ id, nombre: manualName || `Mesero #${id}` });
        } else {
            if (!selected) return;
            onSelect(selected);
        }
    };

    const canConfirm = manualMode
        ? (parseInt(manualId, 10) > 0)
        : !!selected;

    return (
        <div className="waiter-picker-overlay" onClick={onCancel}>
            <div className="waiter-picker-modal" onClick={e => e.stopPropagation()}>
                <button className="waiter-picker-close" onClick={onCancel}>✕</button>
                <h3 className="waiter-picker-title">Seleccionar Mesero</h3>
                <p className="waiter-picker-subtitle">Asigna un mesero a esta mesa antes de abrirla.</p>

                {loading && <p className="waiter-picker-loading">Cargando meseros...</p>}
                {error && <p className="waiter-picker-error">{error}</p>}

                {!loading && !error && manualMode && (
                    <div className="waiter-manual-entry">
                        <p className="waiter-manual-note">
                            ️ No tienes permiso para ver la lista de meseros. Ingresa el ID del mesero manualmente.
                        </p>
                        <input
                            className="waiter-manual-input"
                            type="number"
                            min="1"
                            placeholder="ID del mesero"
                            value={manualId}
                            onChange={e => setManualId(e.target.value)}
                        />
                        <input
                            className="waiter-manual-input"
                            type="text"
                            placeholder="Nombre del mesero (opcional)"
                            value={manualName}
                            onChange={e => setManualName(e.target.value)}
                        />
                    </div>
                )}

                {!loading && !error && !manualMode && (
                    <>
                        {waiters.length === 0 ? (
                            <p className="waiter-picker-empty">No hay meseros disponibles. Crea uno primero en Personal.</p>
                        ) : (
                            <ul className="waiter-picker-list">
                                {waiters.map(w => (
                                    <li
                                        key={w.id}
                                        className={'waiter-picker-item' + (selected?.id === w.id ? ' selected' : '')}
                                        onClick={() => setSelected(w)}
                                    >
                                        <span className="waiter-avatar"></span>
                                        <div className="waiter-info">
                                            <strong>{w.nombre}</strong>
                                            <small>{w.email}</small>
                                        </div>
                                        {selected?.id === w.id && <span className="waiter-check">✓</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}

                {!loading && (
                    <div className="waiter-picker-actions">
                        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
                        <button
                            className="btn-primary"
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                        >
                            Asignar y Abrir Mesa
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
