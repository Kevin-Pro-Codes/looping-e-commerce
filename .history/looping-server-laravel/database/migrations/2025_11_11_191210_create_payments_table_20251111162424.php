<?php
// In your migration file

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Only create table if it doesn't exist
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->string('stripe_payment_intent_id')->unique();
                $table->foreignId('order_id')->nullable()->constrained()->onDelete('cascade');
                $table->string('order_reference');
                $table->decimal('amount', 10, 2);
                $table->string('currency')->default('BRL');
                $table->string('payment_method');
                $table->string('status');
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
            
            echo "✅ Payments table created\n";
        } else {
            echo "✅ Payments table already exists\n";
        }
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};