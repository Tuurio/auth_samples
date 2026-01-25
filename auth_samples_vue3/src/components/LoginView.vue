<script setup lang="ts">
import Card from './Card.vue';
import Feature from './Feature.vue';

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  (e: 'login'): void;
}>();
</script>

<template>
  <div class="stack">
    <Card>
      <div class="card-header">
        <span class="eyebrow">OAuth 2.1 + OpenID Connect</span>
        <h2 class="card-title">Sign in to continue</h2>
        <p class="muted">
          This app uses the authorization code flow with PKCE to fetch tokens securely for a
          browser-based client.
        </p>
      </div>
      <div class="button-row">
        <button class="button primary" @click="emit('login')">
          Continue with Tuurio ID
        </button>
        <span class="helper">You'll be redirected to test.id.tuurio.com</span>
      </div>
      <div v-if="error" class="status status-bad">{{ error }}</div>
    </Card>
    <Card tone="soft">
      <div class="feature-grid">
        <Feature title="PKCE by default" body="Proof Key for Code Exchange protects the code flow." />
        <Feature title="Short-lived tokens" body="Access tokens are scoped to openid profile email." />
        <Feature title="Session aware" body="Token state is persisted in session storage." />
      </div>
    </Card>
  </div>
</template>
