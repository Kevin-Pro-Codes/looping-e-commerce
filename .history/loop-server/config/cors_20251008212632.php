<?php

return [
    'paths' => ['sanctum/csrf-cookie', 'login', 'logout', 'register', 'api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'], // Adjust to your React port
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    'max_age' => 0,
];