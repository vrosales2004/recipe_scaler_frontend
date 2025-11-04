# API Service Documentation

This directory contains the complete TypeScript API client library generated from the OpenAPI specification for the Recipe Scaler backend.

## Structure

```
src/services/api/
├── types.ts          # TypeScript type definitions
├── client.ts         # Axios-based API client
└── index.ts          # Main exports
```

## Features

- **Type-safe API calls** with full TypeScript support
- **Axios-based HTTP client** with error handling
- **Modular design** with separate clients for each concept
- **Automatic request/response validation** based on OpenAPI schema
- **Configurable base URL** (defaults to `http://localhost:8000`)

## Usage

### Basic API Client

```typescript
import { apiClient } from '@/services/api'

// Add a recipe
const response = await apiClient.addRecipe({
  author: 'John Doe',
  name: 'Chocolate Cake',
  originalServings: 8,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cups' },
    { name: 'sugar', quantity: 1, unit: 'cup' }
  ],
  cookingMethods: ['baking']
})
```

### Concept-Specific Clients

```typescript
import { recipeApi, recipeScalerApi, scalingTipsApi } from '@/services/api'

// Recipe operations
const recipe = await recipeApi.addRecipe(recipeData)
await recipeApi.removeRecipe({ recipeId: '123' })

// Recipe scaling
const scaledRecipe = await recipeScalerApi.scaleManually({
  baseRecipeId: '123',
  targetServings: 16,
  scaledIngredients: [...]
})

// Scaling tips
const tip = await scalingTipsApi.addManualScalingTip({
  cookingMethod: 'baking',
  direction: 'up',
  content: 'Increase oven temperature by 25°F',
  addedBy: 'chef123'
})
```

### Pinia Store Integration

```typescript
import { useConceptsStore } from '@/stores/concepts'

const conceptsStore = useConceptsStore()

// Add a recipe (automatically updates store state)
const recipeId = await conceptsStore.addRecipe({
  author: 'Jane Smith',
  name: 'Apple Pie',
  originalServings: 6,
  ingredients: [...],
  cookingMethods: ['baking']
})

// Scale a recipe
const scaledRecipeId = await conceptsStore.scaleRecipeAI('recipe123', 12)
```

## API Endpoints

### Recipe Management
- `POST /Recipe/addRecipe` - Add a new recipe (requires sessionId for authentication)
- `POST /Recipe/removeRecipe` - Remove a recipe (requires sessionId for authentication)

### Recipe Scaling
- `POST /RecipeScaler/scaleManually` - Manual recipe scaling (requires sessionId for authentication)
- `POST /RecipeScaler/scaleRecipeAI` - AI-powered recipe scaling (requires sessionId for authentication)
- `POST /RecipeScaler/_getScaledRecipe` - Get specific scaled recipe
- `POST /RecipeScaler/_findScaledRecipe` - Find scaled recipes by criteria

### Scaling Tips
- `POST /ScalingTips/addManualScalingTip` - Add manual scaling tip
- `POST /ScalingTips/requestTipGeneration` - Generate AI tips
- `POST /ScalingTips/removeScalingTip` - Remove scaling tip

## Configuration

### Base URL Configuration

```typescript
import { apiClient } from '@/services/api'

// Change base URL for different environments
apiClient.setBaseURL('https://api.recipescaler.com')
```

### Authentication and Session Management

The following endpoints require sessionId for authentication:
- `POST /Recipe/addRecipe`
- `POST /Recipe/removeRecipe`
- `POST /RecipeScaler/scaleManually`
- `POST /RecipeScaler/scaleRecipeAI`

The API client automatically injects the `sessionId` from the auth store when calling these endpoints. You don't need to manually pass `sessionId` in the request - it will be retrieved automatically from the current user session.

If no session is available, these endpoints will throw an error asking the user to log in.

```typescript
import { apiClient } from '@/services/api'

// Set auth token (for future use if needed)
apiClient.setAuthToken('your-jwt-token')

// Remove auth token
apiClient.removeAuthToken()
```

## Error Handling

The API client includes automatic error handling and logging:

```typescript
try {
  const result = await recipeApi.addRecipe(recipeData)
  console.log('Recipe added:', result.recipeId)
} catch (error) {
  console.error('Failed to add recipe:', error.message)
  // Error is automatically logged by the client
}
```

## Type Safety

All API calls are fully typed based on the OpenAPI specification:

```typescript
// Request types are enforced
const request: AddRecipeRequest = {
  author: 'string',      // ✅ Required string
  name: 'string',        // ✅ Required string
  originalServings: 8,   // ✅ Required number
  ingredients: [...],   // ✅ Required IngredientData[]
  cookingMethods: [...], // ✅ Required string[]
  sessionId: '...'       // ⚠️ Optional - auto-injected by API client if not provided
}

// Response types are inferred
const response: AddRecipeResponse = await recipeApi.addRecipe(request)
// response.recipeId is typed as string
```

## Development

When the OpenAPI specification changes:

1. Update `types.ts` with new type definitions
2. Update `client.ts` with new endpoint methods
3. Update `index.ts` exports if needed
4. Update Pinia stores to use new functionality

The API client is designed to be easily maintainable and extensible as the backend evolves.
