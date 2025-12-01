<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Composer autoload

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $name = $_POST['name'] ?? 'User';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'kevinprofessionalman@gmail.com'; // Gmail account
        $mail->Password   = 'YOUR_APP_PASSWORD';              // Use Gmail App Password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;
        $mail->SMTPDebug  = 2;                                // Debug output
        $mail->Debugoutput = 'html';

        // Recipients
        $mail->setFrom('kevinprofessionalman@gmail.com', 'Zero');
        $mail->addAddress($email, $name); // Send to the form-submitted email

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to Zero!';
        $mail->Body    = "<b>Hello $name!</b><br>Your account has been registered successfully.";
        $mail->AltBody = "Hello $name! Your account has been registered successfully.";

        $mail->send();

        echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
    }
}
