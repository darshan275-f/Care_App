import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getTokens, clearTokens } from '../config/api';
import api, { handleApiResponse, handleApiError } from '../config/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { accessToken } = await getTokens();
      
      if (accessToken) {
        console.log('Found existing token, checking profile...');
        // Verify token by getting user profile
        const response = await api.get('/auth/profile');
        const user = handleApiResponse(response);
        
        console.log('Profile check successful, user:', user);
        console.log('Linked patients from profile:', user.linkedPatients);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });
      } else {
        console.log('No existing token found');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearTokens();
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = handleApiResponse(response);
      
      console.log('Login successful, user data:', user);
      console.log('Linked patients:', user.linkedPatients);
      
      // Store tokens
      await setTokens(accessToken, refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });
      
      return { success: true, user };
    } catch (error) {
      console.log('Login error:', error);
      const errorInfo = handleApiError(error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorInfo.message },
      });
      return { success: false, error: errorInfo.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await api.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = handleApiResponse(response);
      
      // Store tokens
      await setTokens(accessToken, refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      });
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleApiError(error);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorInfo.message },
      });
      return { success: false, error: errorInfo.message };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and reset state regardless of API call result
      await clearTokens();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = handleApiResponse(response);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: user,
      });
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  const linkPatient = async (patientUsername) => {
    try {
      const response = await api.post('/auth/link-patient', { patientUsername });
      const { user } = handleApiResponse(response);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: user,
      });
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    linkPatient,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to set tokens (imported from api config)
const setTokens = async (accessToken, refreshToken) => {
  const { setTokens: setTokensFromApi } = await import('../config/api');
  return setTokensFromApi(accessToken, refreshToken);
};
