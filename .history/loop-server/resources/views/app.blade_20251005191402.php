<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Example: load compiled JS/CSS if using Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body class="antialiased">
    <div id="app">
        @yield('content')
    </div>
</body>
</html>
