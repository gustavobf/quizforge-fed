<template>
  <div id="app">
    <nav>
      <router-link to="/">🏠 Home</router-link>
      <router-link to="/questions">❓ Questions</router-link>
      <router-link to="/history">📚 History</router-link>
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
  background: #42b883;
  padding: 15px 20px;
  display: flex;
  gap: 20px;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav a:hover {
  text-decoration: underline;
}

nav a.router-link-active {
  text-decoration: underline;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>