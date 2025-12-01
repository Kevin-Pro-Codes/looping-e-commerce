<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirme sua Conta</title>
</head>
<body>
    <h1>Olá {{ $user->name }}</h1>
    <p>Clique no botão abaixo para confirmar seu e-mail:</p>
    <a href="{{ $verificationLink }}" 
       style="display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;">
       Confirmar Conta
    </a>
    <p>Se você não conseguir clicar no botão acima, copie e cole este link no navegador:<br>{{ $verificationLink }}</p>
    <p>Obrigado,<br>Equipe Finito Shop</p>
</body>
</html>
