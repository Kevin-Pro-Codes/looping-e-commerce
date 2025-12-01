<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profile'; // your table name
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'telefone',
        'cpf',
        'birth_date',
        'avatar',
        'marketing',
    ];

    // Optional: link back to the user if needed
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
