<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="loading">
    <div class="spinner" />
    <div>
      <h2 class="card-title">{{ title }}</h2>
      <p class="muted">{{ subtitle }}</p>
    </div>
  </div>
</template>
