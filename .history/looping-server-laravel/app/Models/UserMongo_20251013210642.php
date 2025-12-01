<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class UserMongo extends Eloquent
{
    protected $connection = 'mongodb';
    protected $collection = 'users'; // your MongoDB collection

    protected $fillable = ['name', 'email'];
}
