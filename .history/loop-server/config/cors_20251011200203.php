<?php

return [
    'paths' => ['api/*', 'sanctum/*', 'register', 'login', 'google-auth'],  // Add your auth endpoints here to ensure they're covered
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],  // Explicitly allow your frontend origin (include protocol and port)
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,  // Required for withCredentials and cookies
];