<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name', 
        'email', 
        'password',
        'telefone',
        'cpf',
        'data_nascimento',
        'avatar',
        'receber_marketing'
    ];

    protected $hidden = [
        'password', 
        'remember_token',
    ];
}
