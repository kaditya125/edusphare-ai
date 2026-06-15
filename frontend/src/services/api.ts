import axios from 'express'; // wait, it's frontend. import axios from 'axios';
import axiosLib from 'axios';

const api = axiosLib.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
