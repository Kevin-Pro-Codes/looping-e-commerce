<?php
// Database connection
$host = 'localhost';
$db   = 'mysql';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}

// Admin data
$name = 'Admin';
$email = 'admin@finito';
$password = password_hash('6bhcct53', PASSWORD_BCRYPT);
$type = 'admin';

// Insert query
$sql = "INSERT INTO users (name, email, password, type) VALUES (:name, :email, :password, :type)";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':password' => $password,
    ':type' => $type
]);

echo "Admin user created successfully!";
