<script setup lang="ts">
import { useRouter } from 'vue-router';
import Shell from '../components/Shell.vue';
import Card from '../components/Card.vue';
import { authConfig } from '../auth';

const router = useRouter();
</script>

<template>
  <Shell :status="{ label: 'Route not found', tone: 'neutral' }" :authority-host="authConfig.authorityHost">
    <Card tone="hero">
      <div class="card-header">
        <span class="badge badge-error">404</span>
        <h2 class="card-title">Route not found</h2>
        <p class="muted">This path doesn't match any known endpoint.</p>
      </div>
      <div class="button-row">
        <button class="button ghost" @click="router.replace('/')">
          Go home
          <span class="btn-arrow">&rarr;</span>
        </button>
      </div>
    </Card>
  </Shell>
</template>
