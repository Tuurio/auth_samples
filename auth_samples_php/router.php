<?php

// Log config once per server process (sanitized) to help verify env setup.
$configPrintedFlag = sys_get_temp_dir() . '/tuurio_auth_samples_config_printed';
if (!file_exists($configPrintedFlag)) {
    $config = require __DIR__ . '/src/config.php';
    $safeConfig = $config;
    if (!empty($safeConfig['client_secret'])) {
        $secret = (string) $safeConfig['client_secret'];
        $safeConfig['client_secret'] = '[set]';
        $safeConfig['client_secret_len'] = strlen($secret);
        $safeConfig['client_secret_sha256_prefix'] = substr(hash('sha256', $secret), 0, 8);
    }
    error_log('Tuurio config: ' . json_encode($safeConfig, JSON_UNESCAPED_SLASHES));
    @file_put_contents($configPrintedFlag, "1");
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicRoot = __DIR__ . '/public';

if ($path === '/auth/callback') {
    require $publicRoot . '/auth/callback/index.php';
    return true;
}

if ($path === '/' && (isset($_GET['code']) || isset($_GET['error']))) {
    require $publicRoot . '/auth/callback/index.php';
    return true;
}

if ($path === '/login') {
    require $publicRoot . '/login.php';
    return true;
}

if ($path === '/logout') {
    require $publicRoot . '/logout.php';
    return true;
}

if ($path === '/' || $path === '' || $path === '/index.php') {
    require $publicRoot . '/index.php';
    return true;
}

$target = realpath($publicRoot . $path);
if ($target && strpos($target, realpath($publicRoot)) === 0 && is_file($target)) {
    return false;
}

require $publicRoot . '/404.php';
return true;
