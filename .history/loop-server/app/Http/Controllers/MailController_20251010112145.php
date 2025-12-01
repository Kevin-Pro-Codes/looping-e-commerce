<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailController extends Controller
{
    public function sendMail(Request $request)
    {
        $mail = new PHPMailer(true);

        try {
            // Configurações do servidor
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION');
            $mail->Port = env('MAIL_PORT');

            // Remetente e Destinatário
            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($request->email, $request->name);

            // Conteúdo
            $mail->isHTML(true);
            $mail->Subject = 'Bem-vindo ao nosso site!';
            $mail->Body    = "<h1>Olá, {$request->name}</h1><p>Seu cadastro foi realizado com sucesso!</p>";
            $mail->AltBody = "Olá, {$request->name}. Seu cadastro foi realizado com sucesso!";

            $mail->send();
            return response()->json(['message' => 'Email enviado com sucesso!'], 200);

        } catch (Exception $e) {
            return response()->json(['error' => "Erro ao enviar: {$mail->ErrorInfo}"], 500);
        }
    }
}
