<svelte:head><title>Tuurio ID · SvelteKit</title></svelte:head>
<main>
  <p class="eyebrow">SvelteKit · EU-hosted identity</p>
  <h1>Secure sign-in, native to SvelteKit.</h1>
  <p>Authorization Code with PKCE, server-side sessions, protected routes, and complete logout.</p>
  <a class="button" href="/auth/login">Continue with Tuurio ID</a>
</main>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; background: #07111f; color: #eaf2ff; }
  main { max-width: 640px; margin: 15vh auto; padding: 3rem; }
  h1 { font-size: clamp(2.5rem, 7vw, 5rem); line-height: 1; }
  p { color: #a7b6ca; line-height: 1.6; }
  .eyebrow { color: #6ee7b7; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
  .button { display: inline-block; margin-top: 1rem; padding: .9rem 1.2rem; border-radius: .7rem; background: #0d6efd; color: white; text-decoration: none; font-weight: 700; }
</style>
