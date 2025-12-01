<?php
// Database connection
$host = 'localhost';
$db   = 'mysql';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Hash the password
$hashedPassword = password_hash('6bhcct53', PASSWORD_BCRYPT);

// Insert admin user
$sql = "INSERT INTO users (name, email, password, type) 
        VALUES ('Admin', 'admin@finito', '$hashedPassword', 'admin')";

if ($conn->query($sql) === TRUE) {
    echo "Admin user created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();