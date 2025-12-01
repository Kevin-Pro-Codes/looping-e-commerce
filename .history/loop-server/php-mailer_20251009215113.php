<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Composer autoload

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();                                            // Use SMTP
    $mail->Host       = 'smtp-relay.brevo.com';                // SMTP server (Brevo)
    $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
    $mail->Username   = 'your_smtp_username';                  // SMTP username
    $mail->Password   = 'your_smtp_password';                  // SMTP password
    $mail->SMTPSecure = 'tls';                                  // Encryption: 'tls' or 'ssl'
    $mail->Port       = 587;                                    // SMTP port

    // Recipients
    $mail->setFrom('verified@example.com', 'Your App');         // Must be verified in Brevo
    $mail->addAddress('recipient@gmail.com', 'Recipient');      // Recipient email

    // Content
    $mail->isHTML(true);                                        // HTML format
    $mail->Subject = 'Test Email from PHPMailer';
    $mail->Body    = '<b>Hello!</b> This is a test email sent with PHPMailer via Brevo SMTP.';
    $mail->AltBody = 'Hello! This is a test email sent with PHPMailer via Brevo SMTP.';

    $mail->send();
    echo 'Email sent successfully!';
} catch (Exception $e) {
    echo "Mailer Error: {$mail->ErrorInfo}";
}
