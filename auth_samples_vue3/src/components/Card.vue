<script setup lang="ts">
withDefaults(defineProps<{
  tone?: "solid" | "soft" | "panel" | "hero";
}>(), {
  tone: "solid"
});
</script>

<template>
  <section class="card" :class="`card-${tone}`">
    <slot></slot>
  </section>
</template>
