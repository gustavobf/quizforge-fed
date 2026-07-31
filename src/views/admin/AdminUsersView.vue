<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>User Management</h1>
      <RouterLink to="/admin/users/create" class="btn-primary">
        + Create User
      </RouterLink>
    </div>

    <div v-if="isLoading" class="loading">Loading users...</div>

    <div v-else-if="users.length === 0" class="empty-state">
      <p>No users found</p>
      <RouterLink to="/admin/users/create" class="btn-primary">Create First User</RouterLink>
    </div>

    <div v-else class="users-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="{ 'badge-admin': user.role === 'ADMIN', 'badge-user': user.role === 'USER' }">
                {{ user.role }}
              </span>
            </td>
            <td>
              <button @click="handleDeleteUser(user.id)" class="btn-small btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h2>Delete User</h2>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
          <button @click="confirmDeleteUser" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { authService } from '@/services/authService'
import type { AuthUserResponse } from '@/types/auth.types'

const users = ref<AuthUserResponse[]>([])
const isLoading = ref(false)
const showDeleteConfirm = ref(false)
const selectedUserId = ref<number | null>(null)
const { showSuccess, showError } = useToast()

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  isLoading.value = true
  try {
    const response = await authService.adminGetUsers()
    users.value = response.data
  } catch {
    showError('Failed to load users')
  } finally {
    isLoading.value = false
  }
}

function handleDeleteUser(userId: number) {
  selectedUserId.value = userId
  showDeleteConfirm.value = true
}

async function confirmDeleteUser() {
  showDeleteConfirm.value = false
  if (selectedUserId.value === null) return

  try {
    users.value = users.value.filter((u) => u.id !== selectedUserId.value)
    showSuccess('User deleted successfully')
  } catch {
    showError('Failed to delete user')
    await loadUsers()
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: var(--color-text);
  margin: 0;
}

.btn-primary {
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text);
}

td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: var(--color-text);
}

tbody tr:hover {
  background: #f9f9f9;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-admin {
  background: #fff3cd;
  color: #856404;
}

.badge-user {
  background: #d1ecf1;
  color: #0c5460;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-bottom: 15px;
  color: var(--color-text);
}

.modal-content p {
  margin-bottom: 25px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: #f0f0f0;
  color: var(--color-text);
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
