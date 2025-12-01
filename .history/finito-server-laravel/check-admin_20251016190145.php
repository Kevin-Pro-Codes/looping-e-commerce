<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== Listing All Admin Users ===\n";

// 1️⃣ Get all admin users
$admins = User::where('is_admin', true)->get();

if ($admins->isEmpty()) {
    echo "❌ No admin users found.\n";
    exit;
}

// 2️⃣ Display admin info
foreach ($admins as $admin) {
    echo "---------------------------\n";
    echo "ID: " . $admin->id . "\n";
    echo "Name: " . $admin->name . "\n";
    echo "Email: " . $admin->email . "\n";
    echo "Email Verified: " . ($admin->is_verified ? 'Yes' : 'No') . "\n";
    echo "Created At: " . $admin->created_at . "\n";
    echo "Updated At: " . $admin->updated_at . "\n";
}

echo "---------------------------\n";
echo "Total Admins: " . $admins->count() . "\n";
