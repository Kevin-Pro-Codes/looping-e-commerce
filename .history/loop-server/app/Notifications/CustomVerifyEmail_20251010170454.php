<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends Notification
{
    public function via($notifiable)
    {
        return ['mail'];
    }

    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    public function toMail($notifiable)
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Confirme sua conta no Finito Shop')
            ->greeting('Olá, ' . $notifiable->name)
            ->line('Clique no botão abaixo para confirmar seu e-mail:')
            // Manually create button with HTML to avoid English fallback
            ->line("<a href='{$url}' style='display:inline-block;padding:12px 24px;background-color:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:6px;'>Confirmar Conta</a>")
            ->line('Se você não conseguir clicar no botão acima, copie e cole este link no seu navegador:')
            ->line($url)
            ->html(); // Treat MailMessage content as HTML
    }
}
