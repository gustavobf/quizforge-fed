<template>
  <div class="subject-list">
    <div class="header">
      <h2>📚 Subjects</h2>
      <button @click="openCreateModal" class="btn-primary">
        + New Subject
      </button>
    </div>

    <div v-if="subjectStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading subjects...</p>
    </div>

    <div v-else-if="subjectStore.error" class="error">
      {{ subjectStore.error }}
      <button @click="loadSubjects" class="btn-secondary">Retry</button>
    </div>

    <div v-else-if="subjectStore.subjects.length === 0" class="empty">
      <span class="empty-icon">📭</span>
      <p>No subjects created yet</p>
      <button @click="openCreateModal" class="btn-primary">Create your first subject</button>
    </div>

    <div v-else class="subjects-grid">
      <div
        v-for="subject in subjectStore.subjects"
        :key="subject.id"
        class="subject-card"
      >
        <div class="subject-content">
          <h3 class="subject-name">{{ subject.name }}</h3>
          <p v-if="subject.description" class="subject-description">
            {{ subject.description }}
          </p>
          <p v-else class="subject-description no-description">
            No description
          </p>
        </div>
        <div class="subject-actions">
          <button @click="openEditModal(subject)" class="btn-edit">✏️</button>
          <button @click="confirmDelete(subject)" class="btn-delete">🗑️</button>
        </div>
      </div>
    </div>

    <CreateSubjectModal
      :is-open="isModalOpen"
      :editing-subject="editingSubject"
      @close="closeModal"
      @success="onSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSubjectStore } from '@/stores/subjectStore'
import { useToast } from '@/composables/useToast'
import CreateSubjectModal from './CreateSubjectModal.vue'
import type { Subject } from '@/api/subjectApi'

const subjectStore = useSubjectStore()
const { showError, showSuccess } = useToast()

const isModalOpen = ref(false)
const editingSubject = ref<Subject | null>(null)

function openCreateModal() {
  editingSubject.value = null
  isModalOpen.value = true
}

function openEditModal(subject: Subject) {
  editingSubject.value = subject
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingSubject.value = null
}

function onSuccess() {
  loadSubjects()
}

async function confirmDelete(subject: Subject) {
  if (confirm(`Are you sure you want to delete "${subject.name}"?`)) {
    try {
      await subjectStore.deleteSubject(subject.id)
    } catch (error) {
    }
  }
}

async function loadSubjects() {
  await subjectStore.loadSubjects()
}

onMounted(() => {
  loadSubjects()
})
</script>

<style scoped>
.subject-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #2c3e50;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  transition: transform 0.2s;
}

.btn-edit:hover {
  transform: scale(1.2);
}

.btn-delete:hover {
  transform: scale(1.2);
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.subject-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}

.subject-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subject-content {
  flex: 1;
}

.subject-name {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.subject-description {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.subject-description.no-description {
  color: #adb5bd;
  font-style: italic;
}

.subject-actions {
  display: flex;
  gap: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.empty p {
  margin-bottom: 16px;
}
</style>