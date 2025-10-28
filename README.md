# Recipe Scaler Frontend

A modern Vue.js frontend application for the Recipe Scaler API, built with Vite, TypeScript, Vue Router, and Pinia.

## Example User Journey
A new user signs up for the Recipe Scaler and logs in to explore its features. They start by browsing the app's collection of scaling tips and discover AI-generated advice for bread recipes. Intrigued, they add their own family recipe, "Artisan Sourdough Bread," including the ingredients, cooking methods, and original serving size. Instead of manually scaling the recipe, they use the AI scaling feature to adjust the recipe for 3 loaves instead of 1. The AI scales each ingredient quantity while taking into account ingredients that shouldn't be scaled exactly linearly like yeast or salt. The user saves the scaled recipe and views it alongside the original. They also explore AI-generated tips for bread baking, such as "use a Dutch oven for better crust development" and "allow the dough to rest for 30 minutes after mixing for better gluten formation." Impressed by the AI's insights, they add their own tip about using a steam tray in the oven for a crispier crust. Finally, the user logs out, confident that their recipes and tips are securely saved for the next time they want to bake some sourdough!

#### Ingredients:
1. **Bread Flour** - 500g  
   *Scales linearly to maintain hydration ratio.*
2. **Water** - 350g  
   *Scales linearly to maintain hydration ratio.*
3. **Salt** - 10g  
   *Scaled slightly downward for larger batches to avoid over-salting.*
4. **Sourdough Starter** - 100g  
   *Scaled linearly, but adjustments may be needed based on starter activity.*
5. **Yeast (optional)** - 2g  
   *Scaled non-linearly, as too much yeast can cause over-proofing.*

[Video of User Journey](./User_Journey_RecipeScaler.mov)

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
