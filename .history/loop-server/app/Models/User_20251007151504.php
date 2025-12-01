<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios'; // <-- add this

    protected $fillable = [
        'nome',
        'email',
        'password',
        'telefone',
        'cpf',
        'data_nascimento',
        'receber_marketing'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
