<template>
  <div class="questions">
    <h1>Question Management</h1>
    <QuestionImport @imported="onImportSuccess" />
  </div>
</template>

<script setup lang="ts">
import QuestionImport from '@/components/question/QuestionImport.vue'

function onImportSuccess(count: number) {
  console.log(`Imported ${count} questions`)
}
</script>

<style scoped>
.questions {
  padding: 20px;
}

.questions h1 {
  margin-bottom: 24px;
  color: #2c3e50;
}
</style>