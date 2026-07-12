<template>
  <div id="app">
    <nav>
      <div class="nav-container">
        <router-link to="/">Home</router-link>
        <router-link to="/subjects">Subjects</router-link>
        <router-link to="/questions">Questions</router-link>
        <router-link to="/history">History</router-link>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
}

nav {
  background: #1976d2;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  gap: 20px;
  justify-content: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
  text-decoration: none;
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  text-decoration: none;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Estilos globais para botões */
.btn-primary {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e0e0e0;
  color: #2c3e50;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

/* Links */
a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Inputs */
input:focus, 
select:focus, 
textarea:focus {
  border-color: #1976d2 !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
}

/* Loading spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>