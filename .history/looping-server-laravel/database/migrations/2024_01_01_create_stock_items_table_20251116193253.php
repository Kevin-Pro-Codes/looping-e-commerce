<?php
// database/migrations/2024_01_01_create_stock_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockItemsTable extends Migration
{
    public function up()
    {
        Schema::create('stock_items', function (Blueprint $table) {
            $table->id();
            $table->string('product_id'); // PROD-001
            $table->string('name'); // Camiseta Finito Branca
            $table->string('sku'); // CT-FINITO-WHITE-P
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
            
            // Unique constraint for product + color + size combination
            $table->unique(['product_id', 'color', 'size']);
            $table->index(['product_id']); // For grouping by product
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_items');
    }
}