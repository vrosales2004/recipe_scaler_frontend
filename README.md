# Recipe Scaler Frontend

A modern Vue.js frontend application for the Recipe Scaler API, built with Vite, TypeScript, Vue Router, and Pinia.

## User Journey
A user logs into the Recipe Application to manage their personal recipe collection. They start by adding a new recipe given to them by their family, "Home Made Lasagna," including the ingredients, cooking methods, and the original serving size. Later, they decide to scale the recipe to serve a larger group for a work event. Using the app's scaling feature to adjust the ingredient quantities for 12 servings. The app automatically saves the scaled version, and the user can view it alongside the original recipe. While exploring the app, they discover scaling tips for lasagna, such as adjusting baking times for larger portions, and decide to add their own tip about layering techniques. Finally, the user removes an outdated recipe from their collection and refreshes their scaled recipes to ensure everything is up-to-date. Throughout, the app provides a seamless experience, with clear feedback and error handling for any issues.

## Features

- **Modern Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Vue Router** for client-side routing
- **Pinia** for state management
- **Responsive design** with modern CSS

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── Home.vue        # Landing page
│   ├── Recipes.vue     # Recipe management
│   ├── ScaledRecipes.vue # Scaled recipe viewing
│   └── Tips.vue        # Scaling tips management
├── stores/             # Pinia stores
│   └── recipe.ts       # Recipe state management
├── router/             # Vue Router configuration
│   └── index.ts        # Route definitions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.vue             # Root component
├── main.ts             # Application entry point
└── style.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## API Integration

The application includes a complete TypeScript API client library generated from the OpenAPI specification (`api-spec.json`). The API client is located in `src/services/api/` and provides type-safe access to all backend endpoints.

### API Client Features

- **Type-safe API calls** with full TypeScript support
- **Axios-based HTTP client** with automatic error handling
- **Modular design** with separate clients for each concept
- **Configurable base URL** (uses Vite proxy in development, configurable for production)

### Key API Endpoints

- **Recipes**: Add, remove, and manage recipes
- **Recipe Scaling**: Manual and AI-powered recipe scaling
- **Scaling Tips**: Context-aware scaling advice

### CORS Configuration

The application uses Vite's proxy feature to handle CORS issues during development. The proxy configuration in `vite.config.ts` forwards all `/api` requests to `http://localhost:8000`.

For production deployment, ensure your backend server is configured with proper CORS headers or deploy both frontend and backend on the same domain.

### Usage Example

```typescript
import { recipeApi, recipeScalerApi } from '@/services/api'

// Add a recipe
const response = await recipeApi.addRecipe({
  author: 'John Doe',
  name: 'Chocolate Cake',
  originalServings: 8,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cups' }
  ],
  cookingMethods: ['baking']
})

// Scale a recipe with AI
const scaledRecipe = await recipeScalerApi.scaleRecipeAI({
  baseRecipeId: response.recipe,
  targetServings: 16
})

// Scale a recipe manually (linear scaling)
const manualScaledRecipe = await recipeScalerApi.scaleManually({
  baseRecipeId: response.recipe,
  targetServings: 12
})
```

## State Management

The application uses Pinia for state management with the following stores:

- **Recipe Store** (`src/stores/recipe.ts`): Legacy store for backward compatibility
  - State: recipes, scaledRecipes, tips, loading, error
  - Actions: addRecipe, removeRecipe, scaleRecipeManually, scaleRecipeAI
  - Getters: getRecipeById, getScaledRecipesByBaseId, getTipsByCookingMethod

- **Concepts Store** (`src/stores/concepts.ts`): Modern store with full API integration
  - State: recipes, scaledRecipes, scalingTips, loading, error
  - Actions: All CRUD operations for recipes, scaling, and tips
  - Getters: Comprehensive getters for all data relationships
  - Features: Automatic API integration, error handling, data synchronization

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add new views in `src/views/`
3. Update routes in `src/router/index.ts`
4. Extend stores in `src/stores/` as needed

### TypeScript

The project is fully configured with TypeScript. All components use the Composition API with `<script setup lang="ts">`.

### Styling

- Global styles in `src/style.css`
- Component-scoped styles using `<style scoped>`
- Responsive design with CSS Grid and Flexbox

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Follow Vue.js and TypeScript best practices
2. Use the Composition API with `<script setup>`
3. Add proper TypeScript types
4. Write responsive, accessible components
5. Test your changes thoroughly

## License

This project is part of the Recipe Scaler application suite.
