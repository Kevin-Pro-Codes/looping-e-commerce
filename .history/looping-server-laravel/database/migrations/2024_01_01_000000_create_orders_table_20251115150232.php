<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->string('customer_cpf')->nullable();
            
            // Monetary values
            $table->decimal('total', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('shipping', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            
            // Payment information
            $table->string('payment_method')->default('pix');
            $table->string('payment_status')->default('pending');
            $table->string('status')->default('pending');
            
            // Shipping address
            $table->string('shipping_street');
            $table->string('shipping_number');
            $table->string('shipping_complement')->nullable();
            $table->string('shipping_neighborhood');
            $table->string('shipping_city');
            $table->string('shipping_state', 2);
            $table->string('shipping_zip_code', 9);
            
            // JSON fields
            $table->json('items')->nullable();
            $table->json('pix_data')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('order_number');
            $table->index('customer_email');
            $table->index('status');
            $table->index('payment_status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};