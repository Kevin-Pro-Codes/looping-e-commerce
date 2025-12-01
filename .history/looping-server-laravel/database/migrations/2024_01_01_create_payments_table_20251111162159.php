<?php
// database/migrations/2024_01_01_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_payment_intent_id')->unique();
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('order_reference');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('BRL');
            $table->string('payment_method'); // pix, credit_card, boleto
            $table->string('status'); // pending, succeeded, canceled, failed
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_cpf')->nullable();
            $table->text('pix_qr_code')->nullable();
            $table->text('pix_code')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('paid_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['status', 'expires_at']);
            $table->index('order_reference');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
}