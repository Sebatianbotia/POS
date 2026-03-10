import '../styles/Sidebar.css';
import { useAuth } from '../../../contexts/AuthContext';

export default function Sidebar({ restaurante, name, onClose, currentSection, onSectionChange, onChangeSede }) {
  const { user, sedes, currentSede } = useAuth();
  const isPropietario = user?.rol === 'PROPIETARIO';
  const isCajero = user?.rol === 'CAJERO';
  const isMesero = user?.rol === 'MESERO';

  const getRolBadge = () => {
    if (isPropietario) return { icon: '', text: 'Propietario' };
    if (isCajero) return { icon: '', text: 'Cajero' };
    return { icon: '', text: 'Mesero' };
  };

  const rolInfo = getRolBadge();

  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <div className="restaurant-icon">️</div>
        <div>
          <h3 className="restaurant-name">{currentSede?.nombre || restaurante}</h3>
          <p className="restaurant-sub">{name}</p>
          <span className={`role-badge role-${user?.rol?.toLowerCase() || 'mesero'}`}>
            {rolInfo.icon} {rolInfo.text}
          </span>
          {isPropietario && sedes.length > 1 && (
            <select
              className="sede-selector"
              value={currentSede?.id || ''}
              onChange={(e) => {
                const selectedSede = sedes.find(s => s.id === parseInt(e.target.value));
                if (selectedSede && onChangeSede) {
                  onChangeSede(selectedSede);
                }
              }}
            >
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${currentSection === 'mesas' ? 'active' : ''}`}
          onClick={() => onSectionChange('mesas')}
        >
          <span className="icon"></span> Mesas
        </button>

        <button
          className={`menu-item ${currentSection === 'pedidos' ? 'active' : ''}`}
          onClick={() => onSectionChange('pedidos')}
        >
          <span className="icon"></span> Pedidos
        </button>

        {(isPropietario || isCajero) && (
          <button
            className={`menu-item ${currentSection === 'menu' ? 'active' : ''}`}
            onClick={() => onSectionChange('menu')}
          >
            <span className="icon"></span> Menú
          </button>
        )}

        {(isPropietario || isCajero) && (
          <button
            className={`menu-item ${currentSection === 'caja' ? 'active' : ''}`}
            onClick={() => onSectionChange('caja')}
          >
            <span className="icon"></span> Caja
          </button>
        )}

        {isPropietario && (
          <>
            <button
              className={`menu-item ${currentSection === 'personal' ? 'active' : ''}`}
              onClick={() => onSectionChange('personal')}
            >
              <span className="icon"></span> Personal
            </button>

            <button
              className={`menu-item ${currentSection === 'ingredientes' ? 'active' : ''}`}
              onClick={() => onSectionChange('ingredientes')}
            >
              <span className="icon"></span> Ingredientes
            </button>

            <button
              className={`menu-item ${currentSection === 'reportes' ? 'active' : ''}`}
              onClick={() => onSectionChange('reportes')}
            >
              <span className="icon"></span> Reportes
            </button>

            <button
              className={`menu-item ${currentSection === 'sedes' ? 'active' : ''}`}
              onClick={() => onSectionChange('sedes')}
            >
              <span className="icon"></span> Sedes
            </button>

            <button
              className={`menu-item ${currentSection === 'terminales' ? 'active' : ''}`}
              onClick={() => onSectionChange('terminales')}
            >
              <span className="icon"></span> Terminales
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-separator"></div>

      <div className="sidebar-footer">
        <button className="menu-item" onClick={onClose}>
          <span className="icon"></span> Cerrar Sesión
        </button>
      </div>

    </aside>
  );
}
