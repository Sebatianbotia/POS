
import { API_BASE_URL, getAuthHeader, handleApiResponse } from './config.js';

export const ingredientsService = {
  /**
   * Get all ingredients
   * @returns {Promise<Array>}
   */
  async getAllIngredients() {
    const response = await fetch(`${API_BASE_URL}/ingredientes`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data || [];
  },

  /**
   * Get a specific ingredient by I
   * @param {number} id - Ingredient ID
   * @returns {Promise<object>}
   */
  async getIngredientById(id) {
    const response = await fetch(`${API_BASE_URL}/ingredientes/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  /**
   * Create a new ingredient
   * @param {string} name - Ingredient name
   * @param {string} unit_of_measure - Unit of measurement (kg, l, etc.)
   * @param {string} type - Ingredient type (dry, liquid, etc.)
   * @param {number} stock - Initial stock quantity
   * @returns {Promise<object>}
   */
  async createIngredient(name, unit_of_measure, type, stock) {
    const response = await fetch(`${API_BASE_URL}/ingredientes`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ name, unit_of_measure, type, stock })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  /**
   * Update an ingredient
   * @param {number} id - Ingredient ID
   * @param {object} ingredientData - Updated ingredient data
   * @returns {Promise<object>}
   */
  async updateIngredient(id, ingredientData) {
    const response = await fetch(`${API_BASE_URL}/ingredientes/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(ingredientData)
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  /**
   * Record a stock movement (entrada/salida)
   * @param {number} id - Ingredient ID
   * @param {number} cantidad - Quantity
   * @param {string} tipo_movimiento - Type (entrada or salida)
   * @param {string} motivo - Reason for the movement
   * @returns {Promise<object>}
   */
  async updateStock(id, cantidad, tipo_movimiento, motivo) {
    const response = await fetch(`${API_BASE_URL}/ingredientes/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ cantidad, tipo_movimiento, motivo })
    });
    const data = await handleApiResponse(response);
    return data.data;
  },

  async deleteIngredient(id) {
    const response = await fetch(`${API_BASE_URL}/ingredientes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },


  async getInventoryReport() {
    const response = await fetch(`${API_BASE_URL}/ingredientes/report`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    const data = await handleApiResponse(response);
    return data.data;
  },


  async deductInventory(orderItems, menuProducts) {
    try {
      if (!orderItems?.length || !menuProducts?.length) {
        return;
      }

      const deductions = {};

      for (const item of orderItems) {
        const searchId = item.menu_item_id || item.product_id || item.id;
        if (!searchId) continue;

        let recipe = [];
        const product = menuProducts.find(p => String(p.id) === searchId);
        if (product && product.ingredients) {
          if (typeof product.ingredients === 'string') {
            try {
              recipe = JSON.parse(product.ingredients);
            } catch (e) {
              console.error('Failed to parse ingredients string from product cache:', e);
            }
          } else if (Array.isArray(product.ingredients)) {
            recipe = product.ingredients;
          }
        }

        if (!recipe || recipe.length === 0) {
          try {
            const res = await fetch(`${API_BASE_URL}/products/${searchId}/ingredients`, {
              method: 'GET',
              headers: getAuthHeader()
            });
            if (res.ok) {
              const responseData = await handleApiResponse(res);
              recipe = Array.isArray(responseData) ? responseData : (responseData.data || []);
            }
          } catch (err) {
            console.error(`Failed to fetch API recipe for product ID: ${searchId}`, err);
          }
        }

        if (!recipe || recipe.length === 0) {
          continue;
        }

        const qtySold = Number(item.cantidad || item.quantity || item.qty || 1);

        for (const recipeItem of recipe) {
          const ingId = recipeItem.ingredient_id;
          const consumed = Number(recipeItem.quantity) * qtySold;

          if (!deductions[ingId]) {
            deductions[ingId] = 0;
          }
          deductions[ingId] += consumed;
        }
      }

      if (Object.keys(deductions).length === 0) return;

      const deductionPromises = Object.entries(deductions).map(async ([ingId, consumedQty]) => {
        try {
          if (consumedQty <= 0) return;

          await this.updateStock(
            ingId,
            consumedQty,
            'salida',
            'Deducción por venta en Caja/POS'
          );

        } catch (err) {
          console.error(`Error deductInventory at item ${ingId}:`, err);
        }
      });

      await Promise.all(deductionPromises);

    } catch (err) {
      console.error('Core error in deductInventory:', err);
    }
  }
};

export default ingredientsService;
