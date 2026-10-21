<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'title' => 'Camiseta Looping Branca',
                'price' => 59.90,
                'description' => 'Camiseta de algodão premium com logo Looping.',
                'category' => 'Roupas',
                'image' => 'https://via.placeholder.com/500x500.png?text=Camiseta+Branca',
            ],
            [
                'title' => 'Camiseta Looping Preta',
                'price' => 59.90,
                'description' => 'Camiseta de algodão premium com logo Looping.',
                'category' => 'Roupas',
                'image' => 'https://via.placeholder.com/500x500.png?text=Camiseta+Preta',
            ],
            [
                'title' => 'Caneca Looping',
                'price' => 35.00,
                'description' => 'Caneca de cerâmica 325ml.',
                'category' => 'Acessórios',
                'image' => 'https://via.placeholder.com/500x500.png?text=Caneca',
            ],
            [
                'title' => 'Moleton Looping',
                'price' => 129.90,
                'description' => 'Moleton confortável para dias frios.',
                'category' => 'Roupas',
                'image' => 'https://via.placeholder.com/500x500.png?text=Moleton',
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(['title' => $product['title']], $product);
        }
    }
}
