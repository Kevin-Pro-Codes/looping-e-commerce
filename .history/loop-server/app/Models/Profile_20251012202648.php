<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profile'; // <-- points to your profile table
    protected $fillable = ['user_id','name','email','telefone','cpf','birth_date','avatar','marketing'];
}
