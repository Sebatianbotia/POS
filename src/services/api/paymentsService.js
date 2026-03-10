

import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const paymentsService = {

  async processPayment(orden_id, metodo_pago, monto, propina = 0, detalles_pago = {}, division_id = null, pos_terminal_id = null) {
    const body = {
      orden_id: String(orden_id),
      metodo_pago,
      monto,
      propina,
      detalles_pago
    };
    if (division_id) {
      body.division_id = String(division_id);
    }
    if (pos_terminal_id) {
      body.pos_terminal_id = pos_terminal_id;
    }
    const response = await fetch(`${API_BASE_URL}/pagos`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(body)
    });
    const data = await handleApiResponse(response);
    return data.data;
  },


  async generateInvoice(pago_id) {
    const response = await fetch(`${API_BASE_URL}/pagos/${pago_id}/factura`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  }
};

export default paymentsService;
