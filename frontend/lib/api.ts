import axios from 'axios';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3003';

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance with auth header
const createAuthAxios = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

// User Service API
export const userAPI = {
  register: async (data: {
    first_name: string;
    last_name: string;
    mobile: string;
    email: string;
    password: string;
  }) => {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/register`, data);
    return response.data;
  },

  login: async (mobile: string, password: string) => {
    const response = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
      mobile,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const authAxios = createAuthAxios(USER_SERVICE_URL);
    const response = await authAxios.get('/api/users/profile');
    return response.data;
  },
};

// Product Service API
export const productAPI = {
  getAllMovies: async () => {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/movies`);
    return response.data;
  },

  getMovieById: async (id: number) => {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/movies/${id}`);
    return response.data;
  },

  getMovieShowtimes: async (movieId: number, dayOfWeek?: number) => {
    const url = dayOfWeek !== undefined
      ? `${PRODUCT_SERVICE_URL}/api/movies/${movieId}/showtimes?day_of_week=${dayOfWeek}`
      : `${PRODUCT_SERVICE_URL}/api/movies/${movieId}/showtimes`;
    const response = await axios.get(url);
    return response.data;
  },
};

// Order Service API
export const orderAPI = {
  createOrder: async (data: {
    movie_id: number;
    showtime_id: number;
    number_of_tickets: number;
  }) => {
    const authAxios = createAuthAxios(ORDER_SERVICE_URL);
    const response = await authAxios.post('/api/orders', data);
    return response.data;
  },

  getOrderById: async (id: number) => {
    const authAxios = createAuthAxios(ORDER_SERVICE_URL);
    const response = await authAxios.get(`/api/orders/${id}`);
    return response.data;
  },

  getUserOrders: async () => {
    const authAxios = createAuthAxios(ORDER_SERVICE_URL);
    const response = await authAxios.get('/api/orders/user/my-orders');
    return response.data;
  },

  processPayment: async (orderId: number, paymentData?: any) => {
    const authAxios = createAuthAxios(ORDER_SERVICE_URL);
    const response = await authAxios.post(`/api/orders/${orderId}/pay`, {
      payment_method: paymentData?.payment_method || 'credit_card',
      payment_details: paymentData?.payment_details || {},
    });
    return response.data;
  },
};

