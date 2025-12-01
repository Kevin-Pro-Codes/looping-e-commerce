<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_verified',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    /**
     * Mark the user as verified (updates both email_verified_at and is_verified)
     */
    public function markAsVerified()
    {
     

        // Option 2: raw query if needed
         DB::table('users')->where('id', $this->id)->update([
            'is_verified' => 1,
            'email_verified_at' => now()
        ]);

        return $this;
    }
}
