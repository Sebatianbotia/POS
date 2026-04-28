import '../styles/TableCard.css';

export default function TableCard({ mesa, setSelected, updateMesaState }) {

  const { id, number, state, waiter, guests, occupiedMinutes, totalBill } = mesa;

  const isBusy = state === 'OCUPADA';
  const isFree = state === 'LIBRE';
  const isReserved = state === 'RESERVADA';

  const subtotal = Number(totalBill ?? 0) || 0;
  const tax = 0;
  const totalWithTax = subtotal + tax;

  const handleClick = () => {
    setSelected(mesa.id);
  };

  return (
    <div
      className={
        'table-card ' +
        (isBusy ? 'status-busy' : '') +
        (isFree ? 'status-free' : '') +
        (isReserved ? 'status-reserved' : '')
      }
      onClick={handleClick}
    >
      {isBusy && (
        <div className="table-card-content">
          <h3 className="table-title">{number}</h3>

          <ul className="table-info">
            <li><span className="icon"></span> Mesero: {waiter?.name ?? 'Sin asignar'}</li>
            <li><span className="icon"></span> {guests ?? 0} Comensales</li>
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

      {isReserved && (
        <div className="table-card-content">
          <h3 className="table-title">{number}</h3>

          <ul className="table-info">
            <li><span className="icon"></span> Mesero: {waiter?.name ?? 'Sin asignar'}</li>
            <li><span className="icon"></span> {guests ?? 0} Comensales</li>
          </ul>

          <p className="status-reserved-text">Reservada</p>
        </div>
      )}

      {!isBusy && !isFree && !isReserved && (
        <div className="table-center">
          <h3 className="table-title">{number}</h3>
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>{state || 'Sin estado'}</p>
        </div>
      )}

    </div>
  );
}
