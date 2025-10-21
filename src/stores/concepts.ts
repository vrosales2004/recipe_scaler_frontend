import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  type AddManualScalingTipRequest,
  type RequestTipGenerationRequest
} from '@/services/api'

export const useConceptsStore = defineStore('concepts', () => {
  // State
  const recipes = ref<Recipe[]>([])
  const scaledRecipes = ref<ScaledRecipe[]>([])
  const scalingTips = ref<ScalingTip[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getRecipeById = computed(() => (id: string) => 
    recipes.value.find(recipe => recipe.recipeId === id)
  )

  const getScaledRecipesByBaseId = computed(() => (baseId: string) =>
    scaledRecipes.value.filter(scaled => scaled.baseRecipeId === baseId)
  )

  const getScaledRecipeById = computed(() => (id: string) =>
    scaledRecipes.value.find(scaled => scaled.scaledRecipeId === id)
  )

  const getTipsByCookingMethod = computed(() => (method: string) =>
    scalingTips.value.filter(tip => tip.cookingMethod === method)
  )

  const getTipsByDirection = computed(() => (direction: 'up' | 'down') =>
    scalingTips.value.filter(tip => tip.direction === direction)
  )

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const clearError = () => {
    error.value = null
  }

  // Recipe actions
  const addRecipe = async (recipeData: AddRecipeRequest): Promise<string | null> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await recipeApi.addRecipe(recipeData)
      
      // Create a new recipe object with the returned ID
      const newRecipe: Recipe = {
        recipeId: response.recipe,
        author: recipeData.author,
        name: recipeData.name,
        originalServings: recipeData.originalServings,
        ingredients: recipeData.ingredients,
        cookingMethods: recipeData.cookingMethods
      }
      
      recipes.value.push(newRecipe)
      return response.recipe
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add recipe'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeRecipe = async (recipeId: string): Promise<boolean> => {
    setLoading(true)
    clearError()
    
    try {
      await recipeApi.removeRecipe({ recipeId })
      recipes.value = recipes.value.filter(recipe => recipe.recipeId !== recipeId)
      
      // Also remove any scaled recipes that were based on this recipe
      scaledRecipes.value = scaledRecipes.value.filter(scaled => scaled.baseRecipeId !== recipeId)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove recipe'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Recipe scaling actions
  const scaleRecipeManually = async (request: ScaleManuallyRequest): Promise<string | null> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await recipeScalerApi.scaleManually(request)
      
      // Fetch the created scaled recipe to add to our state
      const scaledRecipeData = await recipeScalerApi.getScaledRecipe({ 
        scaledRecipeId: response.scaledRecipeId 
      })
      
      if (scaledRecipeData.length > 0) {
        scaledRecipes.value.push(scaledRecipeData[0])
      }
      
      return response.scaledRecipeId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scale recipe manually'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const scaleRecipeAI = async (request: ScaleRecipeAIRequest): Promise<string | null> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await recipeScalerApi.scaleRecipeAI(request)
      
      // Fetch the created scaled recipe to add to our state
      const scaledRecipeData = await recipeScalerApi.getScaledRecipe({ 
        scaledRecipeId: response.scaledRecipeId 
      })
      
      if (scaledRecipeData.length > 0) {
        scaledRecipes.value.push(scaledRecipeData[0])
      }
      
      return response.scaledRecipeId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scale recipe with AI'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getScaledRecipe = async (scaledRecipeId: string): Promise<ScaledRecipe | null> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await recipeScalerApi.getScaledRecipe({ scaledRecipeId })
      return response.length > 0 ? response[0] : null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scaled recipe'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const findScaledRecipes = async (baseRecipeId: string, targetServings: number): Promise<ScaledRecipe[]> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await recipeScalerApi.findScaledRecipe({ baseRecipeId, targetServings })
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find scaled recipes'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Scaling tips actions
  const addManualScalingTip = async (tipData: AddManualScalingTipRequest): Promise<string | null> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await scalingTipsApi.addManualScalingTip(tipData)
      
      // Create a new tip object with the returned ID
      const newTip: ScalingTip = {
        tipId: response.tipId,
        cookingMethod: tipData.cookingMethod,
        direction: tipData.direction as 'up' | 'down',
        content: tipData.content,
        addedBy: tipData.addedBy,
        relatedRecipeId: tipData.relatedRecipeId || undefined
      }
      
      scalingTips.value.push(newTip)
      return response.tipId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add scaling tip'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const requestTipGeneration = async (request: RequestTipGenerationRequest): Promise<string[]> => {
    setLoading(true)
    clearError()
    
    try {
      const response = await scalingTipsApi.requestTipGeneration(request)
      return response.generatedTipIds
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tips'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  const removeScalingTip = async (tipId: string): Promise<boolean> => {
    setLoading(true)
    clearError()
    
    try {
      await scalingTipsApi.removeScalingTip({ tipId })
      scalingTips.value = scalingTips.value.filter(tip => tip.tipId !== tipId)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove scaling tip'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Utility actions
  const clearAllData = () => {
    recipes.value = []
    scaledRecipes.value = []
    scalingTips.value = []
    clearError()
  }

  const refreshScaledRecipes = async (baseRecipeId: string) => {
    const baseRecipe = getRecipeById.value(baseRecipeId)
    if (!baseRecipe) return

    // Find all scaled recipes for this base recipe
    const existingScaled = scaledRecipes.value.filter(scaled => scaled.baseRecipeId === baseRecipeId)
    
    // Fetch fresh data for each scaled recipe
    for (const scaled of existingScaled) {
      try {
        const freshData = await getScaledRecipe(scaled.scaledRecipeId)
        if (freshData) {
          const index = scaledRecipes.value.findIndex(s => s.scaledRecipeId === scaled.scaledRecipeId)
          if (index !== -1) {
            scaledRecipes.value[index] = freshData
          }
        }
      } catch (err) {
        console.warn(`Failed to refresh scaled recipe ${scaled.scaledRecipeId}:`, err)
      }
    }
  }

  return {
    // State
    recipes,
    scaledRecipes,
    scalingTips,
    loading,
    error,
    
    // Getters
    getRecipeById,
    getScaledRecipesByBaseId,
    getScaledRecipeById,
    getTipsByCookingMethod,
    getTipsByDirection,
    
    // Actions
    addRecipe,
    removeRecipe,
    scaleRecipeManually,
    scaleRecipeAI,
    getScaledRecipe,
    findScaledRecipes,
    addManualScalingTip,
    requestTipGeneration,
    removeScalingTip,
    clearAllData,
    refreshScaledRecipes,
    setLoading,
    setError,
    clearError
  }
})
