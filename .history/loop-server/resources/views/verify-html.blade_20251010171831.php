<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirme sua Conta</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 50px; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 20px;">
                            <h1>Olá {{ $user->name }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #555555;">
                            <p>Clique no botão abaixo para confirmar seu e-mail:</p>

                            <!-- Button -->
                            <a href="{{ $verificationLink }}" 
                               style="display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
                               Confirmar Conta
                            </a>

                            <!-- Plain link as fallback -->
                            <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                                Se você não conseguir clicar no botão acima, copie e cole este link no navegador:<br>
                                <a href="{{ $verificationLink }}" style="color: #1d4ed8;">{{ $verificationLink }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; font-size: 12px; color: #aaaaaa;">
                            © {{ date('Y') }} Finito Shop. Todos os direitos reservados.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
