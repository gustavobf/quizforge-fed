<template>
  <div class="subjects-page">
    <SubjectList />
  </div>
</template>

<script setup lang="ts">
import SubjectList from '@/components/subject/SubjectList.vue'
</script>

<style scoped>
.subjects-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>