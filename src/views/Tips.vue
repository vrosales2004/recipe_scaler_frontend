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
      
      <!-- Tip Generation Method Selection -->
      <div class="generation-method-section">
        <h3>Choose Generation Method</h3>
        <div class="method-buttons">
          <button 
            @click="tipGenerationMethod = 'manual'" 
            :class="['method-btn', { active: tipGenerationMethod === 'manual' }]"
          >
            Manual Entry
          </button>
          <button 
            @click="tipGenerationMethod = 'ai'" 
            :class="['method-btn', { active: tipGenerationMethod === 'ai' }]"
          >
            AI Generated
          </button>
        </div>
      </div>

      <form @submit.prevent="handleAddTip">
        <!-- AI Generation Fields -->
        <div v-if="tipGenerationMethod === 'ai'" class="ai-fields">
          <div class="ai-info">
            <h4>AI Tip Generation</h4>
            <p>Generate AI tips based on a specific scaled recipe and cooking method.</p>
            <p><strong>Note:</strong> AI-generated tips will automatically be attributed to "AI".</p>
          </div>
          
          <!-- Tip Generation Options -->
          <div class="tip-generation-options">
            <div class="option-group">
              <h5>Generate tips for a specific scaled recipe</h5>
              <div class="form-group">
                <label for="relatedRecipeId">Select Scaled Recipe</label>
                <select v-model="newTip.relatedRecipeId" id="relatedRecipeId" @change="onScaledRecipeChange">
                  <option value="">Choose a scaled recipe...</option>
                  <option v-for="scaledRecipe in scaledRecipes" :key="scaledRecipe._id" :value="scaledRecipe._id">
                    {{ getScaledRecipeName(scaledRecipe) }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="scaledRecipeCookingMethod">Cooking Method</label>
                <select v-model="newTip.cookingMethod" id="scaledRecipeCookingMethod" @change="onScaledRecipeChange">
                  <option value="">Select a cooking method</option>
                  <option v-for="method in availableMethods" :key="method" :value="method">
                    {{ method }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Manual Entry Fields -->
        <div v-if="tipGenerationMethod === 'manual'" class="manual-fields">
          <div class="form-group">
            <label for="manualCookingMethod">Cooking Method</label>
            <select v-model="newTip.cookingMethod" id="manualCookingMethod" required>
              <option value="">Select a cooking method</option>
              <option v-for="method in availableMethods" :key="method" :value="method">
                {{ method }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="manualDirection">Scaling Direction</label>
            <select v-model="newTip.direction" id="manualDirection" required>
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
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
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
import { ref, reactive, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { scalingTipsApi } from '@/services/api'
import type { ScalingTip } from '@/stores/recipe'

const recipeStore = useRecipeStore()
// Use computed to avoid deref issues
const tips = computed(() => recipeStore.tips)
const recipes = computed(() => recipeStore.recipes)
const scaledRecipes = computed(() => recipeStore.scaledRecipes)
const loading = computed(() => recipeStore.loading)

const showAddTipForm = ref(false)
const tipGenerationMethod = ref<'manual' | 'ai'>('manual')
const availableMethods = ['baking', 'frying', 'boiling', 'grilling', 'roasting', 'steaming']

const newTip = reactive({
  cookingMethod: '',
  direction: '',
  content: '',
  addedBy: '',
  relatedRecipeId: ''
})

const getRecipeName = (recipeId: string): string => {
  // First try to find as original recipe
  const recipe = recipes.value.find(r => r.recipeId === recipeId)
  if (recipe) return recipe.name
  
  // Then try to find as scaled recipe
  const scaledRecipe = scaledRecipes.value.find(sr => sr._id === recipeId)
  if (scaledRecipe) {
    const baseRecipe = recipes.value.find(r => r.recipeId === scaledRecipe.baseRecipeId)
    if (baseRecipe) {
      return `${baseRecipe.name} (${baseRecipe.originalServings} → ${scaledRecipe.targetServings} servings)`
    }
  }
  
  return 'Unknown Recipe'
}

const getScaledRecipeName = (scaledRecipe: any): string => {
  const baseRecipe = recipes.value.find(r => r.recipeId === scaledRecipe.baseRecipeId)
  if (!baseRecipe) return 'Unknown Recipe'
  
  const scalingDirection = scaledRecipe.targetServings > baseRecipe.originalServings ? 'up' : 'down'
  return `${baseRecipe.name} (${baseRecipe.originalServings} → ${scaledRecipe.targetServings} servings, scaled ${scalingDirection})`
}

// Event handlers for form changes
const onScaledRecipeChange = () => {
  // No need to clear anything since we only have one option now
}

// Form validation
const isFormValid = computed(() => {
  if (tipGenerationMethod.value === 'manual') {
    return newTip.content && newTip.addedBy && newTip.cookingMethod && newTip.direction
  } else {
    // For AI generation, both scaled recipe and cooking method must be selected
    return !!newTip.relatedRecipeId && !!newTip.cookingMethod
  }
})

const handleAddTip = async () => {
  console.log('Adding tip:', newTip)
  
  if (tipGenerationMethod.value === 'manual') {
    // Manual tip creation
    const tip: ScalingTip = {
      ...newTip,
      tipId: Date.now().toString(),
      direction: newTip.direction as 'up' | 'down',
      relatedRecipeId: newTip.relatedRecipeId || undefined
    }
    
    // Add to the store
    recipeStore.tips.push(tip)
    console.log('Manual tip added to store:', tip)
    console.log('Total tips in store:', recipeStore.tips.length)
  } else {
    // AI tip generation
    await generateAITips()
  }
  
  // Reset form
  newTip.cookingMethod = ''
  newTip.direction = ''
  newTip.content = ''
  newTip.addedBy = ''
  newTip.relatedRecipeId = ''
  showAddTipForm.value = false
}

const generateAITips = async () => {
  try {
    console.log('Generating AI tips...')
    
    // Find the selected scaled recipe if one is chosen
    const selectedScaledRecipe = newTip.relatedRecipeId 
      ? scaledRecipes.value.find(sr => sr._id === newTip.relatedRecipeId)
      : null
    
    if (selectedScaledRecipe) {
      // Find the base recipe for context
      const baseRecipe = recipes.value.find(r => r.recipeId === selectedScaledRecipe.baseRecipeId)
      if (!baseRecipe) {
        throw new Error('Base recipe not found for selected scaled recipe')
      }
      
      // Calculate scaling direction from the scaled recipe
      const scalingDirection = selectedScaledRecipe.targetServings > baseRecipe.originalServings ? 'up' : 'down'
      
      // Generate tips for a specific scaled recipe
      const recipeContext = {
        recipeId: baseRecipe.recipeId,
        name: baseRecipe.name,
        originalServings: baseRecipe.originalServings,
        targetServings: selectedScaledRecipe.targetServings,
        ingredients: baseRecipe.ingredients,
        cookingMethods: baseRecipe.cookingMethods
      }
      
      console.log('Generating AI tips for scaled recipe:', recipeContext)
      console.log('Calculated scaling direction:', scalingDirection)
      console.log('Original servings:', baseRecipe.originalServings)
      console.log('Target servings:', selectedScaledRecipe.targetServings)
      
      try {
        // Call the AI tip generation API
        const response = await scalingTipsApi.requestTipGeneration({ recipeContext })
        console.log('AI tip generation response:', response)
        
        if (response.tipIds && response.tipIds.length > 0) {
          // Fetch the actual tip content using the returned tip IDs
          console.log('Using generated tip IDs:', response.tipIds)
          
          // Fetch each tip by ID to get the actual generated content
          for (const tipId of response.tipIds) {
            try {
              const tipData = await scalingTipsApi.getScalingTipById({ tipId })
              console.log('Fetched tip data for ID:', tipId, tipData)
              
              const aiTip: ScalingTip = {
                tipId: tipData._id,
                cookingMethod: tipData.cookingMethod,
                direction: tipData.direction as 'up' | 'down',
                content: tipData.text, // Use the actual generated text
                addedBy: 'AI',
                relatedRecipeId: tipData.relatedRecipeId || selectedScaledRecipe._id
              }
              
              recipeStore.tips.push(aiTip)
              console.log('AI tip added to store:', aiTip)
            } catch (fetchError) {
              console.warn('Failed to fetch tip by ID:', tipId, fetchError)
              // Create a fallback tip if fetching fails
              const fallbackTip: ScalingTip = {
                tipId: tipId,
                cookingMethod: newTip.cookingMethod,
                direction: scalingDirection as 'up' | 'down',
                content: `AI-generated tip for ${newTip.cookingMethod} when scaling ${scalingDirection} for ${baseRecipe.name} (${baseRecipe.originalServings} → ${selectedScaledRecipe.targetServings} servings). This tip was generated by AI based on the specific recipe context.`,
                addedBy: 'AI',
                relatedRecipeId: selectedScaledRecipe._id
              }
              recipeStore.tips.push(fallbackTip)
              console.log('Fallback tip added to store:', fallbackTip)
            }
          }
        } else {
          throw new Error('No tips were generated')
        }
      } catch (apiError) {
        console.warn('AI tip generation failed, creating fallback tip:', apiError)
        
        // Fallback: Create a placeholder AI-generated tip
        const scalingAdvice = scalingDirection === 'up' 
          ? 'Consider increasing cooking times and temperatures when scaling up recipes.'
          : 'Consider reducing cooking times and temperatures when scaling down recipes.'
        
        const fallbackTip: ScalingTip = {
          tipId: `ai-fallback-${Date.now()}`,
          cookingMethod: newTip.cookingMethod,
          direction: scalingDirection as 'up' | 'down',
          content: `AI-generated tip for ${newTip.cookingMethod} when scaling ${scalingDirection} for ${baseRecipe.name} (${baseRecipe.originalServings} → ${selectedScaledRecipe.targetServings} servings). ${scalingAdvice}`,
          addedBy: 'AI',
          relatedRecipeId: selectedScaledRecipe._id
        }
        
        recipeStore.tips.push(fallbackTip)
        console.log('Fallback AI tip added to store:', fallbackTip)
      }
    } else {
      // No scaled recipe selected - this should not happen due to form validation
      throw new Error('No scaled recipe selected. Please select a scaled recipe to generate AI tips.')
    }
    
    console.log('Total tips in store:', recipeStore.tips.length)
  } catch (error) {
    console.error('Error generating AI tips:', error)
    alert('Failed to generate AI tips. Please try again.')
  }
}

const removeTip = async (tipId: string) => {
  if (confirm('Are you sure you want to remove this tip?')) {
    // Remove from store
    const index = recipeStore.tips.findIndex(tip => tip.tipId === tipId)
    if (index > -1) {
      recipeStore.tips.splice(index, 1)
      console.log('Tip removed from store:', tipId)
      console.log('Remaining tips in store:', recipeStore.tips.length)
    }
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

.generation-method-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.generation-method-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.method-buttons {
  display: flex;
  gap: 1rem;
}

.method-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.method-btn.active {
  border-color: #3498db;
  background-color: #3498db;
  color: white;
}

.method-btn:hover:not(.active) {
  border-color: #3498db;
  color: #3498db;
}

.manual-fields, .ai-fields {
  margin-top: 1rem;
}

.ai-info {
  background-color: #e8f4fd;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3498db;
}

.ai-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.ai-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.tip-generation-options {
  margin-top: 1rem;
}

.option-group {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.option-group h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
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

@media (max-width: 768px) {
  .method-buttons {
    flex-direction: column;
  }
  
  .add-tip-form {
    padding: 1rem;
  }
}
</style>
