<script setup lang="ts">
defineProps<{
  title: string;
  body: string;
}>();
</script>

<template>
  <div class="feature">
    <h3>{{ title }}</h3>
    <p class="muted">{{ body }}</p>
  </div>
</template>
