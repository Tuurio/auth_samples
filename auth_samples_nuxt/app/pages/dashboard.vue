<script setup lang="ts">
import '~/assets/main.css';
const { data: user } = await useFetch('/api/me');
</script>
<template><main><p class="eyebrow">Protected workspace</p><h1>Welcome {{ user?.name || user?.email || user?.sub }}</h1><div class="card"><p>The server validated this identity before creating the session.</p><a class="button" href="/auth/logout">Sign out</a></div></main></template>
