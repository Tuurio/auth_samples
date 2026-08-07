<script lang="ts">let { data } = $props();</script>
<main>
  <p>Protected workspace</p>
  <h1>Welcome {data.user.name ?? data.user.email ?? data.user.sub}</h1>
  <p>Your identity was validated by Tuurio ID before this server-side session was created.</p>
  <a href="/auth/logout">Sign out</a>
</main>
<style>:global(body){font-family:system-ui;background:#07111f;color:white}main{max-width:640px;margin:15vh auto;padding:3rem}p{color:#a7b6ca}a{color:#6ee7b7}</style>
