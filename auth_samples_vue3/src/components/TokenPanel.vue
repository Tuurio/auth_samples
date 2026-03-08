<script setup lang="ts">
import { ref } from 'vue';
import Card from './Card.vue';

const props = defineProps<{
  title: string;
  token: string | undefined;
  decoded: Record<string, unknown> | null;
  description: string;
}>();

const copied = ref(false);

const handleCopy = async () => {
  if (!navigator.clipboard || !props.token) return;
  await navigator.clipboard.writeText(props.token);
  copied.value = true;
  window.setTimeout(() => copied.value = false, 1800);
};
</script>

<template>
  <Card>
    <div class="section-header">
      <div class="section-icon">{{ title === 'Access Token' ? 'AT' : 'ID' }}</div>
      <div>
        <h3 class="section-title">{{ title }}</h3>
        <p class="muted">{{ description }}</p>
      </div>
    </div>
    <details class="token-details">
      <summary class="token-summary">
        <span class="eyebrow">Raw JWT</span>
        <code class="token-preview">{{ token ? `${token.slice(0, 48)}...` : "Not provided" }}</code>
      </summary>
      <pre class="token-block">{{ token || "Not provided" }}</pre>
    </details>
    <div class="panel-header">
      <span class="eyebrow">Decoded payload</span>
      <button class="button small ghost" @click="handleCopy" :disabled="!token">
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
    <div class="token-claims">
      <pre class="code-block">{{ decoded ? JSON.stringify(decoded, null, 2) : "Not a JWT or unable to decode." }}</pre>
    </div>
  </Card>
</template>
