import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Recipes from '@/views/Recipes.vue'
import ScaledRecipes from '@/views/ScaledRecipes.vue'
import Tips from '@/views/Tips.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: Recipes
  },
  {
    path: '/scaled-recipes',
    name: 'ScaledRecipes',
    component: ScaledRecipes
  },
  {
    path: '/tips',
    name: 'Tips',
    component: Tips
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
