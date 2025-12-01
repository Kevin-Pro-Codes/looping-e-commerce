<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $token;

    public function __construct($user, $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    public function build()
    {
        $verificationLink = url("/verify-email?token={$this->token}");
        return $this->subject('Verify your email')
                    ->view('emails.verify')
                    ->with([
                        'user' => $this->user,
                        'verificationLink' => $verificationLink
                    ]);
    }
}
