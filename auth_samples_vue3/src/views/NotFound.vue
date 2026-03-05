<script setup lang="ts">
import { useRouter } from 'vue-router';
import Shell from '../components/Shell.vue';
import Card from '../components/Card.vue';
import { authConfig } from '../auth';

const router = useRouter();
</script>

<template>
  <Shell :status="{ label: 'Route not found', tone: 'neutral' }" :authority-host="authConfig.authorityHost">
    <Card>
      <div class="stack">
        <div class="status status-bad">404</div>
        <h2 class="card-title">This route doesn't exist.</h2>
        <p class="muted">Return to the login page to start a new session.</p>
        <button class="button ghost" @click="router.replace('/')">
          Go home
        </button>
      </div>
    </Card>
  </Shell>
</template>
