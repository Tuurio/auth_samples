<script setup lang="ts">
import { onMounted } from 'vue';
import Shell from '../components/Shell.vue';
import Card from '../components/Card.vue';
import { authConfig, authManager, login } from '../auth';

onMounted(() => {
  authManager.removeUser().catch(() => undefined);
});
</script>

<template>
  <Shell :status="{ label: 'Signed out', tone: 'neutral' }" :authority-host="authConfig.authorityHost">
    <div class="stack">
      <Card tone="hero">
        <div class="card-header">
          <span class="badge badge-neutral">Session ended</span>
          <h2 class="card-title">Successfully signed out</h2>
          <p class="muted">
            Local browser state cleared. The identity provider has redirected back to the configured
            post-logout route.
          </p>
        </div>
        <div class="button-row">
          <button class="button primary" @click="login">
            Sign in again
            <span class="btn-arrow">&rarr;</span>
          </button>
          <span class="helper">Redirects to the identity provider.</span>
        </div>
      </Card>

      <Card>
        <div class="section-header">
          <div class="section-icon">OK</div>
          <div>
            <h3 class="section-title">Session state</h3>
            <p class="muted">Browser-stored user state has been removed before rendering this page.</p>
          </div>
        </div>
        <div class="stack">
          <div>
            <span class="eyebrow">Post-logout URI</span>
            <p class="muted">{{ authConfig.postLogoutRedirectUri }}</p>
          </div>
        </div>
      </Card>
    </div>
  </Shell>
</template>
