<?php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_verified' => 'boolean',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'isVerified' => 'boolean',
    ];
}



public function sendEmailVerificationNotification()
{
    $this->notify(new VerifyEmail);
}
