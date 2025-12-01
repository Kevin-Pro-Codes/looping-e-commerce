<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('wishlist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('product_id');
            $table->timestamps();
            
            // Add unique constraint to prevent duplicates
            $table->unique(['user_id', 'product_id']);
            
            // Add indexes for better performance
            $table->index('user_id');
            $table->index('product_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('wishlist');
    }
};