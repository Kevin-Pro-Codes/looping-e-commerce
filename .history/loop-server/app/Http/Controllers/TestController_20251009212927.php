<?php

use Illuminate\Support\Facades\Mail;

Mail::raw('This is a test email from Laravel using Brevo SMTP', function ($message) {
    $message->to('recipient@example.com')
            ->subject('Test Email via Brevo SMTP');
});