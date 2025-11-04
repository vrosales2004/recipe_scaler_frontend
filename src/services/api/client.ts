import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AddRecipeRequest,
  AddRecipeResponse,
  RemoveRecipeRequest,
  GetRecipeByIdRequest,
  GetRecipesByAuthorRequest,
  GetRecipeByNameRequest,
  RecipeDocOutput,
  ScaleManuallyRequest,
  ScaleRecipeAIRequest,
  ScaleRecipeResponse,
  GetScaledRecipeRequest,
  RemoveScaledRecipeRequest,
  FindScaledRecipeRequest,
  GetScaledRecipesByBaseRecipeRequest,
  ScaledRecipe,
  AddManualScalingTipRequest,
  AddScalingTipResponse,
  RequestTipGenerationRequest,
  RequestTipGenerationResponse,
  RemoveScalingTipRequest,
  GetScalingTipsRequest,
  GetScalingTipByIdRequest,
  TipDocOutput,
  UserRegisterRequest,
  UserRegisterResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserLogoutRequest,
  GetActiveSessionRequest,
  SessionDocOutput,
  GetUserByUsernameRequest,
  GetUserByIdRequest,
  UserDocOutput
} from './types';

export class ApiClient {
  private client: AxiosInstance;

  // Helper method to get sessionId from auth store
  private async getSessionId(): Promise<string | null> {
    try {
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();
      return authStore.currentSessionId;
    } catch (error) {
      console.warn('API Client: Failed to get sessionId from auth store:', error);
      return null;
    }
  }

  constructor(baseURL: string = '') {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // Increased to 30 seconds for production
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for better logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Client: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Client: Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: any) => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.code === 'ECONNABORTED') {
          console.error('API Error: Request timed out after 30 seconds');
        }
        return Promise.reject(error);
      }
    );
  }

  // Recipe endpoints
  async addRecipe(request: AddRecipeRequest): Promise<AddRecipeResponse> {
    // Automatically inject sessionId if not provided
    if (!request.sessionId) {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        throw new Error('Session ID is required but not available. Please log in.');
      }
      request.sessionId = sessionId;
    }
    
    console.log('API Client: Making POST request to /api/Recipe/addRecipe with:', request);
    console.log('API Client: Base URL:', this.client.defaults.baseURL);
    
    try {
      const response: AxiosResponse<AddRecipeResponse> = await this.client.post(
        '/api/Recipe/addRecipe',
        request
      );
      console.log('API Client: Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Client: Error in addRecipe:', error);
      throw error;
    }
  }

  async removeRecipe(request: RemoveRecipeRequest): Promise<void> {
    // Automatically inject sessionId if not provided
    if (!request.sessionId) {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        throw new Error('Session ID is required but not available. Please log in.');
      }
      request.sessionId = sessionId;
    }
    
    await this.client.post('/api/Recipe/removeRecipe', request);
  }

  async getRecipeById(request: GetRecipeByIdRequest): Promise<RecipeDocOutput[]> {
    const response: AxiosResponse<RecipeDocOutput[]> = await this.client.post(
      '/api/Recipe/_getRecipeById',
      request
    );
    return response.data;
  }

  async getRecipesByAuthor(request: GetRecipesByAuthorRequest): Promise<RecipeDocOutput[]> {
    const response: AxiosResponse<RecipeDocOutput[]> = await this.client.post(
      '/api/Recipe/_getRecipesByAuthor',
      request
    );
    return response.data;
  }

  async getRecipeByName(request: GetRecipeByNameRequest): Promise<RecipeDocOutput[]> {
    const response: AxiosResponse<RecipeDocOutput[]> = await this.client.post(
      '/api/Recipe/_getRecipeByName',
      request
    );
    return response.data;
  }

  // RecipeScaler endpoints
  async scaleManually(request: ScaleManuallyRequest): Promise<ScaleRecipeResponse> {
    // Automatically inject sessionId if not provided
    if (!request.sessionId) {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        throw new Error('Session ID is required but not available. Please log in.');
      }
      request.sessionId = sessionId;
    }
    
    console.log('API Client: scaleManually request payload:', request);
    console.log('API Client: baseURL:', this.client.defaults.baseURL);
    console.log('API Client: full URL will be:', this.client.defaults.baseURL + '/api/RecipeScaler/scaleManually');
    
    try {
      const response: AxiosResponse<ScaleRecipeResponse> = await this.client.post(
        '/api/RecipeScaler/scaleManually',
        request
      );
      console.log('API Client: scaleManually response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API Client: scaleManually error details:', error);
      if (error.response) {
        console.error('API Client: Error response status:', error.response.status);
        console.error('API Client: Error response data:', error.response.data);
        console.error('API Client: Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('API Client: No response received:', error.request);
      } else {
        console.error('API Client: Error setting up request:', error.message);
      }
      throw error;
    }
  }

  async scaleRecipeAI(request: ScaleRecipeAIRequest): Promise<ScaleRecipeResponse> {
    // Automatically inject sessionId if not provided
    if (!request.sessionId) {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        throw new Error('Session ID is required but not available. Please log in.');
      }
      request.sessionId = sessionId;
    }
    
    const response: AxiosResponse<ScaleRecipeResponse> = await this.client.post(
      '/api/RecipeScaler/scaleRecipeAI',
      request
    );
    return response.data;
  }

  async getScaledRecipe(request: GetScaledRecipeRequest): Promise<ScaledRecipe[]> {
    const response: AxiosResponse<ScaledRecipe[]> = await this.client.post(
      '/api/RecipeScaler/_getScaledRecipe',
      request
    );
    return response.data;
  }

  async removeScaledRecipe(request: RemoveScaledRecipeRequest): Promise<void> {
    // Automatically inject sessionId if not provided
    if (!request.sessionId) {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        throw new Error('Session ID is required but not available. Please log in.');
      }
      request.sessionId = sessionId;
    }
    
    await this.client.post('/api/RecipeScaler/removeScaledRecipe', request);
  }

  async findScaledRecipe(request: FindScaledRecipeRequest): Promise<ScaledRecipe[]> {
    const response: AxiosResponse<ScaledRecipe[]> = await this.client.post(
      '/api/RecipeScaler/_findScaledRecipe',
      request
    );
    return response.data;
  }

  async getScaledRecipesByBaseRecipe(request: GetScaledRecipesByBaseRecipeRequest): Promise<ScaledRecipe[]> {
    const response: AxiosResponse<ScaledRecipe[]> = await this.client.post(
      '/api/RecipeScaler/_getScaledRecipesByBaseRecipe',
      request
    );
    return response.data;
  }

  // ScalingTips endpoints
  async addManualScalingTip(request: AddManualScalingTipRequest): Promise<AddScalingTipResponse> {
    const response: AxiosResponse<AddScalingTipResponse> = await this.client.post(
      '/api/ScalingTips/addManualScalingTip',
      request
    );
    return response.data;
  }

  async requestTipGeneration(request: RequestTipGenerationRequest): Promise<RequestTipGenerationResponse> {
    const response: AxiosResponse<RequestTipGenerationResponse> = await this.client.post(
      '/api/ScalingTips/requestTipGeneration',
      request
    );
    return response.data;
  }

  async removeScalingTip(request: RemoveScalingTipRequest): Promise<void> {
    await this.client.post('/api/ScalingTips/removeScalingTip', request);
  }

  async getScalingTips(request: GetScalingTipsRequest): Promise<TipDocOutput[]> {
    const response: AxiosResponse<TipDocOutput[]> = await this.client.post(
      '/api/ScalingTips/_getScalingTips',
      request
    );
    return response.data;
  }

  async getScalingTipById(request: GetScalingTipByIdRequest): Promise<TipDocOutput> {
    const response: AxiosResponse<TipDocOutput> = await this.client.post(
      '/api/ScalingTips/_getScalingTipById',
      request
    );
    return response.data;
  }

  // UserAuthentication endpoints
  async registerUser(request: UserRegisterRequest): Promise<UserRegisterResponse> {
    const response: AxiosResponse<UserRegisterResponse> = await this.client.post(
      '/api/UserAuthentication/register',
      request
    );
    return response.data;
  }

  async loginUser(request: UserLoginRequest): Promise<UserLoginResponse> {
    const response: AxiosResponse<UserLoginResponse> = await this.client.post(
      '/api/UserAuthentication/login',
      request
    );
    return response.data;
  }

  async logoutUser(request: UserLogoutRequest): Promise<void> {
    await this.client.post('/api/UserAuthentication/logout', request);
  }

  async getActiveSession(request: GetActiveSessionRequest): Promise<SessionDocOutput[]> {
    const response: AxiosResponse<SessionDocOutput[]> = await this.client.post(
      '/api/UserAuthentication/_getActiveSession',
      request
    );
    return response.data;
  }

  async getUserByUsername(request: GetUserByUsernameRequest): Promise<UserDocOutput[]> {
    const response: AxiosResponse<UserDocOutput[]> = await this.client.post(
      '/api/UserAuthentication/_getUserByUsername',
      request
    );
    return response.data;
  }

  async getUserById(request: GetUserByIdRequest): Promise<UserDocOutput[]> {
    const response: AxiosResponse<UserDocOutput[]> = await this.client.post(
      '/api/UserAuthentication/_getUserById',
      request
    );
    return response.data;
  }

  // Utility methods
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }

  // Add auth token if needed
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Create and export a default instance
// In development, Vite proxy handles the /api routing to localhost:8000
// In production, use environment variable or default to /api
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
console.log('API Client: Initializing with base URL:', API_BASE);
console.log('API Client: VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
export const apiClient = new ApiClient(API_BASE);

// Export individual concept clients for better organization
export class RecipeApi {
  constructor(private client: ApiClient) {}

  async addRecipe(request: AddRecipeRequest): Promise<AddRecipeResponse> {
    return this.client.addRecipe(request);
  }

  async removeRecipe(request: RemoveRecipeRequest): Promise<void> {
    return this.client.removeRecipe(request);
  }

  async getRecipeById(request: GetRecipeByIdRequest): Promise<RecipeDocOutput[]> {
    return this.client.getRecipeById(request);
  }

  async getRecipesByAuthor(request: GetRecipesByAuthorRequest): Promise<RecipeDocOutput[]> {
    return this.client.getRecipesByAuthor(request);
  }

  async getRecipeByName(request: GetRecipeByNameRequest): Promise<RecipeDocOutput[]> {
    return this.client.getRecipeByName(request);
  }
}

export class RecipeScalerApi {
  constructor(private client: ApiClient) {}

  async scaleManually(request: ScaleManuallyRequest): Promise<ScaleRecipeResponse> {
    return this.client.scaleManually(request);
  }

  async scaleRecipeAI(request: ScaleRecipeAIRequest): Promise<ScaleRecipeResponse> {
    return this.client.scaleRecipeAI(request);
  }

  async getScaledRecipe(request: GetScaledRecipeRequest): Promise<ScaledRecipe[]> {
    return this.client.getScaledRecipe(request);
  }

  async removeScaledRecipe(request: RemoveScaledRecipeRequest): Promise<void> {
    return this.client.removeScaledRecipe(request);
  }

  async findScaledRecipe(request: FindScaledRecipeRequest): Promise<ScaledRecipe[]> {
    return this.client.findScaledRecipe(request);
  }

  async getScaledRecipesByBaseRecipe(request: GetScaledRecipesByBaseRecipeRequest): Promise<ScaledRecipe[]> {
    return this.client.getScaledRecipesByBaseRecipe(request);
  }
}

export class ScalingTipsApi {
  constructor(private client: ApiClient) {}

  async addManualScalingTip(request: AddManualScalingTipRequest): Promise<AddScalingTipResponse> {
    return this.client.addManualScalingTip(request);
  }

  async requestTipGeneration(request: RequestTipGenerationRequest): Promise<RequestTipGenerationResponse> {
    return this.client.requestTipGeneration(request);
  }

  async removeScalingTip(request: RemoveScalingTipRequest): Promise<void> {
    return this.client.removeScalingTip(request);
  }

  async getScalingTips(request: GetScalingTipsRequest): Promise<TipDocOutput[]> {
    return this.client.getScalingTips(request);
  }

  async getScalingTipById(request: GetScalingTipByIdRequest): Promise<TipDocOutput> {
    return this.client.getScalingTipById(request);
  }
}

export class UserAuthenticationApi {
  constructor(private client: ApiClient) {}

  async registerUser(request: UserRegisterRequest): Promise<UserRegisterResponse> {
    return this.client.registerUser(request);
  }

  async loginUser(request: UserLoginRequest): Promise<UserLoginResponse> {
    return this.client.loginUser(request);
  }

  async logoutUser(request: UserLogoutRequest): Promise<void> {
    return this.client.logoutUser(request);
  }

  async getActiveSession(request: GetActiveSessionRequest): Promise<SessionDocOutput[]> {
    return this.client.getActiveSession(request);
  }

  async getUserByUsername(request: GetUserByUsernameRequest): Promise<UserDocOutput[]> {
    return this.client.getUserByUsername(request);
  }

  async getUserById(request: GetUserByIdRequest): Promise<UserDocOutput[]> {
    return this.client.getUserById(request);
  }
}

// Export concept-specific API instances
export const recipeApi = new RecipeApi(apiClient);
export const recipeScalerApi = new RecipeScalerApi(apiClient);
export const scalingTipsApi = new ScalingTipsApi(apiClient);
export const userAuthenticationApi = new UserAuthenticationApi(apiClient);
