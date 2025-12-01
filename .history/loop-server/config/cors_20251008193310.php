<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '/register', '/login', '/logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];

