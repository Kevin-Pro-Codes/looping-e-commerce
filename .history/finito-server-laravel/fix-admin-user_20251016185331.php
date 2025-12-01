<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Fixing Admin User ===\n";

// Check if admin user exists
$user = User::where('email', 'admin@finito.com')->first();

if ($user) {
    echo "✅ User found: " . $user->email . "\n";
    
    // Fix the password hashing
    $user->password = Hash::make('6bhcct53');
    $user->is_verified = true;
    $user->email_verified_at = now();
    $user->is_admin = true; // Add admin flag
    $user->save();
    
    echo "✅ Admin user updated successfully!\n";
    echo "   - Password hashed with Bcrypt\n";
    echo "   - Email verified\n";
    echo "   - Admin flag set to true\n";
} else {
    echo "❌ Admin user not found. Creating new admin user...\n";
    
    // Create new admin user
    $user = User::create([
        'name' => 'Admin',
        'email' => 'admin@finito.com',
        'password' => Hash::make('6bhcct53'),
        'is_verified' => true,
        'email_verified_at' => now(),
        'is_admin' => true
    ]);
    
    echo "✅ Admin user created with ID: " . $user->id . "\n";
}

echo "\n=== Login Credentials ===\n";
echo "Email: admin@finito.com\n";
echo "Password: 6bhcct53\n";
echo "\nYou can now try logging in!\n";
