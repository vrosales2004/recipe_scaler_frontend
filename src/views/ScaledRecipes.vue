<template>
  <div class="scaled-recipes">
    <div class="page-header">
      <h1>Scaled Recipes</h1>
    </div>

    <div class="scaled-recipes-list">
      <div v-if="loading" class="loading">Loading scaled recipes...</div>
      <div v-else-if="scaledRecipes.length === 0" class="empty-state">
        <p>No scaled recipes found. Scale a recipe to see it here!</p>
        <router-link to="/recipes" class="btn btn-primary">View Recipes</router-link>
      </div>
      <div v-else class="scaled-recipe-grid">
        <div v-for="scaledRecipe in scaledRecipes" :key="scaledRecipe._id" class="scaled-recipe-card">
          <div class="recipe-header">
            <h3>{{ getBaseRecipeName(scaledRecipe.baseRecipeId) }}</h3>
            <span class="scaling-method">{{ scaledRecipe.scalingMethod.toUpperCase() }}</span>
          </div>
          
          <div class="servings-info">
            <span class="target-servings">{{ scaledRecipe.targetServings }} servings</span>
          </div>

          <div class="ingredients-section">
            <h4>Scaled Ingredients</h4>
            <ul class="ingredients-list">
              <li v-for="ingredient in scaledRecipe.scaledIngredients" :key="`${ingredient.name}-${ingredient.quantity}`">
                <span class="quantity">{{ ingredient.quantity }}</span>
                <span class="unit">{{ ingredient.unit }}</span>
                <span class="name">{{ ingredient.name }}</span>
                <span v-if="ingredient.preparation" class="preparation">({{ ingredient.preparation }})</span>
              </li>
            </ul>
          </div>

          <div class="recipe-actions">
            <button @click="viewDetails(scaledRecipe)" class="btn btn-primary">View Details</button>
            <button @click="removeScaledRecipe(scaledRecipe._id)" class="btn btn-danger">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scaled Recipe Details Modal -->
    <ScaledRecipeDetailsModal 
      :is-open="detailsModalOpen" 
      :scaled-recipe="selectedScaledRecipe"
      :base-recipe="selectedBaseRecipe"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import ScaledRecipeDetailsModal from '@/components/ScaledRecipeDetailsModal.vue'
import type { ScaledRecipe, Recipe } from '@/stores/recipe'

const recipeStore = useRecipeStore()
// Use computed to avoid deref issues
const scaledRecipes = computed(() => recipeStore.scaledRecipes)
const recipes = computed(() => recipeStore.recipes)
const loading = computed(() => recipeStore.loading)

const detailsModalOpen = ref(false)
const selectedScaledRecipe = ref<ScaledRecipe | null>(null)
const selectedBaseRecipe = ref<Recipe | null>(null)

// Debug logging
console.log('ScaledRecipes view: scaledRecipes count:', scaledRecipes.value.length)
console.log('ScaledRecipes view: scaledRecipes data:', scaledRecipes.value)

// Watch for changes in scaledRecipes
watch(scaledRecipes, (newVal) => {
  console.log('ScaledRecipes view: scaledRecipes changed:', newVal.length, newVal)
}, { deep: true })

const getBaseRecipeName = (baseRecipeId: string): string => {
  const baseRecipe = recipes.value.find(recipe => recipe.recipeId === baseRecipeId)
  return baseRecipe ? baseRecipe.name : 'Unknown Recipe'
}

const viewDetails = (scaledRecipe: ScaledRecipe) => {
  selectedScaledRecipe.value = scaledRecipe
  selectedBaseRecipe.value = recipes.value.find(recipe => recipe.recipeId === scaledRecipe.baseRecipeId) || null
  detailsModalOpen.value = true
}

const closeDetailsModal = () => {
  detailsModalOpen.value = false
  selectedScaledRecipe.value = null
  selectedBaseRecipe.value = null
}

const removeScaledRecipe = async (scaledRecipeId: string) => {
  if (confirm('Are you sure you want to remove this scaled recipe?')) {
    try {
      // Remove from the store
      const index = recipeStore.scaledRecipes.findIndex(recipe => recipe._id === scaledRecipeId)
      if (index > -1) {
        recipeStore.scaledRecipes.splice(index, 1)
        console.log('Scaled recipe removed from store:', scaledRecipeId)
      } else {
        console.warn('Scaled recipe not found in store:', scaledRecipeId)
      }
    } catch (error) {
      console.error('Error removing scaled recipe:', error)
      alert('Failed to remove scaled recipe. Please try again.')
    }
  }
}
</script>

<style scoped>
.scaled-recipes {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.scaled-recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.scaled-recipe-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recipe-header h3 {
  margin: 0;
  color: #2c3e50;
}

.scaling-method {
  background-color: #7f1c00;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.servings-info {
  margin-bottom: 1.5rem;
}

.target-servings {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
}

.ingredients-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.quantity {
  font-weight: 600;
  color: #7f1c00;
  min-width: 3rem;
}

.unit {
  color: #7f8c8d;
  min-width: 2rem;
}

.name {
  flex: 1;
  color: #2c3e50;
}

.preparation {
  color: #95a5a6;
  font-style: italic;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
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

.btn-primary {
  background-color: #84994F;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
