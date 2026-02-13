import '../styles/component_style/TableCard.css';

export default function TableCard({ mesa, setSelected}) {

  const {id, number, state, waiter, guests, occupiedMinutes, totalBill, currentOrderId} = mesa
  
  const isBusy = state === "ocupada";
  const isFree = state === "disponible";
  const isDirty = state === "requiere_limpieza";

  function handleClick(){
    if(isDirty){
      alert("mesa sucia");
    }else{

      setSelected(mesa.id);
      console.log("render TableCard", mesa.id, mesa.totalBill, mesa.items?.length);
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
            <li><span className="icon">👤</span> Mesero: {waiter.name}</li>
            <li><span className="icon">👥</span> {guests} Comensales</li>
            <li><span className="icon">⏱️</span> {occupiedMinutes} min</li>
          </ul>

          <div className="table-total">
            ${(Number(mesa.totalBill ?? 0)).toFixed(2)}
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
