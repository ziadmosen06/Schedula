import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const logoutUser = () => API.post('/auth/logout');
export const forgotPasswordUser = (data) => API.post('/auth/forgot-password', data);
export const resetPasswordUser = (data) => API.post('/auth/reset-password', data);
export const changePasswordUser = (data) => API.post('/auth/change-password', data);
export const updateProfileUser = (data) => API.put('/auth/profile', data);
export const getTasks = () => API.get('/tasks');
export const getCompletedTasks = (params) => API.get('/tasks/history', { params });
export const createTask = (data) => API.post('/tasks', data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const completeTask = (id) => API.patch(`/tasks/${id}/complete`);
export const rescheduleTask = (id, data) => API.patch(`/tasks/${id}/reschedule`, data);
export const scheduleTask = (id) => API.post(`/ai/schedule/${id}`);