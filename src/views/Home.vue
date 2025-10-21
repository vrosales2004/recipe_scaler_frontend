<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Recipe Scaler</h1>
      <p class="subtitle">
        Scale your recipes up or down with ease using AI-powered scaling or manual adjustments.
        Get expert tips for perfect results every time.
      </p>
      <div class="cta-buttons">
        <router-link to="/recipes" class="btn btn-primary">View Recipes</router-link>
        <router-link to="/scaled-recipes" class="btn btn-secondary">Scaled Recipes</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>AI-Powered Scaling</h3>
        <p>Let our AI intelligently scale your recipes while maintaining flavor profiles and cooking techniques.</p>
      </div>
      <div class="feature-card">
        <h3>Manual Scaling</h3>
        <p>Take control with manual scaling options for precise ingredient adjustments.</p>
      </div>
      <div class="feature-card">
        <h3>Expert Tips</h3>
        <p>Get contextual scaling tips based on cooking methods and scaling directions.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page component
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
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
  background-color: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-secondary:hover {
  background-color: #3498db;
  color: white;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.feature-card {
  padding: 2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}
</style>
