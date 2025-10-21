// API Service exports
export * from './types';
export * from './client';

// Re-export commonly used types and instances
export { apiClient, recipeApi, recipeScalerApi, scalingTipsApi, userAuthenticationApi } from './client';
export type { 
  Recipe, 
  ScaledRecipe, 
  ScalingTip, 
  IngredientData,
  AddRecipeRequest,
  AddRecipeResponse,
  ScaleRecipeResponse,
  RecipeDocOutput,
  TipDocOutput,
  UserDocOutput,
  SessionDocOutput,
  ErrorResponse
} from './types';
