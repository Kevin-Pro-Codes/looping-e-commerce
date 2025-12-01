<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock', function (Blueprint $table) {
            $table->id();
            $table->string('product_id');
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('category');
            $table->string('supplier');
            $table->decimal('cost', 10, 2);
            $table->string('color');
            $table->string('size');
            $table->integer('stock')->default(0);
            $table->integer('reserved')->default(0);
            $table->integer('incoming')->default(0);
            $table->date('last_updated');
            $table->timestamps();
            
            $table->index('product_id');
            $table->index('sku');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};
