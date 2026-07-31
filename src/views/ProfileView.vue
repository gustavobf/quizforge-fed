<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>User Profile</h1>

      <div v-if="isLoading" class="loading">Loading profile...</div>

      <div v-else>
        <div class="profile-info">
          <div class="info-group">
            <label>Name</label>
            <p>{{ authStore.user?.name }}</p>
          </div>

          <div class="info-group">
            <label>Email</label>
            <p>{{ authStore.user?.email }}</p>
          </div>

          <div class="info-group">
            <label>Role</label>
            <p>
              <span class="badge" :class="{ 'badge-admin': authStore.isAdmin, 'badge-user': !authStore.isAdmin }">
                {{ authStore.user?.role }}
              </span>
            </p>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="showEditProfileModal = true" class="btn-secondary">
            ✏️ Edit Profile
          </button>
          <button @click="showChangePasswordModal = true" class="btn-secondary">
            🔐 Change Password
          </button>

          <button @click="handleLogout" class="btn-danger">
            🚪 Logout
          </button>
        </div>

        <button @click="showDeleteConfirm = true" class="btn-delete">
          Delete Account
        </button>
      </div>
    </div>

    <EditProfileModal v-if="showEditProfileModal" @close="showEditProfileModal = false" />

    <ChangePasswordModal v-if="showChangePasswordModal" @close="showChangePasswordModal = false" />

    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h2>Delete Account</h2>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
          <button @click="handleDeleteAccount" class="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import EditProfileModal from '@/components/auth/EditProfileModal.vue'
import ChangePasswordModal from '@/components/auth/ChangePasswordModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showSuccess } = useToast()

const isLoading = ref(false)
const showEditProfileModal = ref(false)
const showChangePasswordModal = ref(false)
const showDeleteConfirm = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    await authStore.loadProfile()
  } finally {
    isLoading.value = false
  }
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

async function handleDeleteAccount() {
  isLoading.value = true
  try {
    await authStore.deleteAccount()
    showSuccess('Account deleted')
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

h1 {
  margin-bottom: 30px;
  color: var(--color-text);
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.profile-info {
  margin-bottom: 40px;
}

.info-group {
  margin-bottom: 20px;
}

.info-group label {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.info-group p {
  margin: 0;
  color: var(--color-text-secondary);
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
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

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-secondary {
  flex: 1;
  padding: 12px;
  background: #f0f0f0;
  color: var(--color-text);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  flex: 1;
  padding: 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-delete {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #ffebee;
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
</style>
