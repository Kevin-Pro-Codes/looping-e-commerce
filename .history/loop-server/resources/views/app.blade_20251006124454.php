<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- CSRF Token for API requests -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Optional: Load backend assets if needed -->
    @viteReactRefresh

</head>
<body class="antialiased bg-gray-50">

    <!-- Root div for React SPA -->
    <div id="root"></div>

    <!-- Optional: fallback content if JS fails -->
    <noscript>
        <p>JavaScript is required to run this app.</p>
    </noscript>

    <!-- Optional backend JS -->
    <script>
        // Example: pass CSRF token to JS
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}'
        };
    </script>

    <!-- Optional: include backend JS if using Vite -->
    {{-- <script type="module" src="{{ asset('build/app.js') }}"></script> --}}
</body>
</html>
