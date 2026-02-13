import Sidebar from '../components/Sidebar';
import TablePanel from '../components/TablePanel';
import '../styles/AdminLayout.css';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout() {
    const navigate = useNavigate();
    const restaurante = localStorage.getItem('restaurante')
    const nombre = localStorage.getItem('axon_client_name')
    console.log(restaurante, nombre);

    function closeSesion(){
      localStorage.clear();
      navigate('/auth');
    }

  
  return (
    <div className="admin-layout">
      <Sidebar restaurante= {restaurante} name={nombre} onClose={closeSesion}/>
      <div className="admin-content">
        <TablePanel />
      </div>
    </div>
  );
}
