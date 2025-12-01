<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // If using Composer
// If manual: require 'PHPMailer/PHPMailer.php'; etc.

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();                        // Use SMTP
    $mail->Host       = 'smtp.gmail.com'; // SMTP server
    $mail->SMTPAuth   = true;               // Enable SMTP authentication
    $mail->Username   = 'kevinprofessionalman@gmail.com'; // SMTP username
    $mail->Password   = '6bhcct53';            // SMTP password
    $mail->SMTPSecure = 'tls';              // Encryption: tls or ssl
    $mail->Port       = 587;                // TCP port
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';

    // Recipients
    $mail->setFrom('kevinprofessionalman@gmail.com', 'Zero');
    $mail->addAddress('ferreira.kevin94@gmail.com', 'Kevin');

    // Content
    $mail->isHTML(true);                    // HTML format
    $mail->Subject = 'Test Email';
    $mail->Body    = '<b>Hello!</b> This is a test email from PHPMailer.';
    $mail->AltBody = 'Hello! This is a test email from PHPMailer.';

    $mail->send();
    echo 'Email sent successfully!';
} catch (Exception $e) {
    echo "Mailer Error: {$mail->ErrorInfo}";
}
