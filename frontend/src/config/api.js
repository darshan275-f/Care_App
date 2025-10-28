import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_URL = 'http://10.100.235.52:5000'; // Use IP address for network access
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 10000;

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update task due date
export const updateTaskDueDate = async (userId, taskId, newDueDate) => {
  try {
    const response = await api.put(`/tasks/${taskId}/due-date`, {
      userId,
      dueDate: newDueDate, // send a proper Date string or ISO format
    });
    return response.data; // { success: true, data: { ... } } or error object
  } catch (error) {
    console.error('Error updating task due date:', error);
    return { success: false, error: handleApiError(error) };
  }
};


// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Store new tokens
          await AsyncStorage.setItem(TOKEN_KEY, accessToken);
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await clearTokens();
        // You might want to dispatch a logout action here
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const setTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const getTokens = async () => {
  try {
    const accessToken = await AsyncStorage.getItem(TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
};

export const clearTokens = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// API response handler
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'API request failed');
  }
};

// API error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Server error occurred';
    return { message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { message: 'Network error - please check your connection', status: 0 };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred', status: 0 };
  }
};

export default api;
