<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Fixing Admin User (ID 1) ===\n";

// 1️⃣ Find user with ID 1
$user = User::find(1);

if ($user) {
    echo "✅ User found: " . $user->email . " (ID: " . $user->id . ")\n";
    
    // 2️⃣ Update the user to be admin with a bcrypt password
    $user->password = Hash::make('6bhcct53');  // bcrypt hashed password
    $user->is_verified = true;                  // mark email verified
    $user->email_verified_at = now();           // timestamp
    $user->is_admin = true;                     // admin flag
    $user->save();                              // save changes
    
    echo "✅ Admin user updated successfully!\n";
    echo "   - Password hashed with Bcrypt\n";
    echo "   - Email verified\n";
    echo "   - Admin flag set to true\n";
    
    // 3️⃣ Show login credentials
    echo "\n=== Login Credentials ===\n";
    echo "Email: " . $user->email . "\n";
    echo "Password: 6bhcct53\n";
} else {
    echo "❌ User with ID 1 not found!\n";
}

echo "\nYou can now try logging in!\n";
