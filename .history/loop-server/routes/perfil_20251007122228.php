<?php
include 'db.php';
header('Content-Type: application/json');

$userId = $_GET['userId'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM perfil WHERE user_id = $userId";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_assoc());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO perfil (user_id, name, phone, cpf, birthDate, marketingOptIn)
            VALUES ($userId, '{$data['name']}', '{$data['phone']}', '{$data['cpf']}', '{$data['birthDate']}', '{$data['marketingOptIn']}')
            ON DUPLICATE KEY UPDATE
            name='{$data['name']}', phone='{$data['phone']}', cpf='{$data['cpf']}', birthDate='{$data['birthDate']}', marketingOptIn='{$data['marketingOptIn']}'";
    $conn->query($sql);
    echo json_encode(["message" => "Perfil atualizado"]);
}
?>