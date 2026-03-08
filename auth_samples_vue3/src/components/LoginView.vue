<script setup lang="ts">
import Card from './Card.vue';
import Feature from './Feature.vue';

defineProps<{
  error: string | null;
  authorityHost: string;
}>();

const emit = defineEmits<{
  (e: 'login'): void;
}>();
</script>

<template>
  <div class="stack">
    <Card tone="hero">
      <div class="card-header">
        <span class="eyebrow">OAuth 2.0 + OpenID Connect</span>
        <h2 class="card-title">Sign in to continue</h2>
        <p class="muted">
          Authenticate with the authorization code flow and PKCE. Tokens are exchanged in the
          browser and stored in session storage for this demo.
        </p>
      </div>
      <div class="button-row">
        <button class="button primary" @click="emit('login')">
          Continue with Tuurio ID
          <span class="btn-arrow">&rarr;</span>
        </button>
        <span class="helper">Redirects to {{ authorityHost }}</span>
      </div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
    </Card>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>PKCE by default</h3>
        <p class="muted">Proof Key for Code Exchange prevents authorization code interception attacks.</p>
      </div>
      <div class="feature-card">
        <h3>Short-lived tokens</h3>
        <p class="muted">Access tokens expire quickly, scoped to openid profile email.</p>
      </div>
      <div class="feature-card">
        <h3>Session aware</h3>
        <p class="muted">Token state stays in session storage and can be cleared with logout.</p>
      </div>
    </div>
    <Card v-if="false" tone="soft">
      <div class="feature-grid">
        <Feature title="PKCE by default" body="Proof Key for Code Exchange protects the code flow." />
        <Feature title="Short-lived tokens" body="Access tokens are scoped to openid profile email." />
        <Feature title="Session aware" body="Token state is persisted in session storage." />
      </div>
    </Card>
  </div>
</template>
