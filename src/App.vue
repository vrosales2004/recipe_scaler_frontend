<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Scale & Savor</h1>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/recipes" class="nav-link">Recipes</router-link>
        <router-link to="/scaled-recipes" class="nav-link">Scaled Recipes</router-link>
        <router-link to="/tips" class="nav-link">Tips</router-link>
      </div>
      <div class="nav-auth">
        <div v-if="authStore.isLoggedIn" class="user-info">
          <span class="username">Welcome, {{ authStore.currentUser?.username }}</span>
          <button @click="handleLogout" class="btn btn-logout" :disabled="authStore.loading">
            {{ authStore.loading ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
        <div v-else class="auth-links">
          <router-link to="/login" class="btn btn-login">Login</router-link>
        </div>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(async () => {
  // Temporarily disable auth session check to test if it's interfering
  // try {
  //   await authStore.checkSession()
  // } catch (error) {
  //   console.error('App: Error checking session:', error)
  //   // Don't let session check errors break the app
  // }
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #7f1c00; /* NavBar Background */
  color: white; /* NavBar Text */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* NavBar Shadow */
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white; /* Nav Link Text */
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.223); /* Nav Link Hover Background */
}

.nav-link.router-link-active {
  background-color: #84994F; /* Active Nav Link Background */
}

.nav-auth {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: white;
  font-weight: 500;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-login {
  background-color: #27ae60;
  color: white;
}

.btn-login:hover {
  background-color: #229954;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
}

.btn-logout:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .nav-auth {
    width: 100%;
    justify-content: center;
  }
  
  .user-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
