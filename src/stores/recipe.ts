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
        console.log('Store: New recipe object:', newRecipe)
        console.log('Store: New recipe ID:', newRecipe.recipeId)
        console.log('Store: New recipe ID type:', typeof newRecipe.recipeId)
        this.recipes.push(newRecipe)
        console.log('Store: Recipe added to local state:', newRecipe)
        console.log('Store: Recipe in store after push:', this.recipes[this.recipes.length - 1])
      } catch (error) {
        console.error('Store: Error in addRecipe:', error)
        
        // Fallback: Add recipe locally if API is not available
        if (error instanceof Error && (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED'))) {
          console.log('Store: Backend not available, adding recipe locally for demo purposes')
          const fallbackRecipe: Recipe = {
            ...recipeData,
            recipeId: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          console.log('Store: Fallback recipe object:', fallbackRecipe)
          console.log('Store: Fallback recipe ID:', fallbackRecipe.recipeId)
          console.log('Store: Fallback recipe ID type:', typeof fallbackRecipe.recipeId)
          this.recipes.push(fallbackRecipe)
          console.log('Store: Recipe added locally:', fallbackRecipe)
          console.log('Store: Recipe in store after push:', this.recipes[this.recipes.length - 1])
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
      
      // First, let's verify the recipe exists in our local state
      const localRecipe = this.recipes.find(r => r.recipeId === baseRecipeId)
      
      try {
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
          if (!backendRecipe || !Array.isArray(backendRecipe) || backendRecipe.length === 0) {
            throw new Error(`Recipe with ID ${baseRecipeId} not found in backend`)
          }
        } catch (backendError: any) {
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
        console.log('Store: Scaled recipe data length:', scaledRecipeData?.length)
        
        if (scaledRecipeData && Array.isArray(scaledRecipeData) && scaledRecipeData.length > 0) {
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
      } catch (error: any) {
        console.error('Store: Error in scaleRecipeManually:', error)
        if (error.response?.status === 500 && localRecipe) {
          console.warn('Store: Backend scaling failed with 500 error, creating fallback scaled recipe')
          
          // Create a fallback scaled recipe using local calculation
          const fallbackScaledRecipe: ScaledRecipe = {
            _id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            baseRecipeId: baseRecipeId,
            targetServings: targetServings,
            scaledIngredients: localRecipe.ingredients.map((ingredient: any) => ({
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
        const scaledRecipeId = response.scaledRecipeId
        
        // Fetch the created scaled recipe to add to our state
        const scaledRecipeData = await recipeScalerApi.getScaledRecipe({ 
          scaledRecipeId 
        })
        
        if (scaledRecipeData.length > 0) {
          this.scaledRecipes.push(scaledRecipeData[0])
          console.log('Store: Added AI scaled recipe to state:', scaledRecipeData[0])
        } else {
          console.warn('Store: No scaled recipe data returned from getScaledRecipe (AI)')
          console.log('Store: Creating fallback scaled recipe object for AI scaling')
          
          // Find the base recipe
          const localRecipe = this.recipes.find(r => r.recipeId === baseRecipeId)
          if (localRecipe) {
            // Fallback: Create a local scaled recipe object
            const fallbackScaledRecipe: ScaledRecipe = {
              _id: scaledRecipeId,
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
        
        // Wait a moment for the backend sync to generate tips
        console.log('Store: Waiting for backend sync to generate AI tips...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Fetch auto-generated tips related to this scaled recipe
        try {
          console.log('Store: Fetching auto-generated tips for scaled recipe:', scaledRecipeId)
          const baseRecipe = this.recipes.find(r => r.recipeId === baseRecipeId)
          
          if (baseRecipe && baseRecipe.cookingMethods.length > 0) {
            const scalingDirection = targetServings > baseRecipe.originalServings ? 'up' : 'down'
            const allNewTips: ScalingTip[] = []
            
            // Get list of existing tip IDs before fetching to identify new ones
            const existingTipIds = new Set(this.tips.map(t => t.tipId))
            
            // Fetch tips for each cooking method in the recipe
            // Try multiple strategies since backend-generated tips might not have relatedRecipeId set
            for (const cookingMethod of baseRecipe.cookingMethods) {
              try {
                // Strategy 1: Fetch tips without relatedRecipeId filter (gets all tips for this method/direction)
                // This will include the newly generated tips
                const tipsForMethod = await scalingTipsApi.getScalingTips({
                  cookingMethod: cookingMethod,
                  direction: scalingDirection,
                  relatedRecipeId: null // Get all tips, not filtered by recipe
                })
                
                console.log(`Store: Found ${tipsForMethod.length} total tips for ${cookingMethod} (${scalingDirection})`)
                
                // Filter to only get tips that:
                // 1. Are AI-generated (source === 'generated') AND
                // 2. Are related to the base recipe ID (if relatedRecipeId is set) OR
                // 3. Are newly created (not in our existing tips)
                const relevantTips = tipsForMethod.filter(tipDoc => {
                  // Check if it's an AI-generated tip
                  const isGenerated = tipDoc.source === 'generated'
                  
                  // Check if it's related to our recipe context
                  const relatesToRecipe = !tipDoc.relatedRecipeId || 
                                         tipDoc.relatedRecipeId === baseRecipeId ||
                                         tipDoc.relatedRecipeId === scaledRecipeId
                  
                  // Check if it's a new tip we haven't seen
                  const isNewTip = !existingTipIds.has(tipDoc._id)
                  
                  return isGenerated && relatesToRecipe && isNewTip
                })
                
                console.log(`Store: Filtered to ${relevantTips.length} relevant new AI-generated tips`)
                
                // Fetch full tip details and add to store
                for (const tipDoc of relevantTips) {
                  try {
                    const fullTipData = await scalingTipsApi.getScalingTipById({ tipId: tipDoc._id })
                    
                    const newTip: ScalingTip = {
                      tipId: fullTipData._id,
                      cookingMethod: fullTipData.cookingMethod,
                      direction: fullTipData.direction,
                      content: fullTipData.text,
                      addedBy: fullTipData.addedBy || 'AI',
                      relatedRecipeId: fullTipData.relatedRecipeId || scaledRecipeId
                    }
                    
                    allNewTips.push(newTip)
                    console.log('Store: Found new AI-generated tip:', newTip)
                  } catch (tipError) {
                    console.warn('Store: Failed to fetch full tip details for:', tipDoc._id, tipError)
                    // Add tip with available data if full fetch fails
                    const fallbackTip: ScalingTip = {
                      tipId: tipDoc._id,
                      cookingMethod: tipDoc.cookingMethod,
                      direction: tipDoc.direction,
                      content: tipDoc.text,
                      addedBy: tipDoc.addedBy || 'AI',
                      relatedRecipeId: tipDoc.relatedRecipeId || scaledRecipeId
                    }
                    allNewTips.push(fallbackTip)
                    console.log('Store: Added tip with partial data:', fallbackTip)
                  }
                }
              } catch (methodError) {
                console.warn(`Store: Failed to fetch tips for ${cookingMethod}:`, methodError)
              }
            }
            
            // Add all new tips to the store
            if (allNewTips.length > 0) {
              // Remove duplicates based on tipId
              const uniqueNewTips = allNewTips.filter((tip, index, self) => 
                index === self.findIndex(t => t.tipId === tip.tipId)
              )
              
              this.tips.push(...uniqueNewTips)
              console.log(`Store: Added ${uniqueNewTips.length} auto-generated AI tips to store`)
              console.log('Store: Tip IDs added:', uniqueNewTips.map(t => t.tipId))
            } else {
              console.log('Store: No new tips found for this scaled recipe')
              console.log('Store: Existing tip count:', this.tips.length)
              console.log('Store: Existing tip IDs:', Array.from(existingTipIds))
            }
          } else {
            console.log('Store: Base recipe not found or has no cooking methods, skipping tip fetch')
          }
        } catch (tipError) {
          console.warn('Store: Error fetching auto-generated tips (non-fatal):', tipError)
          // Don't fail the scaling operation if tip fetching fails
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
    },

    async removeScaledRecipe(scaledRecipeId: string) {
      this.loading = true
      this.error = null
      
      try {
        await recipeScalerApi.removeScaledRecipe({ scaledRecipeId })
        // Remove from local state
        this.scaledRecipes = this.scaledRecipes.filter(scaled => scaled._id !== scaledRecipeId)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to remove scaled recipe'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear all data (used when logging out)
    clearAllData() {
      this.recipes = []
      this.scaledRecipes = []
      this.tips = []
      this.error = null
      console.log('Store: All recipe data cleared')
    },

    // Add a tip to the store (used when creating new tips)
    addTip(tip: ScalingTip) {
      this.tips.push(tip)
      console.log('Store: Tip added:', tip)
    },

    // Remove a tip from the store (used when deleting tips)
    removeTip(tipId: string) {
      const index = this.tips.findIndex(tip => tip.tipId === tipId)
      if (index > -1) {
        this.tips.splice(index, 1)
        console.log('Store: Tip removed:', tipId)
      }
    },

    // Load user-specific data (used when logging in or restoring a session)
    async loadUserData() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Store: Loading user-specific data')
        // Get current user from auth store
        const { useAuthStore } = await import('./auth')
        const authStore = useAuthStore()
        const username = authStore.user?.username
        const userId = authStore.user?.id
        if (!username) {
          console.warn('Store: No username found; skipping load')
          this.clearAllData()
          return
        }

        // 1) Load recipes for this author
        // Since the author field can be either username or user ID, fetch both
        const recipePromises: Promise<any>[] = [
          recipeApi.getRecipesByAuthor({ author: username })
        ]
        
        // Also fetch by user ID if available and different from username
        if (userId && userId !== username) {
          recipePromises.push(recipeApi.getRecipesByAuthor({ author: userId }))
        }
        
        const recipeResults = await Promise.allSettled(recipePromises)
        const allRecipeDocs: any[] = []
        
        // Combine results from both queries
        for (const result of recipeResults) {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allRecipeDocs.push(...result.value)
          } else if (result.status === 'rejected') {
            console.warn('Store: Failed to fetch recipes by author:', result.reason)
          }
        }
        
        // Remove duplicates based on recipeId
        const uniqueRecipeDocs = allRecipeDocs.filter((doc, index, self) =>
          index === self.findIndex(d => d._id === doc._id)
        )
        
        this.recipes = (uniqueRecipeDocs || []).map(doc => ({
          recipeId: doc._id,
          author: doc.author,
          name: doc.name,
          originalServings: doc.originalServings,
          ingredients: doc.ingredients,
          cookingMethods: doc.cookingMethods
        }))
        console.log(`Store: Loaded ${this.recipes.length} recipes for user (username: ${username}, userId: ${userId || 'N/A'})`)

        // 2) Load scaled recipes for each base recipe in parallel
        const allScaled: ScaledRecipe[] = []
        const scaledPromises = this.recipes.map(async (r) => {
          try {
            const scaledForBase = await recipeScalerApi.getScaledRecipesByBaseRecipe({ baseRecipeId: r.recipeId })
            if (Array.isArray(scaledForBase) && scaledForBase.length > 0) {
              allScaled.push(...scaledForBase)
            }
          } catch (e) {
            console.warn('Store: Failed to load scaled recipes for base', r.recipeId, e)
          }
        })
        await Promise.allSettled(scaledPromises)
        this.scaledRecipes = allScaled
        console.log('Store: Loaded scaled recipes count:', this.scaledRecipes.length)

        // 3) Load tips for this user
        // Since the API doesn't have a "get all tips for user" endpoint,
        // we'll try to load tips for common cooking methods and directions
        // and then filter by the current user
        const cookingMethods = ['baking', 'frying', 'boiling', 'grilling', 'roasting', 'steaming']
        const directions: ('up' | 'down')[] = ['up', 'down']
        const allTips: ScalingTip[] = []
        
        // Create all tip loading promises in parallel
        const tipPromises: Promise<void>[] = []
        for (const method of cookingMethods) {
          for (const direction of directions) {
            tipPromises.push(
              (async () => {
                try {
                  const tipsForMethod = await scalingTipsApi.getScalingTips({
                    cookingMethod: method,
                    direction: direction,
                    relatedRecipeId: null // Get general tips, not recipe-specific
                  })
                  if (Array.isArray(tipsForMethod) && tipsForMethod.length > 0) {
                    // Keep only tips authored by the current user, OR AI-generated tips
                    // that are attached to this user's scaled recipes
                    // Since addedBy can be either username or user ID, check both
                    const userScaledIds = new Set(this.scaledRecipes.map(s => s._id))
                    const filteredForUser = tipsForMethod.filter(t =>
                      (t.addedBy === username || t.addedBy === userId) ||
                      (t.source === 'generated' && t.relatedRecipeId != null && userScaledIds.has(t.relatedRecipeId))
                    )

                    // Convert TipDocOutput to ScalingTip format
                    const convertedTips = filteredForUser.map(tip => ({
                      tipId: tip._id,
                      cookingMethod: tip.cookingMethod,
                      direction: tip.direction,
                      content: tip.text,
                      addedBy: tip.addedBy || 'Unknown',
                      relatedRecipeId: tip.relatedRecipeId
                    }))
                    allTips.push(...convertedTips)
                  }
                } catch (e) {
                  console.warn('Store: Failed to load tips for', method, direction, e)
                }
              })()
            )
          }
        }
        
        // Wait for all tip requests to complete (or timeout)
        await Promise.allSettled(tipPromises)
        
        // Remove duplicates based on tipId
        const uniqueTips = allTips.filter((tip, index, self) => 
          index === self.findIndex(t => t.tipId === tip.tipId)
        )
        this.tips = uniqueTips
        console.log('Store: Loaded tips count after filtering for user:', this.tips.length)
      } catch (error: any) {
        console.error('Store: Error loading user data:', error)
        this.error = error.message || 'Failed to load user data'
      } finally {
        this.loading = false
      }
    }
  }
})
