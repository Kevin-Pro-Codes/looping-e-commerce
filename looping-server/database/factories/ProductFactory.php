<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            '_id' => $this->faker->unique()->uuid(),
            'title' => $this->faker->words(3, true),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'description' => $this->faker->paragraph(3),
            'category' => $this->faker->randomElement(['electronics', 'clothing', 'books', 'home', 'sports']),
            'image' => $this->faker->imageUrl(400, 400, 'products'),
        ];
    }
}
