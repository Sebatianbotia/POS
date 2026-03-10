import { useState } from 'react';
import { categoriesService } from '../../../services/api/categoriesService';
import '../styles/CategoryManager.css';

export default function CategoryManager({ categories, setCategories }) {
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) {
            setError('El nombre de la categoría es requerido.');
            return;
        }

        if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            setError('Ya existe una categoría con ese nombre.');
            return;
        }

        setCreating(true);
        setError('');
        try {
            const created = await categoriesService.createCategory(trimmed);
            const newCat = created && created.name
                ? created
                : { id: created?.id || Date.now(), name: trimmed, created_at: new Date().toISOString() };
            setCategories(prev => [...prev.filter(Boolean), newCat]);
            setNewName('');
            setShowForm(false);
        } catch (err) {
            console.error('Error creating category:', err);
            setError(err.message || 'Error al crear la categoría.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="catmgr">
            <div className="catmgr-header">
                <div>
                    <h2 className="catmgr-title">Categorías</h2>
                    <p className="catmgr-subtitle">
                        Organiza los productos de tu menú en categorías.
                    </p>
                </div>
                {!showForm && (
                    <button
                        className="catmgr-add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <span className="plus-icon">+</span> Nueva Categoría
                    </button>
                )}
            </div>

            
            {showForm && (
                <form className="catmgr-form" onSubmit={handleCreate}>
                    <div className="catmgr-form-row">
                        <input
                            className={`catmgr-input ${error ? 'input-error' : ''}`}
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={newName}
                            onChange={(e) => { setNewName(e.target.value); setError(''); }}
                            autoFocus
                            maxLength={50}
                        />
                        <button
                            type="submit"
                            className="catmgr-save-btn"
                            disabled={creating || !newName.trim()}
                        >
                            {creating ? 'Creando...' : 'Crear'}
                        </button>
                        <button
                            type="button"
                            className="catmgr-cancel-btn"
                            onClick={() => { setShowForm(false); setNewName(''); setError(''); }}
                        >
                            Cancelar
                        </button>
                    </div>
                    {error && <p className="catmgr-error">{error}</p>}
                </form>
            )}

            {categories.length === 0 ? (
                <div className="catmgr-empty">
                    <p>No hay categorías registradas.</p>
                    <p className="catmgr-empty-hint">Crea una para empezar a organizar tu menú.</p>
                </div>
            ) : (
                <div className="catmgr-grid">
                    {categories.map((cat) => (
                        <div key={cat.id} className="catmgr-card">
                            <div className="catmgr-card-icon">️</div>
                            <div className="catmgr-card-body">
                                <h4 className="catmgr-card-name">{cat.name}</h4>
                                {cat.created_at && (
                                    <small className="catmgr-card-date">
                                        Creada {new Date(cat.created_at).toLocaleDateString('es-CO')}
                                    </small>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
