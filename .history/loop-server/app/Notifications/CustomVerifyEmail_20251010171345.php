<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailNotification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends VerifyEmailNotification
{
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );
    }

public function toMail($notifiable)
{
    return (new MailMessage)
        ->subject('Confirme sua conta no Finito Shop')
        ->greeting('Olá, ' . $notifiable->name)
        ->line('Clique no botão abaixo para confirmar seu e-mail:')
        ->line("<a href='{$url}' style='display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px;'>Confirmar Conta</a>")

        ->line('Se você não conseguir clicar no botão "Confirmar Conta", copie e cole o URL abaixo no seu navegador:')
        ->line($this->verificationUrl($notifiable));
        
}

}
