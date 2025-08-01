import axios from 'axios';

// const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Para Android emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // Para iOS simulator
const API_BASE_URL = 'http://192.168.18.59:5000/api'; // Para dispositivo físico

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de Restaurantes
export const restaurantesService = {
  // Obtener todos los restaurantes
  getAll: async () => {
    const response = await api.get('/restaurantes');
    return response.data;
  },

  // Obtener restaurante por ID
  getById: async (id) => {
    const response = await api.get(`/restaurantes/${id}`);
    return response.data;
  },

  // Crear restaurante
  create: async (restauranteData) => {
    const response = await api.post('/restaurantes', restauranteData);
    return response.data;
  },

  // Actualizar restaurante
  update: async (id, restauranteData) => {
    const response = await api.put(`/restaurantes/${id}`, restauranteData);
    return response.data;
  },

  // Eliminar restaurante
  delete: async (id) => {
    const response = await api.delete(`/restaurantes/${id}`);
    return response.data;
  },

  // Filtrar restaurantes
  filter: async (letra, ciudad) => {
    const params = {};
    if (letra) params.letra = letra;
    if (ciudad) params.ciudad = ciudad;
    
    const response = await api.get('/restaurantes/filtrar', { params });
    return response.data;
  },
};

// Servicios de Reservas
export const reservasService = {
  // Obtener todas las reservas
  getAll: async () => {
    const response = await api.get('/reservas');
    return response.data;
  },

  // Obtener solo reservas pendientes
  getPendientes: async () => {
    const response = await api.get('/reservas/pendientes');
    return response.data;
  },

  // Crear reserva
  create: async (reservaData) => {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  },

  // Cancelar reserva
  cancel: async (id) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },

  // Marcar reserva como completada
  marcarCompletada: async (id) => {
    const response = await api.put(`/reservas/${id}/completar`);
    return response.data;
  },

  // Eliminar todas las reservas completadas
  eliminarCompletadas: async () => {
    const response = await api.delete('/reservas/completadas');
    return response.data;
  },

  // Marcar reservas vencidas como completadas
  marcarVencidas: async () => {
    const response = await api.put('/reservas/marcar-vencidas');
    return response.data;
  },

  // Eliminar reservas vencidas
  eliminarVencidas: async () => {
    const response = await api.delete('/reservas/eliminar-vencidas');
    return response.data;
  },

  // Obtener reservas por restaurante
  getByRestaurante: async (restauranteId) => {
    const response = await api.get(`/reservas/restaurante/${restauranteId}`);
    return response.data;
  },
};

export default api; 