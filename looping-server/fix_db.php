<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::dropIfExists('boleto_details');

Schema::create('boleto_details', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('order_id');
    $table->string('payer_name');
    $table->string('payer_cpf', 14);
    $table->string('barcode')->nullable();
    $table->text('pdf_url')->nullable();
    $table->string('transaction_id')->nullable();
    $table->decimal('amount', 10, 2);
    $table->string('status')->default('pending');
    $table->timestamps();
});

echo "Table boleto_details recreated successfully!\n";
