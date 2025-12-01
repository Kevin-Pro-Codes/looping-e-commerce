<?php

return [
    'paths' => ['api/*', 'sanctum/*', 'google-auth', 'register', 'login'], // Ensure 'google-auth' is included
    'allowed_methods' => ['*'], // Allow all methods (GET, POST, OPTIONS, etc.)
    'allowed_origins' => ['http://localhost:3000'], // Explicitly allow your frontend
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Allow all headers (e.g., Content-Type, X-XSRF-TOKEN)
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Required for withCredentials
];