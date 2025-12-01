<?php
// Quick fix for admin user - direct database approach
$servername = '127.0.0.1';
$username = 'root';
$password = '';
$dbname = 'finito';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Hash the password with PHP's password_hash function
$hashedPassword = password_hash('6bhcct53', PASSWORD_BCRYPT);

// Update the admin user
$sql = "UPDATE users SET 
        password = ?, 
        is_verified = 1, 
        email_verified_at = NOW(),
        is_admin = 1
        WHERE email = 'admin@finito.com'";

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $hashedPassword);

if ($stmt->execute()) {
    echo "✅ Admin user updated successfully!\n";
    echo "   - Password hashed with Bcrypt\n";
    echo "   - Email verified\n";
    echo "   - Admin flag set to true\n";
    echo "\nLogin credentials:\n";
    echo "Email: admin@finito.com\n";
    echo "Password: 6bhcct53\n";
} else {
    echo "❌ Error: " . $stmt->error . "\n";
}

$stmt->close();
$conn->close();
