<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Scale Recipe: {{ recipe?.name }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Scaling Method Selection -->
        <div class="scaling-method-section">
          <h3>Choose Scaling Method</h3>
          <div class="method-buttons">
            <button 
              @click="scalingMethod = 'manual'" 
              :class="['method-btn', { active: scalingMethod === 'manual' }]"
            >
              Manual Scaling
            </button>
            <button 
              @click="scalingMethod = 'ai'" 
              :class="['method-btn', { active: scalingMethod === 'ai' }]"
            >
              AI Scaling
            </button>
          </div>
        </div>

        <!-- Target Servings -->
        <div class="form-group">
          <label for="targetServings">Target Servings</label>
          <input 
            v-model.number="targetServings" 
            type="number" 
            id="targetServings" 
            min="1" 
            required 
          />
          <small>Original: {{ recipe?.originalServings }} servings</small>
        </div>

        <!-- Manual Scaling Section -->
        <div v-if="scalingMethod === 'manual'" class="manual-scaling-section">
          <h3>Linear Scaling</h3>
          <div class="scaling-factor">
            <label>Scaling Factor: {{ scalingFactor.toFixed(2) }}x</label>
            <div class="factor-info">
              <span v-if="scalingFactor > 1" class="scale-up">Scaling Up</span>
              <span v-else-if="scalingFactor < 1" class="scale-down">Scaling Down</span>
              <span v-else class="no-change">No Change</span>
            </div>
          </div>
          
          <div class="scaling-info">
            <p>Linear scaling will automatically calculate new ingredient quantities based on the scaling factor.</p>
            <p><strong>Original:</strong> {{ recipe?.originalServings }} servings → <strong>Target:</strong> {{ targetServings }} servings</p>
          </div>
        </div>

        <!-- AI Scaling Section -->
        <div v-if="scalingMethod === 'ai'" class="ai-scaling-section">
          <div class="ai-info">
            <h3>AI-Powered Scaling</h3>
            <p>Our AI will intelligently scale your recipe ingredients while maintaining flavor profiles and cooking techniques.</p>
            <div class="ai-features">
              <div class="feature-item">
                <span class="feature-icon">🧠</span>
                <span>Smart ingredient adjustments</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👨‍🍳</span>
                <span>Cooking method optimization</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚖️</span>
                <span>Flavor balance preservation</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">Cancel</button>
        <button 
          @click="handleScaleRecipe" 
          class="btn btn-primary" 
          :disabled="loading || !targetServings"
        >
          {{ loading ? 'Scaling...' : 'Scale Recipe' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import type { Recipe, Ingredient } from '@/stores/recipe'

interface Props {
  isOpen: boolean
  recipe: Recipe | null
}

interface Emits {
  (e: 'close'): void
  (e: 'scaled', scaledRecipeId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Debug what props we receive
watch(() => props.recipe, (newRecipe) => {
  console.log('Modal: Recipe prop changed:', newRecipe)
  console.log('Modal: Recipe ID:', newRecipe?.recipeId)
  console.log('Modal: Recipe keys:', newRecipe ? Object.keys(newRecipe) : 'No recipe')
}, { immediate: true })

const recipeStore = useRecipeStore()
// Use computed to avoid deref issues
const loading = computed(() => recipeStore.loading)
const error = computed(() => recipeStore.error)

const scalingMethod = ref<'manual' | 'ai'>('manual')
const targetServings = ref(1)

// Computed scaling factor
const scalingFactor = computed(() => {
  if (!props.recipe || !targetServings.value) return 1
  return targetServings.value / props.recipe.originalServings
})

const closeModal = () => {
  emit('close')
}

const handleScaleRecipe = async () => {
  if (!props.recipe || !targetServings.value) return

  console.log('Modal: Recipe being scaled:', props.recipe)
  console.log('Modal: Recipe ID:', props.recipe?.recipeId)
  console.log('Modal: Recipe keys:', props.recipe ? Object.keys(props.recipe) : 'No recipe')
  console.log('Modal: Recipe ID type:', typeof props.recipe?.recipeId)
  console.log('Modal: Recipe ID value:', JSON.stringify(props.recipe?.recipeId))
  console.log('Modal: All recipe properties:', Object.entries(props.recipe || {}))
  console.log('Modal: Target servings:', targetServings.value)
  console.log('Modal: Scaling method:', scalingMethod.value)

  try {
    if (!props.recipe?.recipeId) {
      console.error('Modal: Recipe ID is missing!')
      console.error('Modal: Recipe object:', props.recipe)
      console.error('Modal: Recipe ID property:', props.recipe?.recipeId)
      throw new Error('Recipe ID is missing. Cannot scale recipe.')
    }
    
    if (scalingMethod.value === 'manual') {
      await recipeStore.scaleRecipeManually(
        props.recipe.recipeId,
        targetServings.value
      )
    } else {
      await recipeStore.scaleRecipeAI(
        props.recipe.recipeId,
        targetServings.value
      )
    }

    // Find the most recently added scaled recipe
    const latestScaledRecipe = recipeStore.scaledRecipes
      .filter(scaled => scaled.baseRecipeId === props.recipe!.recipeId)
      .sort((a, b) => b._id.localeCompare(a._id))[0]

    if (latestScaledRecipe) {
      emit('scaled', latestScaledRecipe._id)
    }
    
    closeModal()
  } catch (err) {
    console.error('Error scaling recipe:', err)
  }
}
</script>

<style scoped>
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
  max-width: 600px;
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

.scaling-method-section {
  margin-bottom: 2rem;
}

.scaling-method-section h3 {
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
  border-color: #84994F; /* Method Button Active Border */
  background-color: #84994F; /* Method Button Active Background */
  color: white;
}

.method-btn:hover:not(.active) {
  border-color: #84994F; /* Method Button Inactive Hover Border */
  color: #84994F; /* Method Button Inactive Hover Text */
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
  border-radius: 4px;
  font-size: 1rem;
}

.form-group small {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.manual-scaling-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.scaling-factor {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.factor-info span {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.scale-up {
  background-color: #d4edda;
  color: #155724;
}

.scale-down {
  background-color: #f8d7da;
  color: #721c24;
}

.no-change {
  background-color: #d1ecf1;
  color: #0c5460;
}

.scaling-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.scaling-info p {
  margin: 0.5rem 0;
  color: #2c3e50;
  line-height: 1.5;
}

.scaling-info p:last-child {
  font-weight: 500;
  color: #7f1c00;
}

.ingredient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.ingredient-row:last-child {
  border-bottom: none;
}

.ingredient-info {
  flex: 1;
}

.ingredient-name {
  font-weight: 500;
  color: #2c3e50;
}

.preparation {
  color: #7f8c8d;
  font-style: italic;
  margin-left: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.unit {
  color: #7f8c8d;
  font-size: 0.9rem;
  min-width: 40px;
}

.reset-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn:hover {
  background: #5a6268;
}

.ai-scaling-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.ai-info h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.ai-info p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.ai-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feature-icon {
  font-size: 1.2rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
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

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .method-buttons {
    flex-direction: column;
  }
  
  .ingredient-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quantity-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
