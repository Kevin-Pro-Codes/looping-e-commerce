<?php
// Database connection
$host = 'localhost';
$db   = 'mysql';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Hash the password
$hashedPassword = password_hash('6bhcct53', PASSWORD_BCRYPT);

// Update the existing admin user
$sql = "UPDATE users SET password='$hashedPassword' WHERE email='admin@finito'";

if ($conn->query($sql) === TRUE) {
    echo "Admin password updated successfully";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();