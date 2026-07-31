<template>
  <div id="app">
    <nav v-if="authStore.isAuthenticated">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/">Home</router-link>
          <router-link to="/subjects">Subjects</router-link>
          <router-link to="/questions">Questions</router-link>
          <router-link to="/history">History</router-link>
          <template v-if="authStore.isAdmin">
            <router-link to="/admin/users">Users</router-link>
          </template>
        </div>
        <div class="nav-right">
          <span class="user-info">{{ authStore.userName }}</span>
          <router-link to="/profile" class="nav-profile">Profile</router-link>
          <button @click="handleLogout" class="nav-logout">Logout</button>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppToast from '@/components/common/AppToast.vue'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.restoreFromStorage()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: var(--color-bg);
}

nav {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  gap: 30px;
  justify-content: space-between;
  align-items: center;
}

.nav-left,
.nav-right {
  display: flex;
  gap: 24px;
  align-items: center;
}

nav a {
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  transition: all var(--transition);
  border: none;
  background: none;
  cursor: pointer;
}

nav a:hover {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
}

nav a.router-link-active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.12);
  font-weight: 600;
}

.nav-logout {
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  cursor: pointer;
  transition: all var(--transition);
}

.nav-logout:hover {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.08);
}

.user-info {
  color: var(--color-text);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info::before {
  content: '👤';
  font-size: 16px;
}

.nav-profile,
.nav-logout {
  padding: 8px 16px;
}

main {
  padding: 32px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

input:focus, 
select:focus, 
textarea:focus {
  border-color: var(--color-primary) !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-delete {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}
</style>