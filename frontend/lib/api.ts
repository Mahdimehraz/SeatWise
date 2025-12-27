import axios, { AxiosError } from 'axios';

const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:3003';
const PAYMENT_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3004';

// Check if error is a network/service unavailable error
export const isServiceUnavailable = (error: any): boolean => {
  if (!error) return false;
  
  // Network errors
  if (error.code === 'ECONNREFUSED' || 
      error.code === 'ERR_NETWORK' || 
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('timeout')) {
    return true;
  }
  
  // No response from server
  if (!error.response && error.request) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.response?.status >= 500) {
    return true;
  }
  
  return false;
};

// Get service unavailable message based on service type
export const getServiceUnavailableMessage = (serviceType: 'user' | 'product' | 'order'): string => {
  switch (serviceType) {
    case 'user':
      return 'متاسفانه فعلا سرویس عضویت / ورود در دسترس نیست در تلاشیم سریع مشکل رو حل کنیم';
    case 'product':
      return 'متاسفانه فعلا سرویس مشاهده فیلم ها در دسترس نیست در تلاشیم سریع مشکلش رو حل کنیم';
    case 'order':
      return 'متاسفانه فعلا سرویس ثبت سفارش در دسترس نیست در تلاشیم سریع مشکلش رو حل کنیم';
    default:
      return 'سرویس در دسترس نیست. لطفاً بعداً تلاش کنید.';
  }
};

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

// Create regular axios instance (for services that don't need auth)
const createAxios = () => {
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
  });
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
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/api/users/register`, data);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('user'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  login: async (mobile: string, password: string) => {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/api/users/login`, {
        mobile,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('user'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      
      // Handle invalid credentials (401)
      if (error.response?.status === 401 || 
          error.response?.data?.error?.toLowerCase().includes('invalid credential') ||
          error.response?.data?.message?.toLowerCase().includes('invalid credential')) {
        const credentialError = new Error('رمز عبور یا شماره موبایل اشتباه است');
        (credentialError as any).isInvalidCredential = true;
        throw credentialError;
      }
      
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const authAxios = createAuthAxios(USER_SERVICE_URL);
      const response = await authAxios.get('/api/users/profile');
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('user'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },
};

// Product Service API
export const productAPI = {
  getAllMovies: async () => {
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/movies`);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('product'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  getMovieById: async (id: number) => {
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/movies/${id}`);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('product'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  getMovieShowtimes: async (movieId: number, dayOfWeek?: number) => {
    try {
      const url = dayOfWeek !== undefined
        ? `${PRODUCT_SERVICE_URL}/api/movies/${movieId}/showtimes?day_of_week=${dayOfWeek}`
        : `${PRODUCT_SERVICE_URL}/api/movies/${movieId}/showtimes`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('product'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },
};

// Order Service API
export const orderAPI = {
  createOrder: async (data: {
    movie_id: number;
    showtime_id: number;
    number_of_tickets: number;
  }) => {
    try {
      const authAxios = createAuthAxios(ORDER_SERVICE_URL);
      const response = await authAxios.post('/api/orders', data);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('order'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  getOrderById: async (id: number) => {
    try {
      const authAxios = createAuthAxios(ORDER_SERVICE_URL);
      const response = await authAxios.get(`/api/orders/${id}`);
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('order'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  getUserOrders: async () => {
    try {
      const authAxios = createAuthAxios(ORDER_SERVICE_URL);
      const response = await authAxios.get('/api/orders/user/my-orders');
      return response.data;
    } catch (error: any) {
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('order'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      throw error;
    }
  },

  processPayment: async (orderId: number, paymentData?: any) => {
    try {
      // First, get order details to get amount
      const authAxios = createAuthAxios(ORDER_SERVICE_URL);
      const orderResponse = await authAxios.get(`/api/orders/${orderId}`);
      const order = orderResponse.data.order;

      // Get user email from profile
      let userEmail = null;
      try {
        const userAuthAxios = createAuthAxios(USER_SERVICE_URL);
        const profileResponse = await userAuthAxios.get('/api/users/profile');
        userEmail = profileResponse.data.user?.email;
      } catch (error) {
        console.error('Error fetching user email:', error);
        // Continue with payment even if email fetch fails
      }

      // Call Payment Service directly
      const axiosInstance = createAxios();
      const paymentResponse = await axiosInstance.post(
        `${PAYMENT_SERVICE_URL}/payments/process`,
        {
          orderId: order.id,
          amount: parseFloat(order.total_amount),
          email: userEmail || `user@example.com`,
        }
      );

      // If payment successful, update order status in Order Service
      if (paymentResponse.data && paymentResponse.data.status === 'PAID') {
        try {
          // Update order status to paid via Order Service
          await authAxios.post(`/api/orders/${orderId}/pay`, {
            payment_method: paymentData?.payment_method || 'credit_card',
            payment_details: paymentData?.payment_details || {},
          });
        } catch (updateError) {
          console.error('Error updating order status:', updateError);
          // Payment was successful but order update failed
          // This is a critical error - payment went through but order wasn't updated
        }
      }

      return {
        payment_status: paymentResponse.data.status === 'PAID' ? 'success' : 'failed',
        transaction_id: paymentResponse.data.paymentId,
        paymentId: paymentResponse.data.paymentId,
        message: paymentResponse.data.message || 'Payment processed',
      };
    } catch (error: any) {
      // Check if it's a payment service unavailable error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
        const paymentError = new Error('سرویس پرداخت در دسترس نیست. لطفاً بعداً تلاش کنید.');
        (paymentError as any).isPaymentServiceUnavailable = true;
        throw paymentError;
      }
      
      // Check if it's a payment failed error
      if (error.response?.status === 400 || error.response?.status >= 500) {
        const paymentError = new Error(error.response?.data?.message || 'پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.');
        (paymentError as any).isPaymentFailed = true;
        throw paymentError;
      }
      
      // Check if service is unavailable
      if (isServiceUnavailable(error)) {
        const customError = new Error(getServiceUnavailableMessage('order'));
        (customError as any).isServiceUnavailable = true;
        throw customError;
      }
      
      // For other errors, throw as is
      throw error;
    }
  },
};

