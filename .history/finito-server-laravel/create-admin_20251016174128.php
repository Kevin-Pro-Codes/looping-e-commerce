<?php
// Database connection
$servername = '127.0.0.1';
$username = 'root';
$password = '';
$dbname = 'finito'; // Change this to your actual database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Hash the password
$hashedPassword = password_hash('6bhcct53', PASSWORD_BCRYPT);

// Update the existing admin user (using prepared statement for security)
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$email = 'admin@finito.com';
$stmt->bind_param('ss', $hashedPassword, $email);

if ($stmt->execute()) {
    echo "Admin password updated successfully. Rows affected: " . $stmt->affected_rows;
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();

$conn->close();