<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinir Senha</title>
</head>
<body>
    <h2>Redefinição de Senha</h2>
    <p>Olá!</p>
    <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
    
    <a href="{{ $resetUrl }}" style="
        background-color: #dc2626; 
        color: white; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 5px; 
        display: inline-block;
        margin: 10px 0;">
        Redefinir Senha
    </a>
    
    <p>Este link expira em <strong>{{ $expiresIn }}</strong>.</p>
    
    <p>Se você não solicitou esta redefinição, ignore este email.</p>
    
    <p>Atenciosamente,<br>Equipe Looping</p>
</body>
</html>