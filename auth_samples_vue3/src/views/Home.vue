<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import Shell from '../components/Shell.vue';
import Card from '../components/Card.vue';
import LoadingState from '../components/LoadingState.vue';
import LoginView from '../components/LoginView.vue';
import TokenView from '../components/TokenView.vue';
import { computed } from 'vue';

const { user, loading, error, login, logout } = useAuth();

const status = computed(() => {
  if (loading.value) return { label: "Checking session", tone: "neutral" } as const;
  if (user.value) return { label: "Authenticated", tone: "good" } as const;
  return { label: "Signed out", tone: "neutral" } as const;
});
</script>

<template>
  <Shell :status="status">
    <Card v-if="loading">
      <LoadingState title="Loading session" subtitle="Verifying tokens and session state." />
    </Card>
    <TokenView v-else-if="user" :user="user" @logout="logout" />
    <LoginView v-else :error="error" @login="login" />
  </Shell>
</template>
