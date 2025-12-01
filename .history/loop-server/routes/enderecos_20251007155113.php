<?php

namespace App\Models; // Ensure the namespace is correct                    

class Endereco extends Model
{
    use HasFactory;

    protected $table = 'enderecos';

    // Columns that can be mass-assigned
    protected $fillable = [
        'usuario_id',
        'rua',
        'numero',
        'cidade',
        'estado',
        'cep'
    ];

    // Default values for attributes
    protected $attributes = [
        'rua' => null,
        'numero' => null,
        'cidade' => null,
        'estado' => null,
        'cep' => null,
    ];

    /**
     * Relationship: an address belongs to a user
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
