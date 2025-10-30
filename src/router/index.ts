import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Recipes from '@/views/Recipes.vue'
import ScaledRecipes from '@/views/ScaledRecipes.vue'
import Tips from '@/views/Tips.vue'
import Login from '@/views/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: Recipes,
    meta: { requiresAuth: true }
  },
  {
    path: '/scaled-recipes',
    name: 'ScaledRecipes',
    component: ScaledRecipes,
    meta: { requiresAuth: true }
  },
  {
    path: '/tips',
    name: 'Tips',
    component: Tips,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards - TEMPORARILY DISABLED TO TEST SCALING
// router.beforeEach(async (to, _from, next) => {
//   try {
//     console.log('Router: Navigating to', to.path, 'with meta:', to.meta)
    
//     const authStore = useAuthStore()
//     console.log('Router: Auth state - isLoggedIn:', authStore.isLoggedIn, 'user:', authStore.currentUser)
    
//     // Check if route requires authentication
//     if (to.meta.requiresAuth) {
//       console.log('Router: Route requires auth, checking authentication...')
//       // Check if user is authenticated
//       if (!authStore.isLoggedIn) {
//         console.log('Router: User not logged in, checking session...')
//         // Try to restore session from localStorage
//         const hasSession = await authStore.checkSession()
//         console.log('Router: Session check result:', hasSession)
//         if (!hasSession) {
//           console.log('Auth: User not authenticated, redirecting to login')
//           next('/login')
//           return
//         }
//       }
//       console.log('Router: User is authenticated, proceeding to route')
//     }
    
//     // Check if route requires guest (not authenticated)
//     if (to.meta.requiresGuest) {
//       console.log('Router: Route requires guest, checking if user is logged in...')
//       if (authStore.isLoggedIn) {
//         console.log('Auth: User already authenticated, redirecting to home')
//         next('/')
//         return
//       }
//       console.log('Router: User is not logged in, proceeding to guest route')
//     }
    
//     console.log('Router: Proceeding to route:', to.path)
//     next()
//   } catch (error) {
//     console.error('Router: Error in navigation guard:', error)
//     // If there's an error in the guard, just proceed to the route
//     next()
//   }
// })

export default router
