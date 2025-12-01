<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Creating a New Admin User ===\n";

// Set your new admin credentials
$adminEmail = 'newadmin@finito.com';
$adminPassword = 'SecureAdmin123'; // plaintext password (will be hashed)
$adminName = 'New Admin';

// 1️⃣ Check if admin already exists
$existing = User::where('email', $adminEmail)->first();

if ($existing) {
    echo "❌ Admin with email $adminEmail already exists (ID: {$existing->id})\n";
    echo "You can login using this account.\n";
    exit;
}

// 2️⃣ Create new admin user
$newAdmin = User::create([
    'name' => $adminName,
    'email' => $adminEmail,
    'password' => Hash::make($adminPassword), // bcrypt hash
    'is_verified' => true,
    'email_verified_at' => now(),
    'is_admin' => true,                        // admin flag
]);

// 3️⃣ Output credentials
echo "✅ New admin created successfully!\n";
echo "ID: " . $newAdmin->id . "\n";
echo "Email: " . $newAdmin->email . "\n";
echo "Password: $adminPassword\n";
echo "\nYou can now log in with this account!\n";
