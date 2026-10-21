<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Illuminate\Support\Facades\File;

$uploadDir = storage_path('app/public/uploads');
if (!File::exists($uploadDir)) {
    echo "Upload directory does not exist: {$uploadDir}\n";
    exit(1);
}

$files = File::files($uploadDir);

if (empty($files)) {
    echo "No image files found in {$uploadDir}\n";
    exit(1);
}

$fileNames = array_values(array_map(function($file) {
    return 'uploads/' . $file->getFilename();
}, $files));

echo "Found " . count($fileNames) . " image files on disk.\n";

$products = Product::all();
$updated = 0;

foreach ($products as $index => $product) {
    $imagePath = $product->image ?? '';
    // Strip domain and /storage/ prefix
    $cleanPath = preg_replace('/^https?:\/\/[^\/]+\/(storage\/)?/', '', $imagePath);
    $fullPath = storage_path('app/public/' . ltrim($cleanPath, '/'));
    
    if (empty($imagePath) || !File::exists($fullPath) || str_contains($imagePath, 'placeholder.com') || str_contains($imagePath, 'tshirt')) {
        $assignedImage = $fileNames[$index % count($fileNames)];
        $product->image = $assignedImage;
        $product->save();
        $updated++;
        echo "Matched product #{$product->_id} ('{$product->title}') -> {$assignedImage}\n";
    }
}

echo "\nSuccessfully matched and updated {$updated} products with actual image files!\n";
