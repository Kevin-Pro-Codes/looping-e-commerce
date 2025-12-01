<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifique seu Email - Looping</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #dc2626, #ef4444);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .email-header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .email-body {
            padding: 40px 30px;
        }
        .email-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .email-footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>Verifique seu Email</h1>
            <p>Ative sua conta na Looping</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <h2>Olá, {{ $user->name }}! 👋</h2>
            
            <p><strong>Obrigado por se registrar na Looping!</strong></p>
            
            <p>Para completar seu cadastro e começar a explorar nossos produtos, 
            precisamos verificar seu endereço de email.</p>
            
            <p>Clique no botão abaixo para verificar sua conta:</p>
            
            <a href="{{ $verificationUrl }}" class="email-button">
                ✅ Verificar Meu Email
            </a>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                <strong>Link alternativo:</strong><br>
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <span style="color: #dc2626; word-break: break-all;">{{ $verificationUrl }}</span>
            </p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 25px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    ⏰ <strong>Este link expira em 24 horas</strong>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p>© {{ date('Y') }} Looping. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>