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
        ->subject('Confirme sua conta na loja Finito!')
        ->greeting('Olá, ' . $notifiable->name)        
        ->line('Copie o link e cole no seu navegador para ativar sua conta:')
        ->line($this->verificationUrl($notifiable));
        
}

}
