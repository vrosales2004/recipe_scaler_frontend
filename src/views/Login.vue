<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Scale & Savor</h1>
        <p>Sign in to your account</p>
      </div>

      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              v-model="loginForm.username" 
              type="text" 
              id="username" 
              required 
              :disabled="loading"
              placeholder="Enter your username"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              id="password" 
              required 
              :disabled="loading"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="form-footer">
          <p>Don't have an account? <a @click="showRegister = true" href="#" class="link">Sign up</a></p>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegister" class="modal-overlay" @click="showRegister = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create Account</h2>
          <button @click="showRegister = false" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="regUsername">Username</label>
              <input 
                v-model="registerForm.username" 
                type="text" 
                id="regUsername" 
                required 
                :disabled="loading"
                placeholder="Choose a username"
              />
            </div>
            
            <div class="form-group">
              <label for="regPassword">Password</label>
              <input 
                v-model="registerForm.password" 
                type="password" 
                id="regPassword" 
                required 
                :disabled="loading"
                placeholder="Choose a password"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                id="confirmPassword" 
                required 
                :disabled="loading"
                placeholder="Confirm your password"
              />
            </div>

            <div v-if="registerError" class="error-message">
              {{ registerError }}
            </div>

            <div class="form-actions">
              <button type="button" @click="showRegister = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Creating...' : 'Create Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
// Use computed to avoid deref issues
const loading = computed(() => authStore.loading)

const showRegister = ref(false)
const registerError = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  try {
    await authStore.login(loginForm)
    console.log('Login successful, redirecting...')
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const handleRegister = async () => {
  registerError.value = ''
  
  // Validate passwords match
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = 'Passwords do not match'
    return
  }
  
  // Validate password length
  if (registerForm.password.length < 6) {
    registerError.value = 'Password must be at least 6 characters long'
    return
  }
  
  try {
    await authStore.register({
      username: registerForm.username,
      password: registerForm.password
    })
    console.log('Registration successful, redirecting...')
    showRegister.value = false
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
    registerError.value = authStore.error || 'Registration failed'
  }
}

onMounted(async () => {
  // Check if user is already logged in
  const hasSession = await authStore.checkSession()
  if (hasSession) {
    console.log('User already logged in, redirecting...')
    router.push('/')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff7de;
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #84994F;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #606f39;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.link {
  color: #84994F;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-container {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
