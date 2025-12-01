<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
        
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin-top: 50px; border-radius: 8px; padding: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <h1 style="color: #333333;">Hello {{ $user->nome }},</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #555555;">
                            <p>Thank you for registering on our site. Please verify your email by clicking the button below:</p>
                            <a href="{{ $verificationLink }}" 
                               style="display: inline-block; padding: 12px 24px; margin-top: 20px; font-size: 16px; color: #ffffff; background-color: #1d4ed8; text-decoration: none; border-radius: 6px;">
                               Verify Email
                            </a>
                            <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                                If you did not create an account, no further action is required.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; font-size: 12px; color: #aaaaaa;">
                            © {{ date('Y') }} Your Company. All rights reserved.
                        </td>
                    </tr>
                </table>
    
        </tr>
    </table>
</body>
</html>
