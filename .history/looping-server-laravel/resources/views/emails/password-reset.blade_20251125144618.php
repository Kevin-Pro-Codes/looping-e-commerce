<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinir Senha - Looping</title>
</head>
<body style="font-family: Calibri; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #dc2626; font-family: Calibri; margin: 0;">Redefinir Senha</h2>
        </div>
        
        <p style="font-family: Calibri;">Olá,</p>
        
        <p style="font-family: Calibri;">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{ $resetUrl }}" style="background-color: #dc2626; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold; font-family: Calibri;">
                Redefinir Minha Senha
            </a>
        </div>
        
        <p style="font-family: Calibri;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="background: #f8f9fa; padding: 12px; word-break: break-all; border: 1px solid #e9ecef; font-family: Calibri; font-size: 14px;">
            {{ $resetUrl }}
        </p>
        
        <p style="font-family: Calibri;"><strong>Este link expira em 1 hora.</strong></p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 16px; margin: 25px 0; font-family: Calibri;">
            <strong>⚠️ Segurança:</strong> Se você não solicitou esta redefinição, ignore este email e verifique a segurança da sua conta.
        </div>
        
        <hr style="margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px; font-family: Calibri;">
            Atenciosamente,<br>
            <strong>Equipe Looping</strong>
        </p>
    </div>
</body>
</html>