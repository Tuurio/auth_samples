<script setup lang="ts">
import { computed } from 'vue';
import type { User } from 'oidc-client-ts';
import Card from './Card.vue';
import TokenPanel from './TokenPanel.vue';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const scopeLabel = computed(() => props.user.scope || "openid profile email");

const accessTokenInfo = computed(() => decodeJwt(props.user.access_token));
const idTokenInfo = computed(() => decodeJwt(props.user.id_token ?? ""));

function formatUnixTime(unixSeconds: number | undefined) {
  if (!unixSeconds) return "unknown time";
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleString();
}

function decodeJwt(token: string): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    const payload = decodeBase64Url(payloadPart);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = padded.length % 4;
  const base64 = padLength ? padded.padEnd(padded.length + (4 - padLength), "=") : padded;
  return atob(base64);
}
</script>

<template>
  <div class="stack">
    <Card>
      <div class="card-header">
        <span class="eyebrow">Session ready</span>
        <h2 class="card-title">You're signed in</h2>
        <p class="muted">
          Tokens expire at {{ formatUnixTime(user.expires_at) }} and are scoped for {{ scopeLabel }}.
        </p>
      </div>
      <div class="button-row">
        <button class="button ghost" @click="emit('logout')">
          Logout
        </button>
        <span class="helper">Tokens expire automatically; logout revokes session.</span>
      </div>
    </Card>

    <div class="token-grid">
      <TokenPanel
        title="Access Token"
        :token="user.access_token"
        :decoded="accessTokenInfo"
        description="Used to call protected APIs."
      />
      <TokenPanel
        title="ID Token"
        :token="user.id_token"
        :decoded="idTokenInfo"
        description="Proves the authenticated user."
      />
    </div>

    <Card tone="soft">
      <h3 class="section-title">User profile</h3>
      <pre class="code-block">{{ JSON.stringify(user.profile, null, 2) }}</pre>
    </Card>
  </div>
</template>
