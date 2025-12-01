<?php

return [
     'paths' => ['api/*', 'register', 'login', 'logout', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], 
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    'max_age' => 0,
];