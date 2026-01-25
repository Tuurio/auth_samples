<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import Shell from '../components/Shell.vue';
import Card from '../components/Card.vue';
import LoadingState from '../components/LoadingState.vue';

const router = useRouter();
const { handleCallback } = useAuth();
const error = ref<string | null>(null);

onMounted(() => {
    handleCallback()
      .then(() => {
        router.replace("/");
      })
      .catch((err) => {
        error.value = err instanceof Error ? err.message : "Login failed.";
      });
});
</script>

<template>
  <Shell :status="{ label: 'Finalizing login', tone: 'neutral' }">
    <Card>
      <div v-if="error" class="stack">
        <div class="status status-bad">Authentication error</div>
        <h2 class="card-title">We couldn't finish signing you in.</h2>
        <p class="muted">{{ error }}</p>
        <button class="button ghost" @click="router.replace('/')">
          Back to login
        </button>
      </div>
      <LoadingState v-else title="Completing sign-in" subtitle="Processing the authorization response." />
    </Card>
  </Shell>
</template>
