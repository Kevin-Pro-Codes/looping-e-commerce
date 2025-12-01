<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinir Senha - Looping</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { 
            background-color: #dc2626; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
        }
        .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #dc2626;">Redefinir Senha</h2>
        </div>
        
        <p>Olá,</p>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" class="button">
                Redefinir Minha Senha
            </a>
        </div>
        
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            {{ $resetUrl }}
        </p>
        
        <p><strong>Este link expira em 1 hora.</strong></p>
        
        <div class="warning">
            <strong>⚠️ Segurança:</strong> Se você não solicitou esta redefinição, ignore este email e verifique a segurança da sua conta.
        </div>
        
        <hr style="margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
            Atenciosamente,<br>
            <strong>Equipe Looping</strong>
        </p>
    </div>
</body>
</html>