<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Auth\Notifications\VerifyEmail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    
use HasApiTokens, HasFactory, Notifiable;

protected $fillable = [
    'google_id',
    'name',              
    'email',
    'password',
    'is_verified',
    'email_verified_at',
    'telefone',
    'cpf',
    'data_nascimento',
    'avatar',
    'receber_marketing',
];

    protected $casts = [        
        'is_verified' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmail);
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