<template>
  <div class="recipes">
    <div class="page-header">
      <h1>Recipes</h1>
      <button @click="showAddForm = !showAddForm" class="btn btn-primary">
        {{ showAddForm ? 'Cancel' : 'Add Recipe' }}
      </button>
    </div>

    <!-- Add Recipe Form -->
    <div v-if="showAddForm" class="add-recipe-form">
      <h2>Add New Recipe</h2>
      <form @submit.prevent="handleAddRecipe">
        <div class="form-group">
          <label for="name">Recipe Name</label>
          <input v-model="newRecipe.name" type="text" id="name" required />
        </div>
        
        <div class="form-group">
          <label for="author">Author</label>
          <input v-model="newRecipe.author" type="text" id="author" required />
        </div>
        
        <div class="form-group">
          <label for="servings">Original Servings</label>
          <input v-model.number="newRecipe.originalServings" type="number" id="servings" required />
        </div>

        <div class="form-group">
          <label>Cooking Methods</label>
          <div class="checkbox-group">
            <label v-for="method in availableMethods" :key="method">
              <input 
                type="checkbox" 
                :value="method" 
                v-model="newRecipe.cookingMethods"
              />
              {{ method }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Ingredients</label>
          <div v-for="(ingredient, index) in newRecipe.ingredients" :key="index" class="ingredient-row">
            <input v-model="ingredient.name" placeholder="Ingredient name" />
            <input v-model.number="ingredient.quantity" type="number" placeholder="Quantity" />
            <input v-model="ingredient.unit" placeholder="Unit" />
            <input v-model="ingredient.preparation" placeholder="Preparation (optional)" />
            <button type="button" @click="removeIngredient(index)" class="btn btn-danger">Remove</button>
          </div>
          <button type="button" @click="addIngredient" class="btn btn-secondary">Add Ingredient</button>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Recipe' }}
          </button>
          <button type="button" @click="testForm" class="btn btn-secondary">
            Test Form Data
          </button>
        </div>
      </form>
    </div>

    <!-- Recipes List -->
    <div class="recipes-list">
      <div v-if="loading" class="loading">Loading recipes...</div>
      <div v-else-if="recipes.length === 0" class="empty-state">
        <p>No recipes found. Add your first recipe to get started!</p>
      </div>
      <div v-else class="recipe-grid">
        <div v-for="recipe in recipes" :key="recipe.recipeId" class="recipe-card">
          <h3>{{ recipe.name }}</h3>
          <p class="author">By {{ recipe.author }}</p>
          <p class="servings">{{ recipe.originalServings }} servings</p>
          <div class="cooking-methods">
            <span v-for="method in recipe.cookingMethods" :key="method" class="method-tag">
              {{ method }}
            </span>
          </div>
          <div class="recipe-actions">
            <button @click="viewDetails(recipe)" class="btn btn-secondary">View Details</button>
            <button @click="openScalingModal(recipe)" class="btn btn-primary">Scale Recipe</button>
            <button @click="removeRecipe(recipe.recipeId)" class="btn btn-danger">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipe Details Modal -->
    <RecipeDetailsModal 
      :is-open="detailsModalOpen" 
      :recipe="selectedRecipe"
      @close="closeDetailsModal"
      @scale="handleScaleFromDetails"
    />

    <!-- Recipe Scaling Modal -->
    <RecipeScalingModal 
      :is-open="scalingModalOpen" 
      :recipe="selectedRecipe"
      @close="closeScalingModal"
      @scaled="handleRecipeScaled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import RecipeScalingModal from '@/components/RecipeScalingModal.vue'
import RecipeDetailsModal from '@/components/RecipeDetailsModal.vue'
import type { Recipe, Ingredient } from '@/stores/recipe'

const recipeStore = useRecipeStore()
// Use computed to avoid deref issues
const recipes = computed(() => recipeStore.recipes)
const loading = computed(() => recipeStore.loading)

const showAddForm = ref(false)
const detailsModalOpen = ref(false)
const scalingModalOpen = ref(false)
const selectedRecipe = ref<Recipe | null>(null)
const availableMethods = ['baking', 'frying', 'boiling', 'grilling', 'roasting', 'steaming']

const newRecipe = reactive({
  name: '',
  author: '',
  originalServings: 1,
  cookingMethods: [] as string[],
  ingredients: [] as Ingredient[]
})

const addIngredient = () => {
  newRecipe.ingredients.push({
    name: '',
    quantity: 0,
    unit: '',
    preparation: ''
  })
}

const removeIngredient = (index: number) => {
  newRecipe.ingredients.splice(index, 1)
}

const handleAddRecipe = async () => {
  // Basic validation
  if (!newRecipe.name.trim()) {
    alert('Please enter a recipe name')
    return
  }
  if (!newRecipe.author.trim()) {
    alert('Please enter an author')
    return
  }
  if (newRecipe.originalServings <= 0) {
    alert('Please enter a valid number of servings')
    return
  }
  if (newRecipe.ingredients.length === 0) {
    alert('Please add at least one ingredient')
    return
  }
  if (newRecipe.cookingMethods.length === 0) {
    alert('Please select at least one cooking method')
    return
  }

  console.log('Adding recipe:', newRecipe)
  
  try {
    await recipeStore.addRecipe(newRecipe)
    
    if (recipeStore.error) {
      console.error('Error adding recipe:', recipeStore.error)
      alert(`Failed to add recipe: ${recipeStore.error}`)
    } else {
      console.log('Recipe added successfully')
      // Reset form
      newRecipe.name = ''
      newRecipe.author = ''
      newRecipe.originalServings = 1
      newRecipe.cookingMethods = []
      newRecipe.ingredients = []
      showAddForm.value = false
      
      // Check if it's a demo recipe (local fallback)
      const latestRecipe = recipeStore.recipes[recipeStore.recipes.length - 1]
      const isDemoMode = latestRecipe && latestRecipe.recipeId && latestRecipe.recipeId.startsWith('demo-')
      
      if (isDemoMode) {
        alert('Recipe added successfully! (Demo mode - backend not available)')
      } else {
        alert('Recipe added successfully!')
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    alert(`Unexpected error: ${error}`)
  }
}

const viewDetails = (recipe: Recipe) => {
  selectedRecipe.value = recipe
  detailsModalOpen.value = true
}

const closeDetailsModal = () => {
  detailsModalOpen.value = false
  selectedRecipe.value = null
}

const handleScaleFromDetails = (recipe: Recipe) => {
  closeDetailsModal()
  openScalingModal(recipe)
}

const openScalingModal = (recipe: Recipe) => {
  console.log('Recipes: Opening scaling modal for recipe:', recipe)
  console.log('Recipes: Recipe ID:', recipe.recipeId)
  console.log('Recipes: Recipe ID type:', typeof recipe.recipeId)
  console.log('Recipes: Recipe ID value:', JSON.stringify(recipe.recipeId))
  console.log('Recipes: Recipe keys:', Object.keys(recipe))
  console.log('Recipes: All recipe properties:', Object.entries(recipe))
  selectedRecipe.value = recipe
  scalingModalOpen.value = true
}

const closeScalingModal = () => {
  scalingModalOpen.value = false
  selectedRecipe.value = null
}

const handleRecipeScaled = (scaledRecipeId: string) => {
  console.log('Recipe scaled successfully:', scaledRecipeId)
  // Optionally navigate to scaled recipes page or show success message
}

const testForm = () => {
  console.log('Form data:', {
    name: newRecipe.name,
    author: newRecipe.author,
    originalServings: newRecipe.originalServings,
    cookingMethods: newRecipe.cookingMethods,
    ingredients: newRecipe.ingredients
  })
  
  // Fill with test data
  newRecipe.name = 'Test Recipe'
  newRecipe.author = 'Test Author'
  newRecipe.originalServings = 4
  newRecipe.cookingMethods = ['baking']
  newRecipe.ingredients = [
    { name: 'flour', quantity: 2, unit: 'cups', preparation: 'sifted' },
    { name: 'sugar', quantity: 1, unit: 'cup', preparation: '' }
  ]
  
  console.log('Form filled with test data')
}

const removeRecipe = async (recipeId: string) => {
  if (confirm('Are you sure you want to remove this recipe?')) {
    await recipeStore.removeRecipe(recipeId)
  }
}
</script>

<style scoped>
.recipes {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-recipe-form {
  background-color: #f2e9c8; /* Add Recipe Form Background */
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ingredient-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.form-actions {
  margin-top: 2rem;
}

.recipes-list {
  margin-top: 2rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.recipe-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.author {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.servings {
  color: #7f1c00;
  font-weight: 500;
  margin-bottom: 1rem;
}

.cooking-methods {
  margin-bottom: 1rem;
}

.method-tag {
  display: inline-block;
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #84994F; /* Add Recipe Button Background */
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
</style>
