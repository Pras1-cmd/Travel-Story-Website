import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const VIEWER_ID_STORAGE_KEY = 'storyViewVisitorId';

const getViewVisitorId = () => {
  let visitorId = localStorage.getItem(VIEWER_ID_STORAGE_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VIEWER_ID_STORAGE_KEY, visitorId);
  }
  return visitorId;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Also clear auth context state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  requestVerification: () => api.post('/auth/verify-email'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// User API
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/profile'),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.post(`/users/${id}/unfollow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`)
};

// Story API
export const storyAPI = {
  getStories: (params) => api.get('/stories', { params }),
  getStory: (id) => api.get(`/stories/${id}`),
  countView: (id) => api.post(`/stories/${id}/view`, { visitorId: getViewVisitorId() }),
  createStory: (data) => api.post('/stories', data),
  updateStory: (id, data) => api.put(`/stories/${id}`, data),
  deleteStory: (id) => api.delete(`/stories/${id}`),
  toggleLike: (id) => api.post(`/stories/${id}/like`),
  getTrending: (params) => api.get('/stories/trending', { params }),
  toggleBookmark: (id) => api.post(`/stories/${id}/bookmark`),
  getBookmarkedStories: () => api.get('/stories/bookmarked')
};

// Comment API
export const commentAPI = {
  getComments: (storyId) => api.get(`/comments/story/${storyId}`),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  getReplies: (id) => api.get(`/comments/${id}/replies`)
};

// Contact API
export const contactAPI = {
  submitFeedback: (data) => api.post('/contact', data)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard')
};

export default api;