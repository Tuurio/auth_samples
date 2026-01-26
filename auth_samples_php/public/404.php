<?php

declare(strict_types=1);

session_start();

require __DIR__ . '/../src/view.php';

$status = ['label' => 'Route not found', 'tone' => 'neutral'];
$content = <<<HTML
  <section class="card">
    <div class="stack">
      <div class="status status-bad">404</div>
      <h2 class="card-title">This route doesn't exist.</h2>
      <p class="muted">Return to the login page to start a new session.</p>
      <a class="button ghost" href="/">Go home</a>
    </div>
  </section>
HTML;

render_page($status, $content);
