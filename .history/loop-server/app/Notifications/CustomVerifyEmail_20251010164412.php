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
            ->line('Clique no botão abaixo para confirmar sua conta:')
            ->action('Confirmar', $this->verificationUrl($notifiable))
            ->line('Se você não criou a conta, ignore este e-mail.');
    }
}
