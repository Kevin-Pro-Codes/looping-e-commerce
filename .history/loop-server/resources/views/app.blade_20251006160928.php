<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Loop Shop') }}</title>

    <!-- CSRF Token for API requests -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Optional: Load backend assets if needed -->
    @viteReactRefresh
  
</head>
<body class="antialiased bg-gray-50">

    <div class="container mx-auto p-6">
        <!-- Main page title -->
        <h1 class="text-4xl font-bold text-center mb-6">
            Welcome to {{ config('app.name', 'Finito Shop') }}
        </h1>

        <!-- Subheading -->
        <h2 class="text-2xl font-semibold text-center mb-4">
            Your one-stop shop for amazing products
        </h2>

        <!-- Intro paragraph -->
        <p class="text-center text-gray-700 mb-8">
            Explore our collections, enjoy exclusive deals, and sign in to your account to track orders and manage your profile.
        </p>

        <!-- Root div for React SPA -->
        <div id="root" class="mt-8">
            <!-- React will mount here if needed -->
        </div>
    </div>

    <!-- Fallback content for non-JS -->
    <noscript>
        <p class="text-center text-red-600">
            JavaScript is required to run this application.
        </p>
    </noscript>

    <script>
        // Pass CSRF token to JS if needed
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}'
        };
    </script>
</body>
</html>
