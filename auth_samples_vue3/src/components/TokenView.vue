<script setup lang="ts">
import { computed } from 'vue';
import type { User } from 'oidc-client-ts';
import Card from './Card.vue';
import TokenPanel from './TokenPanel.vue';
import { authConfig } from '../auth';

const props = defineProps<{
  user: User;
  profile: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const scopeLabel = computed(() => props.user.scope || "openid profile email");
const discoveryUrl = computed(() => `${authConfig.authority}/.well-known/openid-configuration`);

const accessTokenInfo = computed(() => decodeJwt(props.user.access_token));
const idTokenInfo = computed(() => decodeJwt(props.user.id_token ?? ""));

function formatDuration(seconds: number) {
  const abs = Math.abs(seconds);
  if (abs < 60) return `${abs}s`;
  if (abs < 3600) {
    const minutes = Math.floor(abs / 60);
    const remainder = abs % 60;
    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

const timingLabel = computed(() => {
  const parts: string[] = [];
  const issuedAt = accessTokenInfo.value?.iat;
  if (typeof issuedAt === 'number') {
    parts.push(`Issued ${formatDuration(Math.floor(Date.now() / 1000) - issuedAt)} ago`);
  }
  if (props.user.expires_at) {
    const remaining = props.user.expires_at - Math.floor(Date.now() / 1000);
    parts.push(remaining > 0 ? `${formatDuration(remaining)} remaining` : `expired ${formatDuration(Math.abs(remaining))} ago`);
  }
  return parts.join(' · ');
});

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
    <Card tone="hero">
      <div class="card-header">
        <span class="badge badge-success">Authenticated</span>
        <h2 class="card-title">Session active</h2>
        <p class="muted">
          <code>{{ scopeLabel }}</code>
          <template v-if="timingLabel"> · {{ timingLabel }}</template>
        </p>
      </div>
      <div class="button-row">
        <button class="button ghost" @click="emit('logout')">
          Log out and end session
        </button>
        <span class="helper">Clears local state and redirects through the identity provider.</span>
      </div>
    </Card>

    <Card>
      <div class="section-header">
        <div class="section-icon">UI</div>
        <div>
          <h3 class="section-title">User profile</h3>
          <p class="muted">Claims returned by the UserInfo endpoint.</p>
        </div>
      </div>
      <pre class="code-block">
        {{ profile ? JSON.stringify(profile, null, 2) : "No profile data." }}
      </pre>
    </Card>

    <TokenPanel
      title="Access Token"
      :token="user.access_token"
      :decoded="accessTokenInfo"
      description="Authorizes API requests on behalf of the user."
    />
    <TokenPanel
      title="ID Token"
      :token="user.id_token"
      :decoded="idTokenInfo"
      description="Cryptographic proof of the authenticated identity."
    />

    <Card>
      <div class="section-header">
        <div class="section-icon">ID</div>
        <div>
          <h3 class="section-title">Provider discovery</h3>
          <p class="muted">OIDC metadata used to resolve endpoints and session management URLs.</p>
        </div>
      </div>
      <div class="stack">
        <div>
          <span class="eyebrow">Authority</span>
          <p><a class="link" :href="authConfig.authority" target="_blank" rel="noreferrer">{{ authConfig.authority }}</a></p>
        </div>
        <div>
          <span class="eyebrow">Discovery document</span>
          <p><a class="link" :href="discoveryUrl" target="_blank" rel="noreferrer">{{ discoveryUrl }}</a></p>
        </div>
      </div>
    </Card>
  </div>
</template>
