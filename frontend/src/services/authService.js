import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/auth';

export const authService = {
  // Sign Up
  signup(email, password, confirmPassword) {
    return axios.post(`${API_BASE_URL}/signup`, {
      email,
      password,
      confirmPassword
    });
  },

  // Sign In
  signin(email, password) {
    return axios.post(`${API_BASE_URL}/signin`, {
      email,
      password
    });
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Get user info
  getUserInfo() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    return userId && userEmail ? { id: userId, email: userEmail } : null;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
