<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page</title>

    <!-- CSRF Token for Laravel -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Optional: Include your React app bundle -->
    <!-- <script src="{{ mix('js/app.js') }}" defer></script> -->

</head>
<body>
    <div id="app">
        <!-- Your React app will mount here -->
    </div>

    <!-- Optional: Test button to POST using fetch and CSRF token -->
    <button id="testPost">Test POST</button>

    <script>
        document.getElementById('testPost').addEventListener('click', async () => {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            try {
                const res = await fetch('/api/auth/google-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({ token: 'dummy-token-for-test' })
                });

                const data = await res.json();
                console.log('Response:', data);
            } catch (error) {
                console.error('Error:', error);
            }
        });
    </script>
</body>
</html>
