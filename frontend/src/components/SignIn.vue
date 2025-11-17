<script setup>
import { ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['auth-success', 'switch-to-signup']);

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const API_BASE_URL = 'http://localhost:3000/auth';

const handleSignIn = async () => {
  error.value = '';
  
  if (!email.value.trim() || !password.value) {
    error.value = 'Email and password are required.';
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/signin`, {
      email: email.value.trim(),
      password: password.value
    });

    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userId', response.data.user.id);
    localStorage.setItem('userEmail', response.data.user.email);

    emit('auth-success', response.data.user);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to sign in. Please try again.';
    console.error('Sign in error:', err);
  } finally {
    loading.value = false;
  }
};

const switchToSignUp = () => {
  emit('switch-to-signup');
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Sign In</h1>

      <div v-if="error" class="error-box">
        <p>{{ error }}</p>
        <button class="close-btn" @click="error = ''">×</button>
      </div>

      <form @submit.prevent="handleSignIn" class="auth-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="form-input"
            required
          />
        </div>

        <button
          type="submit"
          class="form-button"
          :disabled="loading"
        >
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <div class="switch-auth">
        <p>Don't have an account?</p>
        <button @click="switchToSignUp" class="switch-button">Sign Up</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.auth-title {
  font-size: 2rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 700;
}

.error-box {
  background-color: #ffe5e5;
  border: 1px solid #ffb3b3;
  color: #b30000;
  padding: 12px 15px;
  margin-bottom: 20px;
  border-radius: 6px;
  position: relative;
  font-size: 0.9rem;
}

.close-btn {
  position: absolute;
  top: 4px;
  right: 8px;
  background: none;
  border: none;
  color: #b30000;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: #800000;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.form-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.form-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-auth {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.switch-auth p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}

.switch-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: underline;
  transition: color 0.3s;
}

.switch-button:hover {
  color: #764ba2;
}
</style>
