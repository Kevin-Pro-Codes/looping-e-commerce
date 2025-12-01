<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Admin User Check ===\n";

// Check if admin user exists
$user = User::where('email', 'admin@finito.com')->first();

if ($user) {
    echo "✅ User found: " . $user->email . "\n";
    echo "Current password: " . $user->password . "\n";
    
    // Check if password is hashed (bcrypt starts with $2y$)
    if (strpos($user->password, '$2y$') === 0) {
        echo "✅ Password is already hashed with bcrypt\n";
    } else {
        echo "❌ Password is NOT hashed - fixing now...\n";
        
        // Hash the password with bcrypt
        $user->password = Hash::make('6bhcct53');
        $user->is_verified = true;
        $user->email_verified_at = now();
        $user->save();
        
        echo "✅ Password has been hashed and user updated!\n";
    }
} else {
    echo "❌ User not found - creating admin user...\n";
    
    // Create new admin user
    $user = User::create([
        'name' => 'Admin',
        'email' => 'admin@finito.com',
        'password' => Hash::make('6bhcct53'),
        'is_verified' => true,
        'email_verified_at' => now()
    ]);
    
    echo "✅ Admin user created with ID: " . $user->id . "\n";
}

echo "\n=== Test Login ===\n";
echo "Email: admin@finito.com\n";
echo "Password: 6bhcct53\n";
echo "You can now try logging in!\n";
