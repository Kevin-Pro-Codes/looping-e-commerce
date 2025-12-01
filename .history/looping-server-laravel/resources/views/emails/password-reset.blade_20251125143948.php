<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinir Senha - Looping</title>
    <style>
        body { 
            font-family: Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 30px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .button { 
            background-color: #dc2626; 
            color: white; 
            padding: 14px 35px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            font-family: Calibri, Candara, Segoe, "Segoe UI", sans-serif;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #b91c1c;
        }
        .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 16px; 
            border-radius: 6px; 
            margin: 25px 0;
            font-family: Calibri, Candara, Segoe, "Segoe UI", sans-serif;
        }
        .url-box {
            background: #f8f9fa; 
            padding: 12px; 
            border-radius: 6px; 
            word-break: break-all;
            border: 1px solid #e9ecef;
            font-family: Consolas, Monaco, 'Andale Mono', monospace;
            font-size: 14px;
        }
        .header {
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
        }
        .footer {
            color: #666666; 
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }
        h2 {
            color: #dc2626;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            font-family: Calibri, Candara, Segoe, "Segoe UI", sans-serif;
        }
        p {
            font-size: 16px;
            margin-bottom: 16px;
            font-family: Calibri, Candara, Segoe, "Segoe UI", sans-serif;
        }
        strong {
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Redefinir Senha</h2>
        </div>
        
        <p>Olá,</p>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{ $resetUrl }}" class="button">
                Redefinir Minha Senha
            </a>
        </div>
        
        <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p class="url-box">
            {{ $resetUrl }}
        </p>
        
        <p><strong>Este link expira em 1 hora.</strong></p>
        
        <div class="warning">
            <strong>⚠️ Segurança:</strong> Se você não solicitou esta redefinição, ignore este email e verifique a segurança da sua conta.
        </div>
        
        <div class="footer">
            <p style="margin: 0;">
                Atenciosamente,<br>
                <strong>Equipe Looping</strong>
            </p>
        </div>
    </div>
</body>
</html>