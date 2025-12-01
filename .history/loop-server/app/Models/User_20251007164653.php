<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios'; // <-- add this

 protected $fillable = [
    'nome', 'email', 'telefone', 'cpf', 'data_nascimento', 'avatar', 'receber_marketing'
];

protected $attributes = [
    'nome' => null,
    'email' => null,
    'telefone' => null,
    'cpf' => null,
    'data_nascimento' => null,
    'avatar' => null,
    'receber_marketing' => false,
];

}
