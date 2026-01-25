<script setup lang="ts">
defineProps<{
  status: { label: string; tone: "good" | "neutral" };
}>();
</script>

<template>
  <div class="app">
    <aside class="side-panel">
      <div class="brand">
        <div class="logo-mark">tu</div>
        <div>
          <p class="brand-name">Tuurio Auth Studio</p>
          <p class="brand-subtitle">OIDC playground for OAuth 2.1</p>
        </div>
      </div>
      <div class="side-card">
        <h1>Design for secure sign-in.</h1>
        <p class="muted">
          A minimal Vue client that signs in with OpenID Connect, displays decoded tokens,
          and supports secure logout redirects.
        </p>
        <div class="status-row">
          <span class="status" :class="`status-${status.tone}`">{{ status.label }}</span>
          <span class="muted">Authority: test.id.tuurio.com</span>
        </div>
      </div>
      <div class="side-list">
        <div>
          <span class="eyebrow">Architecture</span>
          <p>Authorization code flow + PKCE</p>
        </div>
        <div>
          <span class="eyebrow">Storage</span>
          <p>Session storage for tokens</p>
        </div>
        <div>
          <span class="eyebrow">Scope</span>
          <p>openid profile email</p>
        </div>
      </div>
    </aside>
    <main class="main-panel">
      <slot></slot>
    </main>
  </div>
</template>
