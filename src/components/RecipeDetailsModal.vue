<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ recipe?.name }}</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="recipe-info">
          <div class="info-row">
            <span class="label">Author:</span>
            <span class="value">{{ recipe?.author }}</span>
          </div>
          <div class="info-row">
            <span class="label">Servings:</span>
            <span class="value">{{ recipe?.originalServings }}</span>
          </div>
          <div class="info-row">
            <span class="label">Cooking Methods:</span>
            <div class="methods">
              <span v-for="method in recipe?.cookingMethods" :key="method" class="method-tag">
                {{ method }}
              </span>
            </div>
          </div>
        </div>

        <div class="ingredients-section">
          <h3>Ingredients</h3>
          <div class="ingredients-list">
            <div v-for="ingredient in recipe?.ingredients" :key="`${ingredient.name}-${ingredient.quantity}`" class="ingredient-item">
              <span class="quantity">{{ ingredient.quantity }}</span>
              <span class="unit">{{ ingredient.unit }}</span>
              <span class="name">{{ ingredient.name }}</span>
              <span v-if="ingredient.preparation" class="preparation">({{ ingredient.preparation }})</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">Close</button>
        <button v-if="showScaleButton" @click="handleScaleRecipe" class="btn btn-primary">Scale Recipe</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '@/stores/recipe'

interface Props {
  isOpen: boolean
  recipe: Recipe | null
  showScaleButton?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'scale', recipe: Recipe): void
}

const props = withDefaults(defineProps<Props>(), {
  showScaleButton: true
})

const emit = defineEmits<Emits>()

const closeModal = () => {
  emit('close')
}

const handleScaleRecipe = () => {
  if (props.recipe) {
    emit('scale', props.recipe)
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

.recipe-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

.value {
  color: #7f8c8d;
}

.methods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.method-tag {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.ingredients-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.ingredients-list {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.quantity {
  font-weight: 600;
  color: #3498db;
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
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .label {
    min-width: auto;
  }
}
</style>
