<template>
  <div class="tips">
    <div class="page-header">
      <h1>Scaling Tips</h1>
      <button @click="showAddTipForm = !showAddTipForm" class="btn btn-primary">
        {{ showAddTipForm ? 'Cancel' : 'Add Tip' }}
      </button>
    </div>

    <!-- Add Tip Form -->
    <div v-if="showAddTipForm" class="add-tip-form">
      <h2>Add New Scaling Tip</h2>
      <form @submit.prevent="handleAddTip">
        <div class="form-group">
          <label for="cookingMethod">Cooking Method</label>
          <select v-model="newTip.cookingMethod" id="cookingMethod" required>
            <option value="">Select a cooking method</option>
            <option v-for="method in availableMethods" :key="method" :value="method">
              {{ method }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="direction">Scaling Direction</label>
          <select v-model="newTip.direction" id="direction" required>
            <option value="">Select direction</option>
            <option value="up">Scale Up</option>
            <option value="down">Scale Down</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="content">Tip Content</label>
          <textarea 
            v-model="newTip.content" 
            id="content" 
            rows="4" 
            placeholder="Enter your scaling tip here..."
            required
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="addedBy">Added By</label>
          <input v-model="newTip.addedBy" type="text" id="addedBy" required />
        </div>
        
        <div class="form-group">
          <label for="relatedRecipeId">Related Recipe (Optional)</label>
          <select v-model="newTip.relatedRecipeId" id="relatedRecipeId">
            <option value="">No specific recipe</option>
            <option v-for="recipe in recipes" :key="recipe.recipeId" :value="recipe.recipeId">
              {{ recipe.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Tip' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Tips List -->
    <div class="tips-list">
      <div v-if="loading" class="loading">Loading tips...</div>
      <div v-else-if="tips.length === 0" class="empty-state">
        <p>No scaling tips found. Add your first tip to help others!</p>
      </div>
      <div v-else class="tips-grid">
        <div v-for="tip in tips" :key="tip.tipId" class="tip-card">
          <div class="tip-header">
            <h3>{{ tip.cookingMethod }}</h3>
            <span class="direction-badge" :class="tip.direction">
              {{ tip.direction === 'up' ? 'Scale Up' : 'Scale Down' }}
            </span>
          </div>
          
          <div class="tip-content">
            <p>{{ tip.content }}</p>
          </div>
          
          <div class="tip-meta">
            <span class="added-by">Added by: {{ tip.addedBy }}</span>
            <span v-if="tip.relatedRecipeId" class="related-recipe">
              Recipe: {{ getRecipeName(tip.relatedRecipeId) }}
            </span>
          </div>

          <div class="tip-actions">
            <button @click="removeTip(tip.tipId)" class="btn btn-danger">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRecipeStore } from '@/stores/recipe'
import type { ScalingTip } from '@/stores/recipe'

const recipeStore = useRecipeStore()
const { tips, recipes, loading } = storeToRefs(recipeStore)

const showAddTipForm = ref(false)
const availableMethods = ['baking', 'frying', 'boiling', 'grilling', 'roasting', 'steaming']

const newTip = reactive({
  cookingMethod: '',
  direction: '',
  content: '',
  addedBy: '',
  relatedRecipeId: ''
})

const getRecipeName = (recipeId: string): string => {
  const recipe = recipes.value.find(r => r.recipeId === recipeId)
  return recipe ? recipe.name : 'Unknown Recipe'
}

const handleAddTip = async () => {
  // TODO: Implement API call to add tip
  console.log('Adding tip:', newTip)
  
  // For now, just add to local state
  const tip: ScalingTip = {
    ...newTip,
    tipId: Date.now().toString(),
    relatedRecipeId: newTip.relatedRecipeId || undefined
  }
  
  // Reset form
  newTip.cookingMethod = ''
  newTip.direction = ''
  newTip.content = ''
  newTip.addedBy = ''
  newTip.relatedRecipeId = ''
  showAddTipForm.value = false
}

const removeTip = async (tipId: string) => {
  if (confirm('Are you sure you want to remove this tip?')) {
    // TODO: Implement API call to remove tip
    console.log('Removing tip:', tipId)
  }
}
</script>

<style scoped>
.tips {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-tip-form {
  background-color: #f8f9fa;
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  margin-top: 2rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e9ecef;
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tip-header h3 {
  margin: 0;
  color: #2c3e50;
  text-transform: capitalize;
}

.direction-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.direction-badge.up {
  background-color: #27ae60;
  color: white;
}

.direction-badge.down {
  background-color: #e67e22;
  color: white;
}

.tip-content {
  margin-bottom: 1rem;
}

.tip-content p {
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
}

.tip-meta {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.tip-meta span {
  display: block;
  margin-bottom: 0.25rem;
}

.tip-actions {
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
  background-color: #3498db;
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
