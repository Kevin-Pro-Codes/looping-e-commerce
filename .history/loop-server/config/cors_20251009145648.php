<?php

return [
     'paths' => ['api/*', 'register', 'login', 'logout', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'], 
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    'max_age' => 0,
];