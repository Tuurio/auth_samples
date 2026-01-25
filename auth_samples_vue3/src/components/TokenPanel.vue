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
  <Card tone="panel">
    <div class="panel-header">
      <div>
        <h3 class="panel-title">{{ title }}</h3>
        <p class="muted">{{ description }}</p>
      </div>
      <button class="button small ghost" @click="handleCopy" :disabled="!token">
        {{ copied ? "Copied" : "Copy" }}
      </button>
    </div>
    <pre class="token-block">{{ token || "Not provided" }}</pre>
    <div class="token-claims">
      <span class="eyebrow">Decoded claims</span>
      <pre class="code-block">{{ decoded ? JSON.stringify(decoded, null, 2) : "Not a JWT or unable to decode." }}</pre>
    </div>
  </Card>
</template>
