import { useState } from "react";
import "../../styles/component_style/AddTableModal.css";

export default function AddTableModal({ close, onCreate }) {

  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!number.trim() || !capacity.trim()) return;

    const newTable = {
      number,
      capacity: parseInt(capacity)
    };

    onCreate(newTable);
  }

  return (
    <div className="addtable-modal">

      <div className="addtable-box">

        {/* Cerrar */}
        <button className="addtable-close" onClick={close}>✕</button>

        <h2 className="addtable-title">Agregar Mesa</h2>

        <form className="addtable-form" onSubmit={handleSubmit}>
          
          <label className="addtable-label">Número de Mesa</label>
          <input
            className="addtable-input"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Ej. Mesa 14"
            type="text"
          />

          <label className="addtable-label">Capacidad</label>
          <input
            className="addtable-input"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Número de comensales"
            type="number"
            min="1"
          />

          <button className="addtable-submit" type="submit">
            Crear Mesa
          </button>
        </form>

      </div>

    </div>
  );
}
