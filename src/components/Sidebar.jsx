import '../styles/component_style/Sidebar.css';

export default function Sidebar({restaurante, name, onClose}) {

  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <div className="restaurant-icon">🍽️</div>
        <div>
          <h3 className="restaurant-name">{restaurante}</h3>
          <p className="restaurant-sub">{name}</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button className="menu-item active">
          <span className="icon">📋</span> Mesas
        </button>

        <button className="menu-item">
          <span className="icon">🛒</span> Pedidos
        </button>

        <button className="menu-item">
          <span className="icon">📖</span> Menú
        </button>

        <button className="menu-item">
          <span className="icon">💵</span> Caja
        </button>

        <button className="menu-item">
          <span className="icon">📊</span> Reportes
        </button>

        <button className="menu-item">
          <span className="icon">⚙️</span> Configuración
        </button>
      </nav>

      <div className="sidebar-separator"></div>

      <div className="sidebar-footer">
        <button className="menu-item">
          <span className="icon">👤</span> Perfil
        </button>

        <button className="menu-item" onClick={onClose}>
          <span className="icon">🚪</span> Cerrar Sesión
        </button>
      </div>

    </aside>
  );
}
