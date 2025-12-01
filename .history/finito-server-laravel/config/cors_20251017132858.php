<?php

return [
    'paths' => ['*', 'api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register', 'profile', 'google-auth', 'products'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => ['*'], 
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*', 'Content-Type', 'X-Requested-With', 'X-CSRF-TOKEN', 'Accept', 'Authorization'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];