<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'register', 'verify'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // MUST be true for cookies
];
