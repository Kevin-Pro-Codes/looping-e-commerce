<?php

use Illuminate\Support\Facades\Mail;

Mail::raw('This is a test email from Laravel using Brevo SMTP', function ($message) {
    $message->to('ferreira.kevin94@gmail.com')
            ->subject('Test Email via Brevo SMTP');
});