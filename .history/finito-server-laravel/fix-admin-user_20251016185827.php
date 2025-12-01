<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Fixing Admin User (ID 1) ===\n";

// Find user with ID 1
$user = User::find(1);

if ($user) {
    echo "✅ User found: " . $user->email . " (ID: " . $user->id . ")\n";
    
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
    echo "\n=== Login Credentials ===\n";
    echo "Email: " . $user->email . "\n";
    echo "Password: 6bhcct53\n";
} else {
    echo "❌ User with ID 1 not found!\n";
}

echo "\nYou can now try logging in!\n";
