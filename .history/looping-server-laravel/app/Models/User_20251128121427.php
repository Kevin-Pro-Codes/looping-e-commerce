<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Auth\Notifications\VerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Messages\MailMessage;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'google_id',
        'name',              
        'email', 
        'is_verified',
        'is_admin',   
        'email_verified_at',
        'password',
        'remember_token',
        'created_at',
        'updated_at',
        'type',
    ];

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        // ✅ CHANGED: Use custom verification email instead of default
        $this->notify(new CustomVerifyEmail);
    }

    /**
     * Get the email address that should be used for verification.
     *
     * @return string
     */
    public function getEmailForVerification()
    {
        return $this->email;
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}

/**
 * ✅ ADDED: Custom Verify Email Notification Class
 * Place this at the bottom of the same User.php file
 */
class CustomVerifyEmail extends VerifyEmail
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifique seu Email - Looping') // ✅ Custom subject
            ->view('emails.verify-email', [ // ✅ Use your custom template
                'user' => $notifiable,
                'verificationUrl' => $verificationUrl,
            ]);
    }
}