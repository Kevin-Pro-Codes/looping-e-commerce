<?php
// Database connection
$host = '127.0.0.1';
$db   = 'mysql';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$hashedPassword = password_hash('6bhcct53', PASSWORD_BCRYPT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$email = 'admin@finito.com';
$stmt->bind_param('ss', $hashedPassword, $email);
$stmt->execute();
