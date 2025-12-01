<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;

echo "🧪 Testing PIX Payment Integration...\n";

$request = new Request([
    'amount' => 10.50,
    'orderId' => 'test_order_123',
    'customerInfo' => [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'cpf' => '123.456.789-00'
    ]
]);

$controller = new PaymentController();
$response = $controller->createPixPayment($request);

echo "Response: " . json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";