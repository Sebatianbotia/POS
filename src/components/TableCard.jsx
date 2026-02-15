import '../styles/component_style/TableCard.css';

export default function TableCard({ mesa, setSelected}) {

  const {id, number, state, waiter, guests, occupiedMinutes, totalBill, currentOrderId} = mesa
  
  const isBusy = state === "ocupada";
  const isFree = state === "disponible";
  const isDirty = state === "requiere_limpieza";

  const subtotal = Number(totalBill ?? 0);
  const tax = subtotal * 0.10;
  const totalWithTax = subtotal + tax;

  function handleClick(){
    if(isDirty){
      alert("mesa sucia");
    }else{
      setSelected(mesa.id);
    }
  }

  return (
    <div
      className={
        "table-card " +
        (isBusy ? "status-busy" : "") +
        (isFree ? "status-free" : "") +
        (isDirty ? "status-dirty" : "")
      }
      onClick={handleClick}
    >
      {isBusy && (
        <div className="table-card-content">
          <h3 className="table-title">{number}</h3>

          <ul className="table-info">
            <li><span className="icon">👤</span> Mesero: {waiter?.name ?? "Sin asignar"}</li>
            <li><span className="icon">👥</span> {guests ?? 0} Comensales</li>
            <li><span className="icon">⏱️</span> {occupiedMinutes ?? 0} min</li>
          </ul>

          <div className="table-total">
            ${totalWithTax.toFixed(2)}
          </div>
        </div>
      )}

      {isFree && (
        <div className="table-center">
          <h3 className="table-title">{number}</h3>
          <p className="status-free-text">Disponible</p>
        </div>
      )}

      {isDirty && (
        <div className="table-center">
          <h3 className="table-title">{number}</h3>
          <p className="status-dirty-text">Requiere Limpieza</p>
        </div>
      )}

    </div>
  );
}
