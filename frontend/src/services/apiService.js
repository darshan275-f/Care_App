import api, { handleApiResponse, handleApiError } from '../config/api';

// Authentication services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  linkPatient: async (patientUsername) => {
    try {
      const response = await api.post('/auth/link-patient', { patientUsername });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Patient services
export const patientService = {
  getDashboard: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/dashboard`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getMedications: async (patientId, date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get(`/patients/${patientId}/medications`, { params });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  markMedicationTaken: async (patientId, medicationId, notes = '', date = null) => {
    try {
      const response = await api.post(`/patients/${patientId}/medications/${medicationId}/taken`, {
        notes,
        date: date || new Date().toISOString(),
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  markMedicationSkipped: async (patientId, medicationId, notes = '', date = null) => {
    try {
      const response = await api.post(`/patients/${patientId}/medications/${medicationId}/skipped`, {
        notes,
        date: date || new Date().toISOString(),
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getTasks: async (patientId, filters = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/tasks`, { params: filters });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  markTaskCompleted: async (patientId, taskId, notes = '') => {
    try {
      const response = await api.post(`/patients/${patientId}/tasks/${taskId}/complete`, { notes });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getJournalEntries: async (patientId, filters = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/journal`, { params: filters });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getGameStats: async (patientId, filters = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/games/stats`, { params: filters });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Medication services
export const medicationService = {
  create: async (medicationData) => {
    try {
      const response = await api.post('/medications', medicationData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getByPatient: async (patientId, isActive = true) => {
    try {
      console.log('Fetching medications for patient:', patientId, 'isActive:', isActive);
      const response = await api.get(`/medications/patient/${patientId}`, {
        params: { isActive }
      });
      console.log('Medication response:', response.data);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      console.log('Medication fetch error:', error);
      return { success: false, error: handleApiError(error) };
    }
  },

  getById: async (medicationId) => {
    try {
      const response = await api.get(`/medications/${medicationId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  update: async (medicationId, updateData) => {
    try {
      const response = await api.put(`/medications/${medicationId}`, updateData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  delete: async (medicationId) => {
    try {
      const response = await api.delete(`/medications/${medicationId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getStats: async (medicationId, days = 30) => {
    try {
      const response = await api.get(`/medications/${medicationId}/stats`, {
        params: { days }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Task services
export const taskService = {
  create: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getByPatient: async (patientId, filters = {}) => {
    try {
      console.log('Fetching tasks for patient:', patientId, 'with filters:', filters);
      const response = await api.get(`/tasks/patient/${patientId}`, { params: filters });
      console.log('Task response:', response.data);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      console.log('Task fetch error:', error);
      return { success: false, error: handleApiError(error) };
    }
  },

  getStats: async (patientId, days = 30) => {
    try {
      const response = await api.get(`/tasks/patient/${patientId}/stats`, {
        params: { days }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  update: async (taskId, updateData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updateData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  delete: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  markCompleted: async (taskId, notes = '') => {
    try {
      const response = await api.post(`/tasks/${taskId}/complete`, { notes });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  markIncomplete: async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/incomplete`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Journal services
export const journalService = {
  create: async (entryData) => {
    try {
      const response = await api.post('/journal', entryData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getByPatient: async (patientId, filters = {}) => {
    try {
      const response = await api.get(`/journal/patient/${patientId}`, { params: filters });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getMoodStats: async (patientId, days = 30) => {
    try {
      const response = await api.get(`/journal/patient/${patientId}/mood-stats`, {
        params: { days }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getById: async (entryId) => {
    try {
      const response = await api.get(`/journal/${entryId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  update: async (entryId, updateData) => {
    try {
      const response = await api.put(`/journal/${entryId}`, updateData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  delete: async (entryId) => {
    try {
      const response = await api.delete(`/journal/${entryId}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  addTag: async (entryId, tag) => {
    try {
      const response = await api.post(`/journal/${entryId}/tags`, { tag });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  removeTag: async (entryId, tag) => {
    try {
      const response = await api.delete(`/journal/${entryId}/tags/${tag}`);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Game services
export const gameService = {
  getTypes: async () => {
    try {
      const response = await api.get('/games/types');
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  saveStats: async (statsData) => {
    try {
      const response = await api.post('/games/stats', statsData);
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getStats: async (patientId, filters = {}) => {
    try {
      const response = await api.get(`/games/patient/${patientId}/stats`, { params: filters });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getAverageScores: async (patientId, days = 30) => {
    try {
      const response = await api.get(`/games/patient/${patientId}/average-scores`, {
        params: { days }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getProgressOverTime: async (patientId, gameType, days = 30) => {
    try {
      const response = await api.get(`/games/patient/${patientId}/progress/${gameType}`, {
        params: { days }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  getLeaderboard: async (gameType, days = 7, limit = 10) => {
    try {
      const response = await api.get(`/games/leaderboard/${gameType}`, {
        params: { days, limit }
      });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Chat services
export const chatService = {
  sendMessage: async (senderId, receiverId, content) => {
    try {
      const response = await api.post('/sendMessage', { senderId, receiverId, content });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
  getMessages: async (user1, user2, limit = 100) => {
    try {
      const response = await api.get('/getMessages', { params: { user1, user2, limit } });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Health data services
export const healthService = {
  getToday: async (userId) => {
    try {
      const response = await api.get('/healthData', { params: { userId } });
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};

// Tips services
export const tipService = {
  getDailyTip: async () => {
    try {
      const response = await api.get('/dailyTip');
      return { success: true, data: handleApiResponse(response) };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },
};