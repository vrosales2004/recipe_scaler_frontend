// Generated TypeScript types from OpenAPI specification

export interface IngredientData {
  name: string;
  quantity: number;
  unit: string;
  scalingContext?: string | null;
  preparation?: string | null;
}

export interface RecipeGenerationContext {
  recipeId: string;
  author: string;
  name: string;
  originalServings: number;
  ingredients: IngredientData[];
  cookingMethods: string[];
}

export interface AddRecipeRequest {
  author: string;
  name: string;
  originalServings: number;
  ingredients: IngredientData[];
  cookingMethods: string[];
  sessionId?: string; // Optional - will be auto-injected by API client if not provided
}

export interface AddRecipeResponse {
  recipe: string;
}

export interface RemoveRecipeRequest {
  recipeId: string;
  sessionId?: string; // Optional - will be auto-injected by API client if not provided
}

export interface GetRecipeByIdRequest {
  recipeId: string;
}

export interface GetRecipesByAuthorRequest {
  author: string;
}

export interface GetRecipeByNameRequest {
  recipeName: string;
  author: string;
}

export interface RecipeDocOutput {
  _id: string;
  author: string;
  name: string;
  originalServings: number;
  ingredients: IngredientData[];
  cookingMethods: string[];
}

export interface ScaleManuallyRequest {
  baseRecipeId: string;
  targetServings: number;
  sessionId?: string; // Optional - will be auto-injected by API client if not provided
}

export interface ScaleRecipeAIRequest {
  baseRecipeId: string;
  targetServings: number;
  sessionId?: string; // Optional - will be auto-injected by API client if not provided
}

export interface ScaleRecipeResponse {
  scaledRecipeId: string;
}

export interface ScaledRecipe {
  _id: string;
  baseRecipeId: string;
  targetServings: number;
  scaledIngredients: IngredientData[];
  scalingMethod: 'manual' | 'ai';
}

export interface GetScaledRecipeRequest {
  scaledRecipeId: string;
}

export interface RemoveScaledRecipeRequest {
  scaledRecipeId: string;
  sessionId?: string; // Optional - will be auto-injected by API client if not provided
}

export interface FindScaledRecipeRequest {
  baseRecipeId: string;
  targetServings: number;
}

export interface GetScaledRecipesByBaseRecipeRequest {
  baseRecipeId: string;
}

export interface AddManualScalingTipRequest {
  cookingMethod: string;
  direction: 'up' | 'down';
  tipText: string;
  addedBy?: string | null;
}

export interface AddScalingTipResponse {
  tipId: string;
}

export interface RecipeGenerationContextForTips {
  recipeId: string;
  name: string;
  originalServings: number;
  targetServings: number;
  ingredients: IngredientData[];
  cookingMethods: string[];
}

export interface RequestTipGenerationRequest {
  recipeContext: RecipeGenerationContextForTips;
}

export interface RequestTipGenerationResponse {
  tipIds: string[];
}

export interface RemoveScalingTipRequest {
  tipId: string;
}

export interface GetScalingTipsRequest {
  cookingMethod: string;
  direction: 'up' | 'down';
  relatedRecipeId?: string | null;
}

export interface GetScalingTipByIdRequest {
  tipId: string;
}

export interface TipDocOutput {
  _id: string;
  text: string;
  cookingMethod: string;
  direction: 'up' | 'down';
  source: 'manual' | 'generated';
  relatedRecipeId?: string | null;
  addedBy?: string | null;
}

// UserAuthentication types
export interface UserRegisterRequest {
  username: string;
  password: string;
}

export interface UserRegisterResponse {
  user: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  user: string;
  sessionId: string;
}

export interface UserLogoutRequest {
  sessionId: string;
}

export interface GetActiveSessionRequest {
  sessionId: string;
}

export interface SessionDocOutput {
  user: string;
  sessionId: string;
  expirationTime: number;
}

export interface GetUserByUsernameRequest {
  username: string;
}

export interface GetUserByIdRequest {
  userId: string;
}

export interface UserDocOutput {
  _id: string;
  username: string;
}

export interface ErrorResponse {
  error: string;
}

// API Response types
export type ApiResponse<T> = T | ErrorResponse;

// Recipe concept types (for backward compatibility)
export interface Recipe {
  recipeId: string;
  author: string;
  name: string;
  originalServings: number;
  ingredients: IngredientData[];
  cookingMethods: string[];
}

export interface ScalingTip {
  tipId: string;
  cookingMethod: string;
  direction: 'up' | 'down';
  content: string;
  addedBy: string;
  relatedRecipeId?: string | null;
}
