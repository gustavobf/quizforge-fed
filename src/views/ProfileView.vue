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
  max-width: 700px;
  margin: 32px auto;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  padding: 48px;
}

h1 {
  margin-bottom: 40px;
  color: var(--color-text);
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-light);
  font-size: 16px;
}

.profile-info {
  margin-bottom: 40px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.03));
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(99, 102, 241, 0.1);
}

.info-group {
  margin-bottom: 24px;
}

.info-group:last-child {
  margin-bottom: 0;
}

.info-group label {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 10px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-group p {
  margin: 0;
  color: var(--color-text);
  padding: 12px 16px;
  background: white;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border: 2px solid rgba(99, 102, 241, 0.3);
}

.badge-admin {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 146, 60, 0.15));
  border: 2px solid rgba(245, 158, 11, 0.3);
  color: #b45309;
}

.badge-user {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15));
  border: 2px solid rgba(16, 185, 129, 0.3);
  color: #047857;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn-secondary,
.btn-danger {
  flex: 1;
  min-width: 140px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all var(--transition);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: linear-gradient(135deg, var(--color-border-light), var(--color-bg));
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-delete {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all var(--transition);
}

.btn-delete:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  margin-bottom: 16px;
  color: var(--color-text);
  font-size: 20px;
}

.modal-content p {
  margin-bottom: 30px;
  color: var(--color-text-light);
  line-height: 1.6;
  font-size: 15px;
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
