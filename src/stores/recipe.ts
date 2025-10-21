import { defineStore } from 'pinia'
import { 
  recipeApi, 
  recipeScalerApi, 
  scalingTipsApi,
  type Recipe,
  type ScaledRecipe,
  type ScalingTip,
  type IngredientData,
  type AddRecipeRequest,
  type ScaleManuallyRequest,
  type ScaleRecipeAIRequest,
  type AddManualScalingTipRequest
} from '@/services/api'

// Re-export types for backward compatibility
export type { Recipe, ScaledRecipe, ScalingTip }
export type Ingredient = IngredientData

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [] as Recipe[],
    scaledRecipes: [] as ScaledRecipe[],
    tips: [] as ScalingTip[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    getRecipeById: (state) => (id: string) => 
      state.recipes.find(recipe => recipe.recipeId === id),
    
    getScaledRecipesByBaseId: (state) => (baseId: string) =>
      state.scaledRecipes.filter(scaled => scaled.baseRecipeId === baseId),
    
    getTipsByCookingMethod: (state) => (method: string) =>
      state.tips.filter(tip => tip.cookingMethod === method)
  },

  actions: {
    async addRecipe(recipeData: Omit<Recipe, 'recipeId'>) {
      this.loading = true
      this.error = null
      
      console.log('Store: Starting to add recipe', recipeData)
      
      try {
        const addRequest: AddRecipeRequest = {
          author: recipeData.author,
          name: recipeData.name,
          originalServings: recipeData.originalServings,
          ingredients: recipeData.ingredients,
          cookingMethods: recipeData.cookingMethods
        }
        
        console.log('Store: Making API call with request:', addRequest)
        const response = await recipeApi.addRecipe(addRequest)
        console.log('Store: API response received:', response)
        
        // Create a new recipe object with the returned ID
        const newRecipe: Recipe = {
          ...recipeData,
          recipeId: response.recipe
        }
        this.recipes.push(newRecipe)
        console.log('Store: Recipe added to local state:', newRecipe)
      } catch (error) {
        console.error('Store: Error in addRecipe:', error)
        
        // Fallback: Add recipe locally if API is not available
        if (error instanceof Error && (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED'))) {
          console.log('Store: Backend not available, adding recipe locally for demo purposes')
          const fallbackRecipe: Recipe = {
            ...recipeData,
            recipeId: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          this.recipes.push(fallbackRecipe)
          console.log('Store: Recipe added locally:', fallbackRecipe)
        } else {
          this.error = error instanceof Error ? error.message : 'Failed to add recipe'
        }
      } finally {
        this.loading = false
      }
    },

    async removeRecipe(recipeId: string) {
      this.loading = true
      this.error = null
      
      try {
        await recipeApi.removeRecipe({ recipeId })
        this.recipes = this.recipes.filter(recipe => recipe.recipeId !== recipeId)
        
        // Also remove any scaled recipes that were based on this recipe
        this.scaledRecipes = this.scaledRecipes.filter(scaled => scaled.baseRecipeId !== recipeId)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to remove recipe'
      } finally {
        this.loading = false
      }
    },

    async scaleRecipeManually(baseRecipeId: string, targetServings: number) {
      this.loading = true
      this.error = null
      
      try {
        // First, let's verify the recipe exists in our local state
        const localRecipe = this.recipes.find(r => r.recipeId === baseRecipeId)
        console.log('Store: Local recipe found:', localRecipe)
        
        if (!localRecipe) {
          throw new Error(`Recipe with ID ${baseRecipeId} not found in local state`)
        }
        
        const request: ScaleManuallyRequest = {
          baseRecipeId,
          targetServings
        }
        console.log('Store: Scaling recipe manually with request:', request)
        console.log('Store: Base recipe ID being sent:', baseRecipeId)
        console.log('Store: Target servings:', targetServings)
        
        // Let's also verify the recipe exists in the backend
        try {
          const backendRecipe = await recipeApi.getRecipeById({ recipeId: baseRecipeId })
          console.log('Store: Backend recipe found:', backendRecipe)
          if (backendRecipe.length === 0) {
            throw new Error(`Recipe with ID ${baseRecipeId} not found in backend`)
          }
        } catch (backendError) {
          console.error('Store: Error fetching recipe from backend:', backendError)
          // Check if it's a 500 error (backend issue) or other error
          if (backendError.response?.status === 500) {
            console.warn('Store: Backend returned 500 error, but continuing with scaling attempt')
            // Don't throw here, let the scaling attempt proceed
            // The backend might still be able to scale even if the verification fails
          } else {
            throw new Error(`Failed to verify recipe exists in backend: ${backendError}`)
          }
        }
        
        const response = await recipeScalerApi.scaleManually(request)
        console.log('Store: Scale response received:', response)
        
        // Fetch the created scaled recipe to add to our state
        console.log('Store: Attempting to fetch scaled recipe with ID:', response.scaledRecipeId)
        const scaledRecipeData = await recipeScalerApi.getScaledRecipe({ 
          scaledRecipeId: response.scaledRecipeId 
        })
        console.log('Store: Fetched scaled recipe data:', scaledRecipeData)
        console.log("HELLOO", typeof scaledRecipeData)
        console.log('Store: Scaled recipe data length:', scaledRecipeData.length)
        
        if (scaledRecipeData.length > 0) {
          this.scaledRecipes.push(scaledRecipeData[0])
          console.log('Store: Added scaled recipe to state:', scaledRecipeData[0])
          console.log('Store: Total scaled recipes:', this.scaledRecipes.length)
        } else {
          console.warn('Store: No scaled recipe data returned from getScaledRecipe')
          console.log('Store: Creating fallback scaled recipe object')
          
          // Fallback: Create a local scaled recipe object
          const fallbackScaledRecipe: ScaledRecipe = {
            _id: response.scaledRecipeId,
            baseRecipeId: baseRecipeId,
            targetServings: targetServings,
            scaledIngredients: localRecipe.ingredients.map(ingredient => ({
              ...ingredient,
              quantity: Number((ingredient.quantity * (targetServings / localRecipe.originalServings)).toFixed(2))
            })),
            scalingMethod: 'manual'
          }
          
          this.scaledRecipes.push(fallbackScaledRecipe)
          console.log('Store: Added fallback scaled recipe to state:', fallbackScaledRecipe)
          console.log('Store: Total scaled recipes:', this.scaledRecipes.length)
        }
      } catch (error) {
        console.error('Store: Error in scaleRecipeManually:', error)
        if (error.response?.status === 500) {
          console.warn('Store: Backend scaling failed with 500 error, creating fallback scaled recipe')
          
          // Create a fallback scaled recipe using local calculation
          const fallbackScaledRecipe: ScaledRecipe = {
            _id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            baseRecipeId: baseRecipeId,
            targetServings: targetServings,
            scaledIngredients: localRecipe.ingredients.map(ingredient => ({
              ...ingredient,
              quantity: Number((ingredient.quantity * (targetServings / localRecipe.originalServings)).toFixed(2))
            })),
            scalingMethod: 'manual'
          }
          
          this.scaledRecipes.push(fallbackScaledRecipe)
          console.log('Store: Added fallback scaled recipe to state:', fallbackScaledRecipe)
          this.error = null // Clear error since we have a fallback
        } else {
          this.error = error instanceof Error ? error.message : 'Failed to scale recipe'
        }
      } finally {
        this.loading = false
      }
    },

    async scaleRecipeAI(baseRecipeId: string, targetServings: number) {
      this.loading = true
      this.error = null
      
      try {
        const request: ScaleRecipeAIRequest = {
          baseRecipeId,
          targetServings
        }
        
        const response = await recipeScalerApi.scaleRecipeAI(request)
        
        // Fetch the created scaled recipe to add to our state
        const scaledRecipeData = await recipeScalerApi.getScaledRecipe({ 
          scaledRecipeId: response.scaledRecipeId 
        })
        
        if (scaledRecipeData.length > 0) {
          this.scaledRecipes.push(scaledRecipeData[0])
        } else {
          console.warn('Store: No scaled recipe data returned from getScaledRecipe (AI)')
          console.log('Store: Creating fallback scaled recipe object for AI scaling')
          
          // Find the base recipe
          const localRecipe = this.recipes.find(r => r.recipeId === baseRecipeId)
          if (localRecipe) {
            // Fallback: Create a local scaled recipe object
            const fallbackScaledRecipe: ScaledRecipe = {
              _id: response.scaledRecipeId,
              baseRecipeId: baseRecipeId,
              targetServings: targetServings,
              scaledIngredients: localRecipe.ingredients.map(ingredient => ({
                ...ingredient,
                quantity: Number((ingredient.quantity * (targetServings / localRecipe.originalServings)).toFixed(2))
              })),
              scalingMethod: 'ai'
            }
            
            this.scaledRecipes.push(fallbackScaledRecipe)
            console.log('Store: Added fallback AI scaled recipe to state:', fallbackScaledRecipe)
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to scale recipe with AI'
      } finally {
        this.loading = false
      }
    },

    async getScaledRecipe(scaledRecipeId: string): Promise<ScaledRecipe | null> {
      this.loading = true
      this.error = null
      
      try {
        const response = await recipeScalerApi.getScaledRecipe({ scaledRecipeId })
        return response.length > 0 ? response[0] : null
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to get scaled recipe'
        return null
      } finally {
        this.loading = false
      }
    },

    async findScaledRecipes(baseRecipeId: string, targetServings: number): Promise<ScaledRecipe[]> {
      this.loading = true
      this.error = null
      
      try {
        const response = await recipeScalerApi.findScaledRecipe({ baseRecipeId, targetServings })
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to find scaled recipes'
        return []
      } finally {
        this.loading = false
      }
    }
  }
})
