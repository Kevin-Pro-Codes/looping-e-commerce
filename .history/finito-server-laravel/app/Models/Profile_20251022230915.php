<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profile'; 
    protected $fillable = [
        'id',
        'name',
        'email',
        'tel',
        'cpf',
        'birth_date',       
        'marketing',
        'created_at',
        'updated_at',
    ];

    // Optional: link back to the user if needed
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
